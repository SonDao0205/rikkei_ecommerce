package order

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/httpx"
)

type SellerHandler struct {
	db     *sql.DB
	logger *log.Logger
}

func (h *SellerHandler) listSellerOrders(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	page, limit, err := parseListPage(r.URL.Query())
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_page", "Invalid page or limit parameter")
		return
	}
	if limit > 50 {
		limit = 50
	}

	statusFilter := strings.TrimSpace(strings.ToUpper(r.URL.Query().Get("status")))
	if statusFilter == "ALL" {
		statusFilter = ""
	}
	search := strings.TrimSpace(r.URL.Query().Get("search"))

	// 1. Calculate status counts for seller tabs in a single query
	countsQuery := `SELECT status, COUNT(*) FROM shop_orders WHERE shop_id = ? GROUP BY status`
	countRows, err := h.db.QueryContext(r.Context(), countsQuery, shopID)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer countRows.Close()

	var counts OrderStatusCounts
	for countRows.Next() {
		var st string
		var c int64
		if err := countRows.Scan(&st, &c); err != nil {
			serverError(w, h.logger, err)
			return
		}
		counts.All += c
		switch strings.ToUpper(st) {
		case "PENDING":
			counts.Pending = c
		case "CONFIRMED":
			counts.Confirmed = c
		case "PACKING":
			counts.Packing = c
		case "SHIPPING":
			counts.Shipping = c
		case "COMPLETED":
			counts.Completed = c
		case "CANCELLED":
			counts.Cancelled = c
		case "RETURNED":
			counts.Returned = c
		}
	}
	if err := countRows.Err(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	// 2. Query shop orders strictly for this shop_id
	var whereClauses []string
	var args []any

	whereClauses = append(whereClauses, "so.shop_id = ?")
	args = append(args, shopID)

	if statusFilter != "" {
		whereClauses = append(whereClauses, "so.status = ?")
		args = append(args, statusFilter)
	}

	if search != "" {
		likePattern := "%" + search + "%"
		whereClauses = append(whereClauses, "(so.shop_order_code LIKE ? OR o.order_code LIKE ? OR o.recipient_name LIKE ? OR o.recipient_phone LIKE ? OR so.tracking_code LIKE ?)")
		args = append(args, likePattern, likePattern, likePattern, likePattern, likePattern)
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	// Total count for current filter
	var total int64
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM shop_orders so JOIN orders o ON so.order_id = o.id WHERE %s`, whereSQL)
	if err := h.db.QueryRowContext(r.Context(), countQuery, args...).Scan(&total); err != nil {
		serverError(w, h.logger, err)
		return
	}

	totalPages := 0
	if total > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	// Main paged list query
	offset := (page - 1) * limit
	listSQL := fmt.Sprintf(`SELECT so.id, so.order_id, so.shop_id, so.shop_order_code, o.order_code, so.status,
			so.subtotal, so.shipping_fee, so.shop_discount, so.platform_discount, so.total_amount,
			so.commission_rate, so.commission_amount,
			so.carrier, so.tracking_code, so.cancel_reason,
			o.recipient_name, o.recipient_phone, o.shipping_address,
			pm.code, pm.name, p.status,
			so.confirmed_at, so.packed_at, so.shipped_at, so.completed_at, so.cancelled_at,
			so.created_at, so.updated_at
		FROM shop_orders so
		JOIN orders o ON so.order_id = o.id
		JOIN payments p ON p.order_id = o.id
		JOIN payment_methods pm ON p.payment_method_id = pm.id
		WHERE %s
		ORDER BY so.created_at DESC, so.id DESC
		LIMIT ? OFFSET ?`, whereSQL)

	pagedArgs := append(args, limit, offset)
	rows, err := h.db.QueryContext(r.Context(), listSQL, pagedArgs...)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer rows.Close()

	var list []SellerOrderView
	for rows.Next() {
		var v SellerOrderView
		var carrier, tracking, cancelReason sql.NullString
		var confAt, packAt, shipAt, compAt, cancAt sql.NullTime

		if err := rows.Scan(
			&v.ID, &v.OrderID, &v.ShopID, &v.ShopOrderCode, &v.ParentOrderCode, &v.Status,
			&v.Subtotal, &v.ShippingFee, &v.ShopDiscount, &v.PlatformDiscount, &v.TotalAmount,
			&v.CommissionRate, &v.CommissionAmount,
			&carrier, &tracking, &cancelReason,
			&v.RecipientName, &v.RecipientPhone, &v.ShippingAddress,
			&v.PaymentMethodCode, &v.PaymentMethodName, &v.PaymentStatus,
			&confAt, &packAt, &shipAt, &compAt, &cancAt,
			&v.CreatedAt, &v.UpdatedAt,
		); err != nil {
			serverError(w, h.logger, err)
			return
		}

		v.ShopOrderID = v.ID
		v.StatusLabel = statusLabel(v.Status)
		v.SellerPayout = v.TotalAmount - v.CommissionAmount
		if carrier.Valid {
			v.Carrier = &carrier.String
		}
		if tracking.Valid {
			v.TrackingCode = &tracking.String
		}
		if cancelReason.Valid {
			v.CancelReason = &cancelReason.String
		}
		if confAt.Valid {
			v.ConfirmedAt = &confAt.Time
		}
		if packAt.Valid {
			v.PackedAt = &packAt.Time
		}
		if shipAt.Valid {
			v.ShippedAt = &shipAt.Time
		}
		if compAt.Valid {
			v.CompletedAt = &compAt.Time
		}
		if cancAt.Valid {
			v.CancelledAt = &cancAt.Time
		}

		list = append(list, v)
	}
	if err := rows.Err(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	// Load order items for each shop order
	custHandler := &CustomerHandler{db: h.db, logger: h.logger}
	for i := range list {
		items, err := custHandler.loadOrderItems(r.Context(), list[i].ID)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}
		list[i].Items = items
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data": map[string]any{
			"orders": list,
			"counts": counts,
			"pagination": map[string]any{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": totalPages,
			},
		},
	})
}

func (h *SellerHandler) getSellerOrderDetail(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Shop Order ID or code is required")
		return
	}
	parsedID, _ := strconv.ParseInt(param, 10, 64)

	var v SellerOrderDetail
	var carrier, tracking, cancelReason, buyerNote sql.NullString
	var confAt, packAt, shipAt, compAt, cancAt sql.NullTime

	query := `SELECT so.id, so.order_id, so.shop_id, so.shop_order_code, o.order_code, so.status,
			so.subtotal, so.shipping_fee, so.shop_discount, so.platform_discount, so.total_amount,
			so.commission_rate, so.commission_amount,
			so.carrier, so.tracking_code, so.cancel_reason,
			o.recipient_name, o.recipient_phone, o.shipping_address, o.note,
			pm.code, pm.name, p.status,
			so.confirmed_at, so.packed_at, so.shipped_at, so.completed_at, so.cancelled_at,
			so.created_at, so.updated_at
		FROM shop_orders so
		JOIN orders o ON so.order_id = o.id
		JOIN payments p ON p.order_id = o.id
		JOIN payment_methods pm ON p.payment_method_id = pm.id
		WHERE (so.id = ? OR so.shop_order_code = ?) AND so.shop_id = ?`

	err = h.db.QueryRowContext(r.Context(), query, parsedID, param, shopID).Scan(
		&v.ID, &v.OrderID, &v.ShopID, &v.ShopOrderCode, &v.ParentOrderCode, &v.Status,
		&v.Subtotal, &v.ShippingFee, &v.ShopDiscount, &v.PlatformDiscount, &v.TotalAmount,
		&v.CommissionRate, &v.CommissionAmount,
		&carrier, &tracking, &cancelReason,
		&v.RecipientName, &v.RecipientPhone, &v.ShippingAddress, &buyerNote,
		&v.PaymentMethodCode, &v.PaymentMethodName, &v.PaymentStatus,
		&confAt, &packAt, &shipAt, &compAt, &cancAt,
		&v.CreatedAt, &v.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	v.ShopOrderID = v.ID
	v.StatusLabel = statusLabel(v.Status)
	v.SellerPayout = v.TotalAmount - v.CommissionAmount
	if carrier.Valid {
		v.Carrier = &carrier.String
	}
	if tracking.Valid {
		v.TrackingCode = &tracking.String
	}
	if cancelReason.Valid {
		v.CancelReason = &cancelReason.String
	}
	if buyerNote.Valid && buyerNote.String != "" {
		v.BuyerNote = &buyerNote.String
	}
	if confAt.Valid {
		v.ConfirmedAt = &confAt.Time
	}
	if packAt.Valid {
		v.PackedAt = &packAt.Time
	}
	if shipAt.Valid {
		v.ShippedAt = &shipAt.Time
	}
	if compAt.Valid {
		v.CompletedAt = &compAt.Time
	}
	if cancAt.Valid {
		v.CancelledAt = &cancAt.Time
	}

	// Load order items
	custHandler := &CustomerHandler{db: h.db, logger: h.logger}
	items, err := custHandler.loadOrderItems(r.Context(), v.ID)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	v.Items = items

	// Load timeline for this shop order
	timelineRows, err := h.db.QueryContext(r.Context(),
		`SELECT id, from_status, to_status, note, created_at FROM order_status_history WHERE shop_order_id = ? ORDER BY created_at ASC`,
		v.ID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer timelineRows.Close()

	for timelineRows.Next() {
		var l TimelineLogView
		var fromSt, note sql.NullString
		var toSt string
		if err := timelineRows.Scan(&l.ID, &fromSt, &toSt, &note, &l.CreatedAt); err != nil {
			serverError(w, h.logger, err)
			return
		}
		l.Time = l.CreatedAt.Format("02/01/2006 15:04")
		l.Title = statusLabel(toSt)
		if note.Valid && note.String != "" {
			l.Note = note.String
			l.Subtitle = note.String
		}
		v.Timeline = append(v.Timeline, l)
	}

	// Load return requests for this shop order
	retRows, err := h.db.QueryContext(r.Context(),
		`SELECT rr.id, rr.shop_order_id, so.shop_order_code, rr.user_id, u.full_name, u.phone, 
			rr.type, rr.reason, rr.status, rr.refund_amount, rr.handled_by, rr.handled_note, 
			rr.created_at, rr.updated_at
		FROM return_requests rr
		JOIN shop_orders so ON rr.shop_order_id = so.id
		JOIN users u ON rr.user_id = u.id
		WHERE rr.shop_order_id = ?
		ORDER BY rr.id DESC`,
		v.ID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer retRows.Close()

	for retRows.Next() {
		var ret ReturnView
		var refAmt sql.NullFloat64
		var handledBy sql.NullInt64
		var handledNote sql.NullString
		if err := retRows.Scan(
			&ret.ID, &ret.ShopOrderID, &ret.ShopOrderCode, &ret.UserID, &ret.UserName, &ret.UserPhone,
			&ret.Type, &ret.Reason, &ret.Status, &refAmt, &handledBy, &handledNote,
			&ret.CreatedAt, &ret.UpdatedAt,
		); err != nil {
			serverError(w, h.logger, err)
			return
		}
		if refAmt.Valid {
			ret.RefundAmount = &refAmt.Float64
		}
		if handledBy.Valid {
			ret.HandledBy = &handledBy.Int64
		}
		if handledNote.Valid {
			ret.HandledNote = &handledNote.String
		}
		v.ReturnRequests = append(v.ReturnRequests, ret)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    v,
	})
}

func (h *SellerHandler) confirmSellerOrder(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, _ := strconv.ParseInt(uidStr, 10, 64)
	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	parsedID, _ := strconv.ParseInt(param, 10, 64)

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var soID int64
	var status string
	err = tx.QueryRowContext(r.Context(),
		`SELECT id, status FROM shop_orders WHERE (id = ? OR shop_order_code = ?) AND shop_id = ? FOR UPDATE`,
		parsedID, param, shopID,
	).Scan(&soID, &status)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if strings.ToUpper(status) != "PENDING" {
		writeError(w, http.StatusUnprocessableEntity, "invalid_status",
			fmt.Sprintf("Chỉ có thể xác nhận đơn hàng đang ở trạng thái 'Chờ xác nhận'. Trạng thái hiện tại: %s", statusLabel(status)))
		return
	}

	_, err = tx.ExecContext(r.Context(),
		`UPDATE shop_orders SET status = 'CONFIRMED', confirmed_at = NOW(), updated_at = NOW() WHERE id = ?`,
		soID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = recordStatusHistory(r.Context(), tx, soID, "PENDING", "CONFIRMED", &uid, "Gian hàng đã xác nhận đơn hàng"); err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã xác nhận đơn hàng thành công",
		"data": map[string]any{
			"shop_order_id": soID,
			"status":        "CONFIRMED",
			"status_label":  "Đã xác nhận",
		},
	})
}

func (h *SellerHandler) packSellerOrder(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, _ := strconv.ParseInt(uidStr, 10, 64)
	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	parsedID, _ := strconv.ParseInt(param, 10, 64)

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var soID int64
	var status string
	err = tx.QueryRowContext(r.Context(),
		`SELECT id, status FROM shop_orders WHERE (id = ? OR shop_order_code = ?) AND shop_id = ? FOR UPDATE`,
		parsedID, param, shopID,
	).Scan(&soID, &status)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	st := strings.ToUpper(status)
	if st != "CONFIRMED" && st != "PENDING" {
		writeError(w, http.StatusUnprocessableEntity, "invalid_status",
			fmt.Sprintf("Chỉ có thể chuẩn bị đóng gói đơn hàng ở trạng thái Chờ xác nhận hoặc Đã xác nhận. Trạng thái hiện tại: %s", statusLabel(status)))
		return
	}

	_, err = tx.ExecContext(r.Context(),
		`UPDATE shop_orders SET status = 'PACKING', packed_at = NOW(), updated_at = NOW() WHERE id = ?`,
		soID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = recordStatusHistory(r.Context(), tx, soID, status, "PACKING", &uid, "Gian hàng bắt đầu chuẩn bị và đóng gói hàng"); err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã chuyển đơn hàng sang trạng thái đang chuẩn bị đóng gói",
		"data": map[string]any{
			"shop_order_id": soID,
			"status":        "PACKING",
			"status_label":  "Đang chuẩn bị hàng",
		},
	})
}

func (h *SellerHandler) shipSellerOrder(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Shop Order ID or code is required")
		return
	}
	parsedID, _ := strconv.ParseInt(param, 10, 64)

	var req ShipOrderRequest
	if !httpx.Decode(w, r, &req) {
		return
	}

	req.Carrier = strings.TrimSpace(req.Carrier)
	req.TrackingCode = strings.TrimSpace(req.TrackingCode)
	if req.Carrier == "" || utf8.RuneCountInString(req.Carrier) > 50 {
		writeError(w, http.StatusBadRequest, "invalid_carrier", "Đơn vị vận chuyển (carrier) không được để trống và không quá 50 ký tự")
		return
	}
	if req.TrackingCode == "" || utf8.RuneCountInString(req.TrackingCode) > 80 {
		writeError(w, http.StatusBadRequest, "invalid_tracking_code", "Mã vận đơn (tracking_code) không được để trống và không quá 80 ký tự")
		return
	}

	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var soID int64
	var status string
	err = tx.QueryRowContext(r.Context(),
		`SELECT id, status FROM shop_orders WHERE (id = ? OR shop_order_code = ?) AND shop_id = ? FOR UPDATE`,
		parsedID, param, shopID,
	).Scan(&soID, &status)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	st := strings.ToUpper(status)
	if st != "PACKING" && st != "CONFIRMED" {
		writeError(w, http.StatusUnprocessableEntity, "invalid_status",
			fmt.Sprintf("Chỉ có thể bàn giao vận chuyển đơn hàng đang đóng gói hoặc đã xác nhận. Trạng thái hiện tại: %s", statusLabel(status)))
		return
	}

	_, err = tx.ExecContext(r.Context(),
		`UPDATE shop_orders SET status = 'SHIPPING', carrier = ?, tracking_code = ?, shipped_at = NOW(), updated_at = NOW() WHERE id = ?`,
		req.Carrier, req.TrackingCode, soID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	logMsg := fmt.Sprintf("Bàn giao cho đơn vị vận chuyển %s - Mã vận đơn: %s", req.Carrier, req.TrackingCode)
	if err = recordStatusHistory(r.Context(), tx, soID, status, "SHIPPING", &uid, logMsg); err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã bàn giao cho đơn vị vận chuyển thành công",
		"data": map[string]any{
			"shop_order_id": soID,
			"status":        "SHIPPING",
			"status_label":  "Đang vận chuyển",
			"carrier":       req.Carrier,
			"tracking_code": req.TrackingCode,
		},
	})
}

func (h *SellerHandler) completeSellerOrder(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, _ := strconv.ParseInt(uidStr, 10, 64)
	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	parsedID, _ := strconv.ParseInt(param, 10, 64)

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var soID, orderID int64
	var status string
	err = tx.QueryRowContext(r.Context(),
		`SELECT id, order_id, status FROM shop_orders WHERE (id = ? OR shop_order_code = ?) AND shop_id = ? FOR UPDATE`,
		parsedID, param, shopID,
	).Scan(&soID, &orderID, &status)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	st := strings.ToUpper(status)
	if st != "SHIPPING" {
		writeError(w, http.StatusUnprocessableEntity, "invalid_status",
			fmt.Sprintf("Chỉ có thể hoàn thành đơn hàng đang ở trạng thái 'Đang vận chuyển'. Trạng thái hiện tại: %s", statusLabel(status)))
		return
	}

	_, err = tx.ExecContext(r.Context(),
		`UPDATE shop_orders SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = ?`,
		soID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = recordStatusHistory(r.Context(), tx, soID, "SHIPPING", "COMPLETED", &uid, "Giao hàng thành công và hoàn tất đơn hàng"); err != nil {
		serverError(w, h.logger, err)
		return
	}

	// If COD, mark payment as PAID
	_, _ = tx.ExecContext(r.Context(),
		`UPDATE payments SET status = 'PAID', paid_at = NOW(), updated_at = NOW() WHERE order_id = ? AND status = 'PENDING'`,
		orderID,
	)

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã hoàn thành giao hàng thành công",
		"data": map[string]any{
			"shop_order_id": soID,
			"status":        "COMPLETED",
			"status_label":  "Hoàn thành",
		},
	})
}

func (h *SellerHandler) cancelSellerOrder(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Shop Order ID or code is required")
		return
	}
	parsedID, _ := strconv.ParseInt(param, 10, 64)

	var req CancelOrderRequest
	if !httpx.Decode(w, r, &req) {
		return
	}

	req.Reason = strings.TrimSpace(req.Reason)
	if req.Reason == "" {
		req.Reason = "Chủ gian hàng hủy đơn do hết hàng hoặc lý do kỹ thuật"
	}
	if utf8.RuneCountInString(req.Reason) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_reason", "Lý do hủy không được vượt quá 500 ký tự")
		return
	}

	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var soID, orderID int64
	var status string
	err = tx.QueryRowContext(r.Context(),
		`SELECT id, order_id, status FROM shop_orders WHERE (id = ? OR shop_order_code = ?) AND shop_id = ? FOR UPDATE`,
		parsedID, param, shopID,
	).Scan(&soID, &orderID, &status)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Không tìm thấy đơn hàng của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	st := strings.ToUpper(status)
	if st == "SHIPPING" || st == "COMPLETED" || st == "CANCELLED" || st == "RETURNED" {
		writeError(w, http.StatusUnprocessableEntity, "invalid_status",
			fmt.Sprintf("Không thể hủy đơn hàng ở trạng thái '%s'.", statusLabel(status)))
		return
	}

	// Update shop order
	_, err = tx.ExecContext(r.Context(),
		`UPDATE shop_orders SET status = 'CANCELLED', cancel_reason = ?, cancelled_at = NOW(), updated_at = NOW() WHERE id = ?`,
		req.Reason, soID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = recordStatusHistory(r.Context(), tx, soID, status, "CANCELLED", &uid, "Gian hàng hủy đơn: "+req.Reason); err != nil {
		serverError(w, h.logger, err)
		return
	}

	// Restore stock and decrement sold_count atomically
	itemRows, err := tx.QueryContext(r.Context(),
		`SELECT variant_id, product_id, quantity FROM order_items WHERE shop_order_id = ? FOR UPDATE`,
		soID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	type itemRestock struct {
		variantID int64
		productID int64
		qty       int64
	}
	var restocks []itemRestock
	for itemRows.Next() {
		var ir itemRestock
		if err := itemRows.Scan(&ir.variantID, &ir.productID, &ir.qty); err != nil {
			itemRows.Close()
			serverError(w, h.logger, err)
			return
		}
		restocks = append(restocks, ir)
	}
	itemRows.Close()

	for _, ir := range restocks {
		_, err = tx.ExecContext(r.Context(),
			`UPDATE product_variants SET stock = stock + ? WHERE id = ?`,
			ir.qty, ir.variantID,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}
		_, err = tx.ExecContext(r.Context(),
			`UPDATE products SET sold_count = GREATEST(sold_count - ?, 0) WHERE id = ?`,
			ir.qty, ir.productID,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}
	}

	// Payment and refund handling
	var payID int64
	var payStatus, pmCode string
	err = tx.QueryRowContext(r.Context(),
		`SELECT p.id, p.status, pm.code FROM payments p JOIN payment_methods pm ON p.payment_method_id = pm.id WHERE p.order_id = ? FOR UPDATE`,
		orderID,
	).Scan(&payID, &payStatus, &pmCode)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		serverError(w, h.logger, err)
		return
	}

	refundStatus := "NOT_APPLICABLE"
	refundMessage := "Đơn hàng COD đã được hủy. Không phát sinh hoàn tiền."
	if pmCode != "COD" || payStatus == "PAID" {
		refundStatus = "REFUND_PROCESSING"
		refundMessage = "Đã hủy đơn hàng thành công. Tiền sẽ được hoàn lại cho khách trong vòng 3 ngày làm việc."
		_, _ = tx.ExecContext(r.Context(),
			`UPDATE payments SET status = 'REFUNDED', updated_at = NOW() WHERE id = ?`,
			payID,
		)
	} else {
		_, _ = tx.ExecContext(r.Context(),
			`UPDATE payments SET status = 'FAILED', updated_at = NOW() WHERE id = ? AND status = 'PENDING'`,
			payID,
		)
	}

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã hủy đơn hàng thành công và hoàn trả tồn kho",
		"data": map[string]any{
			"shop_order_id":  soID,
			"status":         "CANCELLED",
			"status_label":   "Đã hủy",
			"refund_status":  refundStatus,
			"refund_message": refundMessage,
		},
	})
}

func (h *SellerHandler) listSellerReturns(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	page, limit, err := parseListPage(r.URL.Query())
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_page", "Invalid page or limit parameter")
		return
	}
	if limit > 50 {
		limit = 50
	}

	status := strings.TrimSpace(strings.ToUpper(r.URL.Query().Get("status")))
	if status == "ALL" {
		status = ""
	}

	var total int64
	countSQL := `SELECT COUNT(*) FROM return_requests rr
		JOIN shop_orders so ON rr.shop_order_id = so.id
		WHERE so.shop_id = ? AND (? = '' OR rr.status = ?)`
	if err := h.db.QueryRowContext(r.Context(), countSQL, shopID, status, status).Scan(&total); err != nil {
		serverError(w, h.logger, err)
		return
	}

	totalPages := 0
	if total > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
	}

	offset := (page - 1) * limit
	listSQL := `SELECT rr.id, rr.shop_order_id, so.shop_order_code, rr.user_id, u.full_name, u.phone, 
			rr.type, rr.reason, rr.status, rr.refund_amount, rr.handled_by, rr.handled_note, 
			rr.created_at, rr.updated_at
		FROM return_requests rr
		JOIN shop_orders so ON rr.shop_order_id = so.id
		JOIN users u ON rr.user_id = u.id
		WHERE so.shop_id = ? AND (? = '' OR rr.status = ?)
		ORDER BY rr.created_at DESC, rr.id DESC
		LIMIT ? OFFSET ?`

	rows, err := h.db.QueryContext(r.Context(), listSQL, shopID, status, status, limit, offset)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer rows.Close()

	var list []ReturnView
	for rows.Next() {
		var ret ReturnView
		var refAmt sql.NullFloat64
		var handledBy sql.NullInt64
		var handledNote sql.NullString
		if err := rows.Scan(
			&ret.ID, &ret.ShopOrderID, &ret.ShopOrderCode, &ret.UserID, &ret.UserName, &ret.UserPhone,
			&ret.Type, &ret.Reason, &ret.Status, &refAmt, &handledBy, &handledNote,
			&ret.CreatedAt, &ret.UpdatedAt,
		); err != nil {
			serverError(w, h.logger, err)
			return
		}
		if refAmt.Valid {
			ret.RefundAmount = &refAmt.Float64
		}
		if handledBy.Valid {
			ret.HandledBy = &handledBy.Int64
		}
		if handledNote.Valid {
			ret.HandledNote = &handledNote.String
		}
		list = append(list, ret)
	}
	if err := rows.Err(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data": map[string]any{
			"returns": list,
			"pagination": map[string]any{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": totalPages,
			},
		},
	})
}

func (h *SellerHandler) approveSellerReturn(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Return request ID is required")
		return
	}
	returnID, _ := strconv.ParseInt(param, 10, 64)

	var req HandleReturnRequest
	if !httpx.Decode(w, r, &req) {
		return
	}
	req.Note = strings.TrimSpace(req.Note)
	if req.Note == "" {
		req.Note = "Chủ gian hàng đã chấp thuận yêu cầu đổi trả và hoàn tiền"
	}
	if utf8.RuneCountInString(req.Note) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_note", "Ghi chú không được vượt quá 500 ký tự")
		return
	}

	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var shopOrderID, orderID int64
	var retStatus, soStatus string
	err = tx.QueryRowContext(r.Context(),
		`SELECT rr.shop_order_id, rr.status, so.order_id, so.status
		FROM return_requests rr
		JOIN shop_orders so ON rr.shop_order_id = so.id
		WHERE rr.id = ? AND so.shop_id = ? FOR UPDATE`,
		returnID, shopID,
	).Scan(&shopOrderID, &retStatus, &orderID, &soStatus)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "return_not_found", "Không tìm thấy yêu cầu đổi trả của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if strings.ToUpper(retStatus) != "REQUESTED" {
		writeError(w, http.StatusUnprocessableEntity, "already_handled",
			fmt.Sprintf("Yêu cầu đổi trả đã được xử lý trước đó với trạng thái '%s'", retStatus))
		return
	}

	// Update return request to APPROVED
	_, err = tx.ExecContext(r.Context(),
		`UPDATE return_requests SET status = 'APPROVED', handled_by = ?, handled_note = ?, updated_at = NOW() WHERE id = ?`,
		uid, req.Note, returnID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	// Update shop order to RETURNED
	_, err = tx.ExecContext(r.Context(),
		`UPDATE shop_orders SET status = 'RETURNED', updated_at = NOW() WHERE id = ?`,
		shopOrderID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = recordStatusHistory(r.Context(), tx, shopOrderID, soStatus, "RETURNED", &uid, "Gian hàng chấp thuận yêu cầu đổi trả: "+req.Note); err != nil {
		serverError(w, h.logger, err)
		return
	}

	// Restore stock and decrement sold_count atomically
	itemRows, err := tx.QueryContext(r.Context(),
		`SELECT variant_id, product_id, quantity FROM order_items WHERE shop_order_id = ? FOR UPDATE`,
		shopOrderID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	type itemRestock struct {
		variantID int64
		productID int64
		qty       int64
	}
	var restocks []itemRestock
	for itemRows.Next() {
		var ir itemRestock
		if err := itemRows.Scan(&ir.variantID, &ir.productID, &ir.qty); err != nil {
			itemRows.Close()
			serverError(w, h.logger, err)
			return
		}
		restocks = append(restocks, ir)
	}
	itemRows.Close()

	for _, ir := range restocks {
		_, err = tx.ExecContext(r.Context(),
			`UPDATE product_variants SET stock = stock + ? WHERE id = ?`,
			ir.qty, ir.variantID,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}
		_, err = tx.ExecContext(r.Context(),
			`UPDATE products SET sold_count = GREATEST(sold_count - ?, 0) WHERE id = ?`,
			ir.qty, ir.productID,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}
	}

	// Trigger refund on payments
	_, _ = tx.ExecContext(r.Context(),
		`UPDATE payments SET status = 'REFUNDED', updated_at = NOW() WHERE order_id = ?`,
		orderID,
	)

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã chấp thuận yêu cầu trả hàng. Tồn kho đã được hoàn lại và hệ thống sẽ hoàn tiền cho khách trong vòng 3 ngày làm việc.",
		"data": map[string]any{
			"return_request_id": returnID,
			"shop_order_id":     shopOrderID,
			"status":            "APPROVED",
			"refund_status":     "REFUND_PROCESSING",
			"refund_message":    "Yêu cầu hoàn tiền đã được ghi nhận. Tiền sẽ được hoàn lại vào tài khoản của quý khách trong vòng 3 ngày làm việc.",
		},
	})
}

func (h *SellerHandler) rejectSellerReturn(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Return request ID is required")
		return
	}
	returnID, _ := strconv.ParseInt(param, 10, 64)

	var req HandleReturnRequest
	if !httpx.Decode(w, r, &req) {
		return
	}
	req.Note = strings.TrimSpace(req.Note)
	noteLen := utf8.RuneCountInString(req.Note)
	if noteLen < 5 || noteLen > 500 {
		writeError(w, http.StatusBadRequest, "invalid_note", "Lý do từ chối (note) bắt buộc phải từ 5 đến 500 ký tự")
		return
	}

	shopID, _, err := activeSellerShop(r.Context(), h.db, uidStr)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "Bạn chưa có gian hàng hoặc gian hàng chưa được kích hoạt")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var retStatus string
	err = tx.QueryRowContext(r.Context(),
		`SELECT rr.status FROM return_requests rr
		JOIN shop_orders so ON rr.shop_order_id = so.id
		WHERE rr.id = ? AND so.shop_id = ? FOR UPDATE`,
		returnID, shopID,
	).Scan(&retStatus)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "return_not_found", "Không tìm thấy yêu cầu đổi trả của gian hàng")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if strings.ToUpper(retStatus) != "REQUESTED" {
		writeError(w, http.StatusUnprocessableEntity, "already_handled",
			fmt.Sprintf("Yêu cầu đổi trả đã được xử lý trước đó với trạng thái '%s'", retStatus))
		return
	}

	_, err = tx.ExecContext(r.Context(),
		`UPDATE return_requests SET status = 'REJECTED', handled_by = ?, handled_note = ?, updated_at = NOW() WHERE id = ?`,
		uid, req.Note, returnID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã từ chối yêu cầu đổi trả của khách.",
		"data": map[string]any{
			"return_request_id": returnID,
			"status":            "REJECTED",
		},
	})
}
