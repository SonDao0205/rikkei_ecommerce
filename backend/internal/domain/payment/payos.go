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

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, cfg auth.Config, logger *log.Logger) {
	h := &Handler{db: db, cfg: cfg, logger: logger, client: &http.Client{Timeout: 12 * time.Second}}
	mux.Handle("POST /api/v1/orders/{id}/payment", security.RequireRole("CLIENT", h.createPayOSLink))
	mux.Handle("GET /api/v1/orders/{id}/payment", security.RequireRole("CLIENT", h.getPayment))
	mux.HandleFunc("POST /api/v1/webhooks/payos", h.payOSWebhook)
}

type payOSLinkResponse struct {
	Code string `json:"code"`
	Desc string `json:"desc"`
	Data struct {
		ID          string `json:"id"`
		CheckoutURL string `json:"checkoutUrl"`
		QRCode      string `json:"qrCode"`
		Status      string `json:"status"`
		OrderCode   int64  `json:"orderCode"`
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
	var payID int64
	var amount float64
	var methodCode, paymentStatus, orderStatus string
	err = h.db.QueryRowContext(r.Context(), `SELECT p.id,p.amount,pm.code,p.status,o.status FROM payments p JOIN payment_methods pm ON pm.id=p.payment_method_id JOIN orders o ON o.id=p.order_id WHERE p.order_id=? AND o.user_id=?`, orderID, uid).Scan(&payID, &amount, &methodCode, &paymentStatus, &orderStatus)
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
	if paymentStatus == "PAID" {
		writeError(w, http.StatusConflict, "already_paid", "Đơn hàng đã được thanh toán.")
		return
	}
	if paymentStatus != "PENDING" || strings.EqualFold(orderStatus, "CANCELLED") {
		writeError(w, http.StatusConflict, "payment_not_payable", "Đơn hàng hiện không thể thanh toán.")
		return
	}
	if amount <= 0 || math.Trunc(amount) != amount || amount > 999999999 {
		writeError(w, http.StatusUnprocessableEntity, "invalid_payment_amount", "Số tiền đơn hàng không hợp lệ để thanh toán.")
		return
	}
	var attemptID int64
	var state, checkoutURL, qr string
	var linkID sql.NullString
	var updatedAt time.Time
	err = h.db.QueryRowContext(r.Context(), `SELECT id,status,COALESCE(checkout_url,''),COALESCE(qr_code,''),provider_link_id,updated_at FROM payment_attempts WHERE payment_id=?`, payID).Scan(&attemptID, &state, &checkoutURL, &qr, &linkID, &updatedAt)
	if err == nil && state == "PENDING" && checkoutURL != "" {
		// Refresh provider state before returning a cached URL. The browser return itself is never payment proof.
		providerState, lookupErr := h.getPayOSLink(r.Context(), strconv.FormatInt(payID, 10))
		if lookupErr == nil && providerState.Data.Status != "" && providerState.Data.Status != "PENDING" {
			terminal := strings.ToUpper(providerState.Data.Status)
			if terminal == "CANCELLED" || terminal == "EXPIRED" {
				_, _ = h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET status=? WHERE id=? AND status='PENDING'`, terminal, attemptID)
				writeError(w, http.StatusConflict, "payment_link_ended", "Liên kết thanh toán đã kết thúc. Liên hệ hỗ trợ để được cấp lại liên kết an toàn.")
				return
			}
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"status": state, "checkout_url": checkoutURL, "qr_code": qr, "payment_link_id": linkID.String}})
		return
	}
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		h.fail(w, err)
		return
	}
	if errors.Is(err, sql.ErrNoRows) {
		// PayOS orderCode is based on our unique payment row id, so retry/recovery always addresses the same provider request.
		res, e := h.db.ExecContext(r.Context(), `INSERT IGNORE INTO payment_attempts(payment_id,provider,provider_order_code,status) VALUES (?,'PAYOS',?,'CREATING')`, payID, payID)
		if e != nil {
			h.fail(w, e)
			return
		}
		if n, _ := res.RowsAffected(); n == 0 {
			writeError(w, http.StatusConflict, "payment_initializing", "Đang khởi tạo thanh toán. Vui lòng tải lại sau ít giây.")
			return
		}
		attemptID, _ = res.LastInsertId()
	} else if state == "CREATING" {
		if time.Since(updatedAt) < 45*time.Second {
			writeError(w, http.StatusConflict, "payment_initializing", "Đang khởi tạo thanh toán. Vui lòng tải lại sau ít giây.")
			return
		}
		res, updateErr := h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET updated_at=UTC_TIMESTAMP() WHERE id=? AND status='CREATING' AND updated_at=?`, attemptID, updatedAt)
		if updateErr != nil {
			h.fail(w, updateErr)
			return
		}
		if changed, _ := res.RowsAffected(); changed == 0 {
			writeError(w, http.StatusConflict, "payment_initializing", "Đang khởi tạo thanh toán. Vui lòng tải lại sau ít giây.")
			return
		}
	} else {
		res, updateErr := h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET status='CREATING',failure_code=NULL WHERE id=? AND status IN ('FAILED','CANCELLED','EXPIRED')`, attemptID)
		if updateErr != nil {
			h.fail(w, updateErr)
			return
		}
		if changed, _ := res.RowsAffected(); changed == 0 {
			writeError(w, http.StatusConflict, "payment_initializing", "Đang khởi tạo thanh toán. Vui lòng tải lại sau ít giây.")
			return
		}
	}
	// First query by our stable orderCode to recover a provider-side create that succeeded before the HTTP connection was lost.
	result, queryErr := h.getPayOSLink(r.Context(), strconv.FormatInt(payID, 10))
	if queryErr == nil && result.Data.ID != "" && (strings.EqualFold(result.Data.Status, "CANCELLED") || strings.EqualFold(result.Data.Status, "EXPIRED")) {
		terminal := strings.ToUpper(result.Data.Status)
		_, _ = h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET status=? WHERE id=? AND status IN ('CREATING','PENDING')`, terminal, attemptID)
		writeError(w, http.StatusConflict, "payment_link_ended", "Liên kết PayOS đã bị hủy hoặc hết hạn. Đơn hàng vẫn được giữ; vui lòng liên hệ hỗ trợ để tạo liên kết thanh toán mới.")
		return
	}
	if queryErr != nil || result.Data.ID == "" {
		result, err = h.createPayOSLinkRequest(r.Context(), payID, orderID, int64(amount))
		if err != nil {
			_, _ = h.db.ExecContext(context.Background(), `UPDATE payment_attempts SET status='FAILED',failure_code='PROVIDER_UNAVAILABLE' WHERE id=?`, attemptID)
			h.logger.Printf("payOS link creation failed payment_id=%d: %v", payID, err)
			writeError(w, http.StatusBadGateway, "payment_provider_error", "Không tạo được liên kết thanh toán. Bạn có thể thử lại an toàn.")
			return
		}
	}
	if result.Data.OrderCode != 0 && result.Data.OrderCode != payID {
		h.fail(w, fmt.Errorf("payOS returned unexpected orderCode"))
		return
	}
	if result.Data.CheckoutURL == "" || result.Data.ID == "" {
		h.fail(w, fmt.Errorf("payOS response missing payment link fields"))
		return
	}
	if _, err = h.db.ExecContext(r.Context(), `UPDATE payment_attempts SET provider_link_id=?,checkout_url=?,qr_code=?,status='PENDING' WHERE id=? AND status='CREATING'`, result.Data.ID, result.Data.CheckoutURL, result.Data.QRCode, attemptID); err != nil {
		h.fail(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"status": "PENDING", "checkout_url": result.Data.CheckoutURL, "qr_code": result.Data.QRCode, "payment_link_id": result.Data.ID}})
}

