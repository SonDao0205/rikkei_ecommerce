package payment

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"rikkei-ecommerce/internal/domain/auth"
)

const payOSBaseURL = "https://api-merchant.payos.vn"
const maxPayOSBody = 1 << 20

type Handler struct {
	db     *sql.DB
	cfg    auth.Config
	logger *log.Logger
	client *http.Client
}

func newHandler(db *sql.DB, cfg auth.Config, logger *log.Logger) *Handler {
	return &Handler{db: db, cfg: cfg, logger: logger, client: &http.Client{Timeout: 12 * time.Second}}
}

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, cfg auth.Config, logger *log.Logger) {
	h := newHandler(db, cfg, logger)
	mux.Handle("POST /api/v1/orders/{id}/payment", security.RequireRole("CLIENT", h.createPayOSLink))
	mux.Handle("GET /api/v1/orders/{id}/payment", security.RequireRole("CLIENT", h.getPayment))
	mux.HandleFunc("POST /api/v1/webhooks/payos", h.payOSWebhook)
}

type payOSLinkResponse struct {
	Code string `json:"code"`
	Desc string `json:"desc"`
	Data struct {
		ID            string `json:"id"`
		PaymentLinkID string `json:"paymentLinkId"`
		CheckoutURL   string `json:"checkoutUrl"`
		QRCode        string `json:"qrCode"`
		Status        string `json:"status"`
		OrderCode     int64  `json:"orderCode"`
		Amount        int64  `json:"amount"`
		AmountPaid    int64  `json:"amountPaid"`
	} `json:"data"`
}

func (h *Handler) createPayOSLink(w http.ResponseWriter, r *http.Request) {
	if h.cfg.PayOSClientID == "" {
		writeError(w, http.StatusServiceUnavailable, "payment_provider_unavailable", "Chuyển khoản trực tuyến hiện chưa được cấu hình.")
		return
	}
	uid, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Vui lòng đăng nhập lại.")
		return
	}
	orderID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || orderID < 1 {
		writeError(w, http.StatusBadRequest, "invalid_order", "Đơn hàng không hợp lệ.")
		return
	}
	p := payOSPayment{orderID: orderID}
	var amount float64
	var methodCode string
	var hasTerminalShopOrder bool
	err = h.db.QueryRowContext(r.Context(), `SELECT p.id,p.amount,pm.code,p.status,UNIX_TIMESTAMP(p.created_at)+?,
		EXISTS(SELECT 1 FROM shop_orders so WHERE so.order_id=o.id AND so.status IN ('CANCELLED','RETURNED'))
		FROM payments p
		JOIN payment_methods pm ON pm.id=p.payment_method_id
		JOIN orders o ON o.id=p.order_id
		WHERE p.order_id=? AND o.user_id=?`, payOSPaymentWindowSeconds, orderID, uid).Scan(&p.id, &amount, &methodCode, &p.status, &p.expiresAt, &hasTerminalShopOrder)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng.")
		return
	}
	if err != nil {
		h.fail(w, err)
		return
	}
	if methodCode != "BANK_TRANSFER" {
		writeError(w, http.StatusConflict, "payment_method_mismatch", "Đơn hàng không sử dụng chuyển khoản.")
		return
	}
	if p.status == "PAID" {
		writeError(w, http.StatusConflict, "already_paid", "Đơn hàng đã được thanh toán.")
		return
	}
	if p.status != "PENDING" || hasTerminalShopOrder {
		writeError(w, http.StatusConflict, "payment_not_payable", "Đơn hàng hiện không thể thanh toán.")
		return
	}
	if amount <= 0 || math.Trunc(amount) != amount || amount > 999999999 {
		writeError(w, http.StatusUnprocessableEntity, "invalid_payment_amount", "Số tiền đơn hàng không hợp lệ để thanh toán.")
		return
	}
	p.amount = int64(amount)
	var state, checkoutURL, qr string
	var linkID sql.NullString
	var updatedAt time.Time
	err = h.db.QueryRowContext(r.Context(), `SELECT id,status,COALESCE(checkout_url,''),COALESCE(qr_code,''),provider_link_id,updated_at FROM payment_attempts WHERE payment_id=?`, p.id).Scan(&p.attemptID, &state, &checkoutURL, &qr, &linkID, &updatedAt)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		h.fail(w, err)
		return
	}
	p.hasLink = linkID.Valid
	if p.expired() || state == "CANCELLED" || state == "EXPIRED" {
		if !(state == "CREATING" && time.Since(updatedAt) < payOSCreationLease) {
			if refreshErr := h.refreshPayOSPayment(r.Context(), p); refreshErr != nil {
				h.logger.Printf("PayOS reconciliation deferred payment_id=%d: %v", p.id, refreshErr)
			}
		}
		writeError(w, http.StatusConflict, "payment_link_ended", "Đã hết thời gian mở liên kết. Hãy xem kết quả thanh toán của đơn hàng.")
		return
	}
	if state == "PENDING" && checkoutURL != "" {
		if refreshErr := h.refreshPayOSPayment(r.Context(), p); refreshErr != nil {
			h.logger.Printf("PayOS reconciliation deferred payment_id=%d: %v", p.id, refreshErr)
		}
		if err := h.db.QueryRowContext(r.Context(), `SELECT status FROM payments WHERE id=?`, p.id).Scan(&p.status); err != nil {
			h.fail(w, err)
			return
		}
		if p.status != "PENDING" {
			writeError(w, http.StatusConflict, "payment_link_ended", "Liên kết đã kết thúc. Hãy xem kết quả thanh toán của đơn hàng.")
			return
		}
		writePayOSLink(w, checkoutURL, qr, linkID.String)
		return
	}

	var res sql.Result
	switch {
	case !p.attemptID.Valid:
		// Claim the link only while the payment is open. Reconciliation locks this payment
		// before expiring a checkout that has no attempt.
		res, err = h.db.ExecContext(r.Context(), `INSERT IGNORE INTO payment_attempts(payment_id,provider,provider_order_code,status)
			SELECT id,'PAYOS',id,'CREATING' FROM payments WHERE id=? AND status='PENDING' AND UNIX_TIMESTAMP() < ?`, p.id, p.expiresAt)
	case state == "CREATING" && time.Since(updatedAt) >= payOSCreationLease:
		res, err = h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET updated_at=CURRENT_TIMESTAMP
			WHERE id=? AND status='CREATING' AND updated_at=? AND UNIX_TIMESTAMP() < ?`, p.attemptID.Int64, updatedAt, p.expiresAt)
	case state == "FAILED":
		res, err = h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET status='CREATING',failure_code=NULL
			WHERE id=? AND status='FAILED' AND UNIX_TIMESTAMP() < ?`, p.attemptID.Int64, p.expiresAt)
	}
	if err != nil {
		h.fail(w, err)
		return
	}
	if res == nil {
		writeError(w, http.StatusConflict, "payment_initializing", "Đang khởi tạo thanh toán. Vui lòng tải lại sau ít giây.")
		return
	}
	changed, _ := res.RowsAffected()
	if changed == 0 {
		writeError(w, http.StatusConflict, "payment_initializing", "Hãy tải lại trang để cập nhật trạng thái thanh toán.")
		return
	}
	if !p.attemptID.Valid {
		p.attemptID.Int64, err = res.LastInsertId()
		if err != nil {
			h.fail(w, err)
			return
		}
		p.attemptID.Valid = true
	}

	ctx, cancel := context.WithTimeout(r.Context(), 16*time.Second)
	defer cancel()
	// Recover a provider-side create that completed before the HTTP connection was lost.
	result, lookupErr := h.getPayOSLink(ctx, strconv.FormatInt(p.id, 10))
	if lookupErr == nil && result.Code == "00" && result.Data.ID != "" {
		if err := result.validatePayment(p); err != nil {
			h.fail(w, err)
			return
		}
		status := strings.ToUpper(result.Data.Status)
		switch status {
		case "PAID", "CANCELLED", "EXPIRED":
			if err := h.applyPayOSStatus(r.Context(), p, status); err != nil {
				h.fail(w, err)
				return
			}
			writeError(w, http.StatusConflict, "payment_link_ended", "Liên kết đã kết thúc. Hãy xem kết quả thanh toán của đơn hàng.")
			return
		case "PENDING":
			if result.Data.CheckoutURL == "" {
				result.Data.CheckoutURL = "https://pay.payos.vn/web/" + url.PathEscape(result.Data.ID)
			}
		}
	} else if !p.expired() {
		result, err = h.createPayOSLinkRequest(ctx, p.id, orderID, p.amount, p.expiresAt)
		if err != nil {
			_, _ = h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET status='FAILED',failure_code='PROVIDER_UNAVAILABLE' WHERE id=? AND status='CREATING'`, p.attemptID.Int64)
			h.logger.Printf("PayOS link creation failed payment_id=%d: %v", p.id, err)
			writeError(w, http.StatusBadGateway, "payment_provider_error", "Không tạo được liên kết thanh toán. Bạn có thể thử lại trong thời hạn thanh toán.")
			return
		}
	}
	if p.expired() {
		writeError(w, http.StatusConflict, "payment_link_ended", "Đã hết thời gian mở liên kết. Hãy xem kết quả thanh toán của đơn hàng.")
		return
	}
	if err := result.validatePayment(p); err != nil {
		h.fail(w, err)
		return
	}
	if !strings.EqualFold(result.Data.Status, "PENDING") || result.Data.CheckoutURL == "" || result.Data.ID == "" {
		h.fail(w, fmt.Errorf("payOS response missing an active payment link"))
		return
	}
	res, err = h.db.ExecContext(r.Context(), `UPDATE payment_attempts a JOIN payments p ON p.id=a.payment_id
		SET a.provider_link_id=?,a.checkout_url=?,a.qr_code=?,a.expires_at=FROM_UNIXTIME(?),a.status='PENDING'
		WHERE a.id=? AND a.status='CREATING' AND p.status='PENDING'`, result.Data.ID, result.Data.CheckoutURL, result.Data.QRCode, p.expiresAt, p.attemptID.Int64)
	if err != nil {
		h.fail(w, err)
		return
	}
	if changed, _ := res.RowsAffected(); changed == 0 {
		writeError(w, http.StatusConflict, "payment_link_ended", "Hãy xem kết quả thanh toán của đơn hàng.")
		return
	}
	writePayOSLink(w, result.Data.CheckoutURL, result.Data.QRCode, result.Data.ID)
}

func writePayOSLink(w http.ResponseWriter, checkoutURL, qr, linkID string) {
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"status": "PENDING", "checkout_url": checkoutURL, "qr_code": qr, "payment_link_id": linkID}})
}

var errPayOSLinkNotFound = errors.New("PayOS payment link not found")

func (h *Handler) getPayOSLink(ctx context.Context, id string) (payOSLinkResponse, error) {
	return h.payOSLinkRequest(ctx, url.PathEscape(id), nil)
}

func (h *Handler) payOSLinkRequest(ctx context.Context, path string, body []byte) (payOSLinkResponse, error) {
	var out payOSLinkResponse
	method := http.MethodGet
	if body != nil {
		method = http.MethodPost
	}
	req, err := http.NewRequestWithContext(ctx, method, payOSBaseURL+"/v2/payment-requests/"+path, bytes.NewReader(body))
	if err != nil {
		return out, err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	h.authorize(req)
	resp, err := h.client.Do(req)
	if err != nil {
		return out, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNotFound {
		return out, errPayOSLinkNotFound
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return out, fmt.Errorf("payOS payment request status %d", resp.StatusCode)
	}
	err = json.NewDecoder(io.LimitReader(resp.Body, maxPayOSBody)).Decode(&out)
	return out, err
}

func (h *Handler) createPayOSLinkRequest(ctx context.Context, paymentID, orderID, amount, expiresAt int64) (payOSLinkResponse, error) {
	var out payOSLinkResponse
	orderCode := paymentID
	description := payOSDescription(paymentID)
	returnURL := h.cfg.PayOSReturnURL
	if strings.Contains(returnURL, "?") {
		returnURL += "&"
	} else {
		returnURL += "?"
	}
	returnURL += url.Values{"orderId": []string{strconv.FormatInt(orderID, 10)}}.Encode()
	cancelURL := h.cfg.PayOSCancelURL
	if strings.Contains(cancelURL, "?") {
		cancelURL += "&"
	} else {
		cancelURL += "?"
	}
	cancelURL += url.Values{"orderId": []string{strconv.FormatInt(orderID, 10)}}.Encode()
	canonical := fmt.Sprintf("amount=%d&cancelUrl=%s&description=%s&orderCode=%d&returnUrl=%s", amount, cancelURL, description, orderCode, returnURL)
	mac := hmac.New(sha256.New, []byte(h.cfg.PayOSChecksumKey))
	_, _ = mac.Write([]byte(canonical))
	sig := hex.EncodeToString(mac.Sum(nil))
	body := map[string]any{"orderCode": orderCode, "amount": amount, "description": description, "returnUrl": returnURL, "cancelUrl": cancelURL, "signature": sig, "expiredAt": expiresAt}
	data, e := json.Marshal(body)
	if e != nil {
		return out, e
	}
	req, e := http.NewRequestWithContext(ctx, http.MethodPost, payOSBaseURL+"/v2/payment-requests", bytes.NewReader(data))
	if e != nil {
		return out, e
	}
	req.Header.Set("Content-Type", "application/json")
	h.authorize(req)
	resp, e := h.client.Do(req)
	if e != nil {
		return out, e
	}
	defer resp.Body.Close()
	b, e := io.ReadAll(io.LimitReader(resp.Body, maxPayOSBody))
	if e != nil {
		return out, e
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return out, fmt.Errorf("payOS create status %d", resp.StatusCode)
	}
	e = json.Unmarshal(b, &out)
	if e == nil && out.Data.ID == "" {
		out.Data.ID = out.Data.PaymentLinkID
	}
	if e == nil && out.Code != "00" {
		desc := strings.TrimSpace(out.Desc)
		if desc == "" {
			desc = "no description returned"
		}
		e = fmt.Errorf("payOS rejected payment request code=%s desc=%q", out.Code, desc)
	}
	return out, e
}

func payOSDescription(paymentID int64) string {
	// Some bank accounts limit transfer descriptions to nine characters.
	// orderCode remains the unique payment identifier; this is only a display reference.
	return fmt.Sprintf("PAY%06d", paymentID%1_000_000)
}

func (h *Handler) authorize(r *http.Request) {
	r.Header.Set("x-client-id", h.cfg.PayOSClientID)
	r.Header.Set("x-api-key", h.cfg.PayOSAPIKey)
}

func (h *Handler) getPayment(w http.ResponseWriter, r *http.Request) {
	uid, e := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if e != nil {
		writeError(w, 401, "unauthorized", "Vui lòng đăng nhập lại.")
		return
	}
	orderID, e := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if e != nil || orderID < 1 {
		writeError(w, 400, "invalid_order", "Đơn hàng không hợp lệ.")
		return
	}
	p := payOSPayment{orderID: orderID}
	var amount float64
	var method, txn, attemptStatus string
	var paidAt, attemptUpdatedAt sql.NullTime
	var link, qr sql.NullString
	var orderCancelled bool
	load := func() error {
		return h.db.QueryRowContext(r.Context(), `SELECT p.id,p.amount,p.status,pm.code,COALESCE(p.transaction_ref,''),p.paid_at,
			UNIX_TIMESTAMP(p.created_at)+?,a.id,a.provider_link_id IS NOT NULL,COALESCE(a.status,''),a.updated_at,a.checkout_url,a.qr_code,
			NOT EXISTS(SELECT 1 FROM shop_orders so WHERE so.order_id=o.id AND so.status<>'CANCELLED')
			FROM payments p JOIN payment_methods pm ON pm.id=p.payment_method_id JOIN orders o ON o.id=p.order_id
			LEFT JOIN payment_attempts a ON a.payment_id=p.id AND a.provider='PAYOS'
			WHERE o.id=? AND o.user_id=?`, payOSPaymentWindowSeconds, orderID, uid).
			Scan(&p.id, &amount, &p.status, &method, &txn, &paidAt, &p.expiresAt, &p.attemptID, &p.hasLink, &attemptStatus, &attemptUpdatedAt, &link, &qr, &orderCancelled)
	}
	if e = load(); errors.Is(e, sql.ErrNoRows) {
		writeError(w, 404, "order_not_found", "Không tìm thấy đơn hàng.")
		return
	}
	if e != nil {
		h.fail(w, e)
		return
	}
	if method == "BANK_TRANSFER" && (p.status == "PENDING" || (p.status == "FAILED" && !orderCancelled)) &&
		!(attemptStatus == "CREATING" && time.Since(attemptUpdatedAt.Time) < payOSCreationLease) {
		p.amount = int64(amount)
		if err := h.refreshPayOSPayment(r.Context(), p); err != nil {
			h.logger.Printf("PayOS reconciliation deferred payment_id=%d: %v", p.id, err)
		} else if err := load(); err != nil {
			h.fail(w, err)
			return
		}
	}
	data := map[string]any{"payment_id": p.id, "amount": amount, "status": p.status, "method": method, "transaction_ref": txn, "order_cancelled": orderCancelled}
	if paidAt.Valid {
		data["paid_at"] = paidAt.Time
	}
	if method == "BANK_TRANSFER" && p.status == "PENDING" && !p.expired() && !orderCancelled {
		if link.Valid {
			data["checkout_url"] = link.String
		}
		if qr.Valid {
			data["qr_code"] = qr.String
		}
	}
	if method == "BANK_TRANSFER" {
		data["expires_at"] = time.Unix(p.expiresAt, 0).UTC()
		data["link_expired"] = p.expired()
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": data})
}

type webhookPayload struct {
	Code      string         `json:"code"`
	Desc      string         `json:"desc"`
	Success   bool           `json:"success"`
	Data      map[string]any `json:"data"`
	Signature string         `json:"signature"`
}

func (h *Handler) payOSWebhook(w http.ResponseWriter, r *http.Request) {
	if h.cfg.PayOSChecksumKey == "" {
		http.Error(w, "payment provider unavailable", http.StatusServiceUnavailable)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxPayOSBody)
	defer r.Body.Close()
	var p webhookPayload
	if e := json.NewDecoder(r.Body).Decode(&p); e != nil {
		http.Error(w, "invalid webhook", http.StatusBadRequest)
		return
	}
	if !verifyPayOSSignature(p.Data, p.Signature, h.cfg.PayOSChecksumKey) {
		http.Error(w, "invalid signature", http.StatusUnauthorized)
		return
	}
	orderCode, e := numberFromJSON(p.Data["orderCode"])
	if e != nil || orderCode < 1 {
		http.Error(w, "invalid order code", http.StatusBadRequest)
		return
	}
	amount, e := numberFromJSON(p.Data["amount"])
	if e != nil {
		http.Error(w, "invalid amount", http.StatusBadRequest)
		return
	}
	ref, _ := p.Data["reference"].(string)
	if ref == "" {
		http.Error(w, "missing reference", http.StatusBadRequest)
		return
	}
	code, _ := p.Data["code"].(string)
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		http.Error(w, "temporary failure", 500)
		return
	}
	defer tx.Rollback()
	var attemptID, paymentID, orderID, expected int64
	var paymentStatus string
	e = tx.QueryRowContext(r.Context(), `SELECT id FROM orders WHERE id=(SELECT order_id FROM payments WHERE id=?) FOR UPDATE`, orderCode).Scan(&orderID)
	if e == nil {
		e = tx.QueryRowContext(r.Context(), `SELECT a.id,p.id,CAST(p.amount AS SIGNED),p.status
			FROM payments p JOIN payment_attempts a ON p.id=a.payment_id
			WHERE p.id=? AND a.provider='PAYOS' AND a.provider_order_code=? FOR UPDATE`, orderCode, orderCode).
			Scan(&attemptID, &paymentID, &expected, &paymentStatus)
	}
	if errors.Is(e, sql.ErrNoRows) {
		http.Error(w, "payment not found", 404)
		return
	}
	if e != nil {
		http.Error(w, "temporary failure", 500)
		return
	}
	if expected != amount {
		http.Error(w, "amount mismatch", 400)
		return
	}
	encoded, _ := json.Marshal(p)
	eventKey := ref
	res, e := tx.ExecContext(r.Context(), `INSERT IGNORE INTO payment_webhook_events(provider,event_key,payment_attempt_id,payload) VALUES ('PAYOS',?,?,?)`, eventKey, attemptID, string(encoded))
	if e != nil {
		http.Error(w, "temporary failure", 500)
		return
	}
	n, _ := res.RowsAffected()
	if n > 0 && code == "00" && p.Success {
		if e = h.recordPayOSPaid(r.Context(), tx, paymentID, attemptID, paymentStatus, ref, string(encoded)); e != nil {
			h.logger.Printf("PayOS webhook settlement failed payment_id=%d: %v", paymentID, e)
			http.Error(w, "temporary failure", 500)
			return
		}
	} else if n > 0 && !p.Success {
		if _, e = tx.ExecContext(r.Context(), `UPDATE payment_attempts SET status='FAILED',failure_code=? WHERE id=? AND status='PENDING'`, code, attemptID); e != nil {
			http.Error(w, "temporary failure", 500)
			return
		}
	}
	if e = tx.Commit(); e != nil {
		http.Error(w, "temporary failure", 500)
		return
	}
	h.logger.Printf("payOS webhook processed payment_id=%d order_code=%d result=%s", paymentID, orderCode, code)
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]any{"acknowledged": true}})
}

func verifyPayOSSignature(data map[string]any, signature, key string) bool {
	if len(data) == 0 || signature == "" {
		return false
	}
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		v := data[k]
		s := ""
		if v != nil {
			switch x := v.(type) {
			case string:
				s = x
			case float64:
				s = strconv.FormatFloat(x, 'f', -1, 64)
			case bool:
				s = strconv.FormatBool(x)
			default:
				b, _ := json.Marshal(x)
				s = string(b)
			}
		}
		parts = append(parts, k+"="+s)
	}
	m := hmac.New(sha256.New, []byte(key))
	_, _ = m.Write([]byte(strings.Join(parts, "&")))
	expected := m.Sum(nil)
	provided, e := hex.DecodeString(signature)
	return e == nil && hmac.Equal(expected, provided)
}
func numberFromJSON(v any) (int64, error) {
	switch x := v.(type) {
	case float64:
		if math.Trunc(x) != x || x < 0 || x > math.MaxInt64 {
			return 0, fmt.Errorf("invalid number")
		}
		return int64(x), nil
	case json.Number:
		return x.Int64()
	case string:
		return strconv.ParseInt(x, 10, 64)
	default:
		return 0, fmt.Errorf("invalid number")
	}
}
func (h *Handler) fail(w http.ResponseWriter, e error) {
	h.logger.Printf("payment request failed: %v", e)
	writeError(w, 500, "payment_internal_error", "Không thể xử lý thanh toán lúc này.")
}
func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{"success": false, "errors": []map[string]string{{"code": code, "message": message}}})
}
func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