func (h *Handler) getPayOSLink(ctx context.Context, id string) (payOSLinkResponse, error) {
	var out payOSLinkResponse
	req, e := http.NewRequestWithContext(ctx, http.MethodGet, payOSBaseURL+"/v2/payment-requests/"+url.PathEscape(id), nil)
	if e != nil {
		return out, e
	}
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
		return out, fmt.Errorf("payOS lookup status %d", resp.StatusCode)
	}
	e = json.Unmarshal(b, &out)
	return out, e
}
func (h *Handler) createPayOSLinkRequest(ctx context.Context, paymentID, orderID, amount int64) (payOSLinkResponse, error) {
	var out payOSLinkResponse
	orderCode := paymentID
	description := fmt.Sprintf("PAY%d", paymentID)
	webhook := h.cfg.PublicAPIURL + "/api/v1/webhooks/payos"
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
	body := map[string]any{"orderCode": orderCode, "amount": amount, "description": description, "returnUrl": returnURL, "cancelUrl": cancelURL, "webhookUrl": webhook, "signature": sig}
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
	if e == nil && out.Code != "00" {
		e = fmt.Errorf("payOS rejected payment request")
	}
	return out, e
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
	var paymentID int64
	var amount float64
	var status, method, txn string
	var paidAt sql.NullTime
	e = h.db.QueryRowContext(r.Context(), `SELECT p.id,p.amount,p.status,pm.code,COALESCE(p.transaction_ref,''),p.paid_at FROM payments p JOIN payment_methods pm ON pm.id=p.payment_method_id JOIN orders o ON o.id=p.order_id WHERE o.id=? AND o.user_id=?`, orderID, uid).Scan(&paymentID, &amount, &status, &method, &txn, &paidAt)
	if errors.Is(e, sql.ErrNoRows) {
		writeError(w, 404, "order_not_found", "Không tìm thấy đơn hàng.")
		return
	}
	if e != nil {
		h.fail(w, e)
		return
	}
	data := map[string]any{"payment_id": paymentID, "amount": amount, "status": status, "method": method, "transaction_ref": txn}
	if paidAt.Valid {
		data["paid_at"] = paidAt.Time
	}
	var link, qr sql.NullString
	e = h.db.QueryRowContext(r.Context(), `SELECT checkout_url,qr_code FROM payment_attempts WHERE payment_id=?`, paymentID).Scan(&link, &qr)
	if e != nil && !errors.Is(e, sql.ErrNoRows) {
		h.fail(w, e)
		return
	}
	if link.Valid {
		data["checkout_url"] = link.String
	}
	if qr.Valid {
		data["qr_code"] = qr.String
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
	var attemptID, paymentID int64
	var expected int64
	var paymentStatus string
	e = tx.QueryRowContext(r.Context(), `SELECT a.id,p.id,CAST(p.amount AS SIGNED),p.status FROM payment_attempts a JOIN payments p ON p.id=a.payment_id WHERE a.provider='PAYOS' AND a.provider_order_code=? FOR UPDATE`, orderCode).Scan(&attemptID, &paymentID, &expected, &paymentStatus)
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
		if paymentStatus == "PENDING" || paymentStatus == "FAILED" {
			if paymentStatus == "FAILED" {
				h.logger.Printf("late payOS success requires refund/reconciliation payment_id=%d", paymentID)
			}
			if _, e = tx.ExecContext(r.Context(), `UPDATE payments SET status='PAID',paid_at=UTC_TIMESTAMP(),transaction_ref=?,provider_data=?,updated_at=UTC_TIMESTAMP() WHERE id=? AND status IN ('PENDING','FAILED')`, ref, string(encoded), paymentID); e != nil {
				http.Error(w, "temporary failure", 500)
				return
			}
		}
		if _, e = tx.ExecContext(r.Context(), `UPDATE payment_attempts SET status='PAID' WHERE id=?`, attemptID); e != nil {
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
