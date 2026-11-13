package order

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/httpx"
)

type CustomerHandler struct {
	db     *sql.DB
	logger *log.Logger
}

type orderMeta struct {
	id           int64
	orderCode    string
	createdAt    time.Time
	shopStatuses []string
}

func (h *CustomerHandler) listCustomerOrders(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
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

	tab := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("tab")))
	if tab == "" {
		tab = strings.TrimSpace(strings.ToLower(r.URL.Query().Get("status")))
	}
	if tab == "" {
		tab = "all"
	}

	search := strings.TrimSpace(r.URL.Query().Get("search"))

	// 1. Fetch all parent orders for this user along with their shop orders to calculate counts and derive statuses
	metaQuery := `SELECT o.id, o.order_code, o.created_at, so.status
		FROM orders o
		JOIN shop_orders so ON o.id = so.order_id
		WHERE o.user_id = ?
		ORDER BY o.created_at DESC, o.id DESC`

	rows, err := h.db.QueryContext(r.Context(), metaQuery, uid)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer rows.Close()

	orderMap := make(map[int64]*orderMeta)
	var orderOrder []int64

	for rows.Next() {
		var oID int64
		var oCode string
		var cAt time.Time
		var sStatus string
		if err := rows.Scan(&oID, &oCode, &cAt, &sStatus); err != nil {
			serverError(w, h.logger, err)
			return
		}

		if meta, exists := orderMap[oID]; exists {
			meta.shopStatuses = append(meta.shopStatuses, sStatus)
		} else {
			meta := &orderMeta{
				id:           oID,
				orderCode:    oCode,
				createdAt:    cAt,
				shopStatuses: []string{sStatus},
			}
			orderMap[oID] = meta
			orderOrder = append(orderOrder, oID)
		}
	}
	if err := rows.Err(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	// 2. Compute tab counts and filter orders
	var counts OrderStatusCounts
	var matchedOrderIDs []int64

	for _, oID := range orderOrder {
		meta := orderMap[oID]
		derived, _ := deriveParentStatus(meta.shopStatuses)
		derivedLower := strings.ToLower(derived)

		counts.All++
		switch derivedLower {
		case "pending":
			counts.Pending++
		case "confirmed":
			counts.Confirmed++
			counts.Packing++ // customer-facing tab groups confirmed and packing orders
		case "packing":
			counts.Packing++
		case "shipping":
			counts.Shipping++
		case "completed":
			counts.Completed++
		case "cancelled":
			counts.Cancelled++
		case "returned":
			counts.Returned++
		}

		// Check filter
		matchTab := customerOrderTabMatches(tab, derivedLower)

		matchSearch := true
		if search != "" {
			if !strings.Contains(strings.ToLower(meta.orderCode), strings.ToLower(search)) {
				matchSearch = false
			}
		}

		if matchTab && matchSearch {
			matchedOrderIDs = append(matchedOrderIDs, oID)
		}
	}
	counts.Preparing = counts.Packing

	total := len(matchedOrderIDs)
	totalPages := 0
	if total > 0 {
		totalPages = (total + limit - 1) / limit
	}

	// Slice for current page
	offset := (page - 1) * limit
	var pagedIDs []int64
	if offset < total {
		end := offset + limit
		if end > total {
			end = total
		}
		pagedIDs = matchedOrderIDs[offset:end]
	}

	if len(pagedIDs) == 0 {
		writeJSON(w, http.StatusOK, map[string]any{
			"success": true,
			"data": map[string]any{
				"orders": []CustomerOrderSummary{},
				"counts": counts,
				"pagination": map[string]any{
					"page":        page,
					"limit":       limit,
					"total":       total,
					"total_pages": totalPages,
				},
			},
		})
		return
	}

	// 3. Load full summaries for paged orders
	summaries, err := h.loadParentOrderSummaries(r.Context(), pagedIDs)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data": map[string]any{
			"orders": summaries,
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

func (h *CustomerHandler) loadParentOrderSummaries(ctx context.Context, orderIDs []int64) ([]CustomerOrderSummary, error) {
	if len(orderIDs) == 0 {
		return []CustomerOrderSummary{}, nil
	}

	placeholders := make([]string, len(orderIDs))
	args := make([]any, len(orderIDs))
	for i, id := range orderIDs {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf(`SELECT o.id, o.order_code, o.subtotal, o.shipping_fee, o.platform_discount, 
		o.shop_discount_total, o.total_amount, o.recipient_name, o.recipient_phone, o.shipping_address, 
		o.created_at, pm.code, pm.name, p.status
		FROM orders o
		JOIN payments p ON p.order_id = o.id
		JOIN payment_methods pm ON p.payment_method_id = pm.id
		WHERE o.id IN (%s)
		ORDER BY o.created_at DESC, o.id DESC`, strings.Join(placeholders, ","))

	rows, err := h.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	summaryMap := make(map[int64]*CustomerOrderSummary)
	for rows.Next() {
		var s CustomerOrderSummary
		if err := rows.Scan(
			&s.ID, &s.OrderCode, &s.Subtotal, &s.ShippingFee, &s.PlatformDiscount,
			&s.ShopDiscountTotal, &s.TotalAmount, &s.RecipientName, &s.RecipientPhone,
			&s.ShippingAddress, &s.CreatedAt, &s.PaymentMethodCode, &s.PaymentMethodName,
			&s.PaymentStatus,
		); err != nil {
			return nil, err
		}
		summaryMap[s.ID] = &s
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// For each order, fetch shop orders and items
	result := make([]CustomerOrderSummary, 0, len(orderIDs))
	for _, id := range orderIDs {
		s, exists := summaryMap[id]
		if !exists {
			continue
		}
		shops, statuses, err := h.loadShopOrdersForOrder(ctx, id)
		if err != nil {
			return nil, err
		}
		s.Shops = shops
		s.Status, s.StatusLabel = deriveParentStatus(statuses)
		result = append(result, *s)
	}

	return result, nil
}

func (h *CustomerHandler) getCustomerOrderDetail(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Order ID or order code is required")
		return
	}

	var o CustomerOrderDetail
	var note sql.NullString
	var orderID int64
	var payID int64
	var payAmount float64
	var payStatus string
	var payTxnRef sql.NullString
	var payPaidAt sql.NullTime
	var pmCode, pmName string

	query := `SELECT o.id, o.order_code, o.subtotal, o.shipping_fee, o.platform_discount, 
		o.shop_discount_total, o.total_amount, o.recipient_name, o.recipient_phone, o.shipping_address, 
		o.note, o.created_at, o.updated_at,
		p.id, p.amount, p.status, p.transaction_ref, p.paid_at,
		pm.code, pm.name
		FROM orders o
		JOIN payments p ON p.order_id = o.id
		JOIN payment_methods pm ON p.payment_method_id = pm.id
		WHERE (o.id = ? OR o.order_code = ?) AND o.user_id = ?`

	parsedID, _ := strconv.ParseInt(param, 10, 64)
	err = h.db.QueryRowContext(r.Context(), query, parsedID, param, uid).Scan(
		&o.ID, &o.OrderCode, &o.Subtotal, &o.ShippingFee, &o.PlatformDiscount,
		&o.ShopDiscountTotal, &o.TotalAmount, &o.RecipientName, &o.RecipientPhone, &o.ShippingAddress,
		&note, &o.CreatedAt, &o.UpdatedAt,
		&payID, &payAmount, &payStatus, &payTxnRef, &payPaidAt,
		&pmCode, &pmName,
	)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	orderID = o.ID
	if note.Valid && note.String != "" {
		o.Note = &note.String
	}

	o.Payment = PaymentInfoView{
		ID:            payID,
		PaymentMethod: pmCode,
		MethodName:    pmName,
		Amount:        payAmount,
		Status:        payStatus,
	}
	if payTxnRef.Valid {
		o.Payment.TransactionRef = &payTxnRef.String
	}
	if payPaidAt.Valid {
		o.Payment.PaidAt = &payPaidAt.Time
	}

	// Load shop orders and their items
	shopOrders, statuses, err := h.loadShopOrdersForOrder(r.Context(), orderID)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	o.Shops = shopOrders
	o.Status, o.StatusLabel = deriveParentStatus(statuses)

	// Build refund info if applicable
	hasCancelledOrReturned := false
	for _, s := range statuses {
		if s == "CANCELLED" || s == "RETURNED" {
			hasCancelledOrReturned = true
			break
		}
	}
	if hasCancelledOrReturned || payStatus == "REFUNDED" {
		refund := RefundInfoView{
			RefundAmount: o.TotalAmount,
		}
		if pmCode == "COD" && payStatus != "PAID" {
			refund.RefundStatus = "NOT_APPLICABLE"
			refund.RefundMessage = "Đơn hàng thanh toán khi nhận hàng (COD) đã được hủy thành công. Không phát sinh hoàn tiền."
		} else if payStatus == "PAID" {
			refund.RefundStatus = "REFUND_REQUIRES_MANUAL_REVIEW"
			refund.RefundMessage = "Khoản thanh toán đã thu chưa được hoàn tự động; yêu cầu cần được quản trị viên đối soát và xử lý riêng."
		} else if payStatus == "REFUNDED" {
			refund.RefundStatus = "REFUNDED"
			refund.RefundMessage = "Khoản hoàn tiền đã được xác nhận."
		} else {
			refund.RefundStatus = "NOT_PAID"
			refund.RefundMessage = "Chưa phát sinh khoản thanh toán thành công cần hoàn."
		}
		o.RefundInfo = &refund
	}

	// Load timeline logs across shop orders
	timeline, err := h.loadOrderTimeline(r.Context(), orderID)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	o.Timeline = timeline

	// Load return requests
	returns, err := h.loadReturnRequestsForOrder(r.Context(), orderID)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	o.ReturnRequests = returns

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    o,
	})
}

func (h *CustomerHandler) cancelCustomerOrder(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Order ID or code is required")
		return
	}

	var req CancelOrderRequest
	if !httpx.Decode(w, r, &req) {
		return
	}

	req.Reason = strings.TrimSpace(req.Reason)
	if req.Reason == "" {
		req.Reason = "Khách hàng yêu cầu hủy đơn"
	}
	if utf8.RuneCountInString(req.Reason) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_reason", "Lý do hủy không được vượt quá 500 ký tự")
		return
	}

	// Start atomic database transaction
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	// Verify order ownership
	var orderID int64
	var orderCode string
	parsedID, _ := strconv.ParseInt(param, 10, 64)
	err = tx.QueryRowContext(r.Context(),
		`SELECT id, order_code FROM orders WHERE (id = ? OR order_code = ?) AND user_id = ? FOR UPDATE`,
		parsedID, param, uid,
	).Scan(&orderID, &orderCode)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	// Fetch target shop orders for update
	type targetShopOrder struct {
		id     int64
		status string
	}
	var targets []targetShopOrder

	var soRows *sql.Rows
	if req.ShopOrderID != nil && *req.ShopOrderID > 0 {
		soRows, err = tx.QueryContext(r.Context(),
			`SELECT id, status FROM shop_orders WHERE order_id = ? AND id = ? FOR UPDATE`,
			orderID, *req.ShopOrderID,
		)
	} else {
		soRows, err = tx.QueryContext(r.Context(),
			`SELECT id, status FROM shop_orders WHERE order_id = ? FOR UPDATE`,
			orderID,
		)
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer soRows.Close()

	for soRows.Next() {
		var t targetShopOrder
		if err := soRows.Scan(&t.id, &t.status); err != nil {
			serverError(w, h.logger, err)
			return
		}
		targets = append(targets, t)
	}
	if err := soRows.Err(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	if len(targets) == 0 {
		writeError(w, http.StatusNotFound, "shop_order_not_found", "Không tìm thấy đơn hàng của gian hàng để hủy")
		return
	}

	// Check cancellation eligibility
	for _, t := range targets {
		st := strings.ToUpper(t.status)
		if st == "CANCELLED" {
			writeError(w, http.StatusUnprocessableEntity, "order_already_cancelled", "Đơn hàng này đã được hủy trước đó.")
			return
		}
		if st == "PACKING" || st == "SHIPPING" || st == "COMPLETED" || st == "RETURNED" {
			writeError(w, http.StatusUnprocessableEntity, "order_cannot_be_cancelled",
				fmt.Sprintf("Đơn hàng đang ở trạng thái '%s', đã được gian hàng chuẩn bị hoặc đang vận chuyển nên không thể tự hủy. Vui lòng liên hệ shop.", statusLabel(st)))
			return
		}
	}

	// Update shop orders and restore inventory
	for _, t := range targets {
		// Update status
		_, err = tx.ExecContext(r.Context(),
			`UPDATE shop_orders SET status = 'CANCELLED', cancel_reason = ?, cancelled_at = NOW(), updated_at = NOW() WHERE id = ?`,
			req.Reason, t.id,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}

		// Log status transition history
		if err = recordStatusHistory(r.Context(), tx, t.id, t.status, "CANCELLED", &uid, "Khách hàng hủy đơn: "+req.Reason); err != nil {
			serverError(w, h.logger, err)
			return
		}

		// Restore stock and decrement sold_count atomically
		itemRows, err := tx.QueryContext(r.Context(),
			`SELECT variant_id, product_id, quantity, flash_sale_id FROM order_items WHERE shop_order_id = ? FOR UPDATE`,
			t.id,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}

		type itemRestock struct {
			variantID   int64
			productID   int64
			qty         int64
			flashSaleID sql.NullInt64
		}
		var restocks []itemRestock
		for itemRows.Next() {
			var ir itemRestock
			if err := itemRows.Scan(&ir.variantID, &ir.productID, &ir.qty, &ir.flashSaleID); err != nil {
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
			if ir.flashSaleID.Valid {
				if _, err = tx.ExecContext(r.Context(), `UPDATE flash_sales SET quantity_sold=GREATEST(quantity_sold-?,0) WHERE id=?`, ir.qty, ir.flashSaleID.Int64); err != nil {
					serverError(w, h.logger, err)
					return
				}
			}
		}
	}

	// Handle Payment status & Refund policy message
	var payID int64
	var payAmount float64
	var payStatus string
	var pmCode string
	err = tx.QueryRowContext(r.Context(),
		`SELECT p.id, p.amount, p.status, pm.code
		FROM payments p
		JOIN payment_methods pm ON p.payment_method_id = pm.id
		WHERE p.order_id = ? FOR UPDATE`,
		orderID,
	).Scan(&payID, &payAmount, &payStatus, &pmCode)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		serverError(w, h.logger, err)
		return
	}

	refundStatus := "NOT_APPLICABLE"
	refundMessage := "Đơn hàng thanh toán khi nhận hàng (COD) đã được hủy thành công. Không phát sinh hoàn tiền."

	if payStatus == "PAID" {
		// No provider refund API is integrated yet. Keep the ledger truthful and flag manual reconciliation.
		refundStatus = "REFUND_REQUIRES_MANUAL_REVIEW"
		refundMessage = "Đơn hàng đã hủy. Khoản thanh toán đã thu chưa được hoàn tự động; yêu cầu hoàn tiền cần được xử lý và xác nhận riêng bởi quản trị viên."
	} else {
		if pmCode != "COD" {
			refundStatus = "NOT_PAID"
			refundMessage = "Đơn hàng đã hủy trước khi thanh toán; chưa phát sinh khoản tiền cần hoàn."
		}
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
		"message": "Đã hủy đơn hàng thành công",
		"data": map[string]any{
			"order_id":       orderID,
			"order_code":     orderCode,
			"status":         "CANCELLED",
			"status_label":   "Đã hủy",
			"refund_status":  refundStatus,
			"refund_message": refundMessage,
		},
	})
}

func (h *CustomerHandler) confirmCustomerReceived(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Order ID or code is required")
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	var orderID int64
	parsedID, _ := strconv.ParseInt(param, 10, 64)
	err = tx.QueryRowContext(r.Context(),
		`SELECT id FROM orders WHERE (id = ? OR order_code = ?) AND user_id = ? FOR UPDATE`,
		parsedID, param, uid,
	).Scan(&orderID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Đơn hàng không tồn tại")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	// Find shop orders that are in SHIPPING
	rows, err := tx.QueryContext(r.Context(),
		`SELECT id FROM shop_orders WHERE order_id = ? AND status = 'SHIPPING' FOR UPDATE`,
		orderID,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	var shippingIDs []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			serverError(w, h.logger, err)
			return
		}
		shippingIDs = append(shippingIDs, id)
	}
	rows.Close()

	if len(shippingIDs) == 0 {
		writeError(w, http.StatusUnprocessableEntity, "order_not_shipping", "Đơn hàng hiện không có kiện hàng nào đang vận chuyển để xác nhận nhận hàng.")
		return
	}

	for _, sID := range shippingIDs {
		_, err = tx.ExecContext(r.Context(),
			`UPDATE shop_orders SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = ?`,
			sID,
		)
		if err != nil {
			serverError(w, h.logger, err)
			return
		}
		if err = recordStatusHistory(r.Context(), tx, sID, "SHIPPING", "COMPLETED", &uid, "Khách hàng xác nhận đã nhận hàng thành công"); err != nil {
			serverError(w, h.logger, err)
			return
		}
	}

	// If COD, mark payment as PAID
	_, _ = tx.ExecContext(r.Context(),
		`UPDATE payments p JOIN payment_methods pm ON pm.id=p.payment_method_id SET p.status = 'PAID', p.paid_at = NOW(), p.updated_at = NOW() WHERE p.order_id = ? AND p.status = 'PENDING' AND pm.code = 'COD'`,
		orderID,
	)

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Đã xác nhận nhận hàng và hoàn tất đơn hàng thành công",
	})
}

func (h *CustomerHandler) createCustomerReturnRequest(w http.ResponseWriter, r *http.Request) {
	uidStr := auth.CurrentUser(r).ID
	uid, err := strconv.ParseInt(uidStr, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Order ID or code is required")
		return
	}

	var req CreateReturnRequest
	if !httpx.Decode(w, r, &req) {
		return
	}

	req.Reason = strings.TrimSpace(req.Reason)
	reasonLen := utf8.RuneCountInString(req.Reason)
	if reasonLen < 5 || reasonLen > 1000 {
		writeError(w, http.StatusBadRequest, "invalid_reason", "Lý do đổi trả phải có độ dài từ 5 đến 1000 ký tự")
		return
	}

	req.Type = strings.ToUpper(strings.TrimSpace(req.Type))
	if req.Type == "" {
		req.Type = "RETURN"
	}
	if req.Type != "RETURN" && req.Type != "EXCHANGE" && req.Type != "REFUND" {
		writeError(w, http.StatusBadRequest, "invalid_type", "Loại yêu cầu phải là RETURN, EXCHANGE hoặc REFUND")
		return
	}

	if req.ShopOrderID <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_shop_order_id", "shop_order_id là bắt buộc")
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	defer tx.Rollback()

	// Verify order and shop order
	var orderID int64
	parsedID, _ := strconv.ParseInt(param, 10, 64)
	err = tx.QueryRowContext(r.Context(),
		`SELECT id FROM orders WHERE (id = ? OR order_code = ?) AND user_id = ? FOR UPDATE`,
		parsedID, param, uid,
	).Scan(&orderID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Đơn hàng không tồn tại")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	var soStatus string
	var soTotal float64
	err = tx.QueryRowContext(r.Context(),
		`SELECT status, total_amount FROM shop_orders WHERE id = ? AND order_id = ? FOR UPDATE`,
		req.ShopOrderID, orderID,
	).Scan(&soStatus, &soTotal)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "shop_order_not_found", "Không tìm thấy đơn hàng của gian hàng thuộc đơn hàng này")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}

	if strings.ToUpper(soStatus) != "COMPLETED" {
		writeError(w, http.StatusUnprocessableEntity, "order_not_completed",
			"Chỉ có thể yêu cầu đổi/trả khi đơn hàng đã hoàn tất giao hàng thành công.")
		return
	}

	// Check if already requested or approved
	var existingCount int
	err = tx.QueryRowContext(r.Context(),
		`SELECT COUNT(*) FROM return_requests WHERE shop_order_id = ? AND status IN ('REQUESTED', 'APPROVED')`,
		req.ShopOrderID,
	).Scan(&existingCount)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	if existingCount > 0 {
		writeError(w, http.StatusUnprocessableEntity, "duplicate_return_request", "Đơn hàng này đã có yêu cầu đổi trả đang chờ xử lý.")
		return
	}

	refundAmount := soTotal
	if req.RefundAmount != nil && *req.RefundAmount > 0 {
		refundAmount = *req.RefundAmount
	}

	res, err := tx.ExecContext(r.Context(),
		`INSERT INTO return_requests (shop_order_id, user_id, type, reason, status, refund_amount) VALUES (?, ?, ?, ?, 'REQUESTED', ?)`,
		req.ShopOrderID, uid, req.Type, req.Reason, refundAmount,
	)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	returnID, _ := res.LastInsertId()

	if err = tx.Commit(); err != nil {
		serverError(w, h.logger, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"success": true,
		"message": "Yêu cầu đổi/trả/hoàn tiền đã được gửi tới chủ shop để xử lý.",
		"data": map[string]any{
			"return_request_id": returnID,
			"shop_order_id":     req.ShopOrderID,
			"status":            "REQUESTED",
			"status_label":      "Chờ chủ shop xử lý",
			"refund_amount":     refundAmount,
		},
	})
}

// Helpers for customer handler

func (h *CustomerHandler) loadShopOrdersForOrder(ctx context.Context, orderID int64) ([]ShopOrderView, []string, error) {
	rows, err := h.db.QueryContext(ctx,
		`SELECT so.id, so.order_id, so.shop_id, s.name, so.shop_order_code, so.status,
			so.subtotal, so.shipping_fee, so.shop_discount, so.platform_discount, so.total_amount,
			so.carrier, so.tracking_code, so.cancel_reason,
			so.confirmed_at, so.packed_at, so.shipped_at, so.completed_at, so.cancelled_at,
			so.created_at, so.updated_at
		FROM shop_orders so
		JOIN shops s ON so.shop_id = s.id
		WHERE so.order_id = ?
		ORDER BY so.id ASC`,
		orderID,
	)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var list []ShopOrderView
	var statuses []string

	for rows.Next() {
		var s ShopOrderView
		var carrier, tracking, cancelReason sql.NullString
		var confAt, packAt, shipAt, compAt, cancAt sql.NullTime

		if err := rows.Scan(
			&s.ID, &s.OrderID, &s.ShopID, &s.ShopName, &s.ShopOrderCode, &s.Status,
			&s.Subtotal, &s.ShippingFee, &s.ShopDiscount, &s.PlatformDiscount, &s.TotalAmount,
			&carrier, &tracking, &cancelReason,
			&confAt, &packAt, &shipAt, &compAt, &cancAt,
			&s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, nil, err
		}

		s.StatusLabel = statusLabel(s.Status)
		statuses = append(statuses, s.Status)

		if carrier.Valid {
			s.Carrier = &carrier.String
		}
		if tracking.Valid {
			s.TrackingCode = &tracking.String
		}
		if cancelReason.Valid {
			s.CancelReason = &cancelReason.String
		}
		if confAt.Valid {
			s.ConfirmedAt = &confAt.Time
		}
		if packAt.Valid {
			s.PackedAt = &packAt.Time
		}
		if shipAt.Valid {
			s.ShippedAt = &shipAt.Time
		}
		if compAt.Valid {
			s.CompletedAt = &compAt.Time
		}
		if cancAt.Valid {
			s.CancelledAt = &cancAt.Time
		}

		list = append(list, s)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	// Load items for each shop order
	for i := range list {
		items, err := h.loadOrderItems(ctx, list[i].ID)
		if err != nil {
			return nil, nil, err
		}
		list[i].Items = items
	}

	return list, statuses, nil
}

func (h *CustomerHandler) loadOrderItems(ctx context.Context, shopOrderID int64) ([]OrderItemView, error) {
	rows, err := h.db.QueryContext(ctx,
		`SELECT id, product_id, variant_id, product_name, variant_name, sku, image_url, unit_price, quantity, line_total
		FROM order_items
		WHERE shop_order_id = ?
		ORDER BY id ASC`,
		shopOrderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []OrderItemView
	for rows.Next() {
		var it OrderItemView
		var vName, img sql.NullString
		if err := rows.Scan(
			&it.ID, &it.ProductID, &it.VariantID, &it.ProductName, &vName,
			&it.SKU, &img, &it.UnitPrice, &it.Quantity, &it.LineTotal,
		); err != nil {
			return nil, err
		}
		if vName.Valid {
			it.VariantName = vName.String
		}
		if img.Valid {
			it.ImageURL = img.String
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

func (h *CustomerHandler) loadOrderTimeline(ctx context.Context, orderID int64) ([]TimelineLogView, error) {
	rows, err := h.db.QueryContext(ctx,
		`SELECT osh.id, osh.from_status, osh.to_status, osh.note, osh.created_at
		FROM order_status_history osh
		JOIN shop_orders so ON osh.shop_order_id = so.id
		WHERE so.order_id = ?
		ORDER BY osh.created_at ASC, osh.id ASC`,
		orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []TimelineLogView
	for rows.Next() {
		var l TimelineLogView
		var fromSt, note sql.NullString
		var toSt string
		if err := rows.Scan(&l.ID, &fromSt, &toSt, &note, &l.CreatedAt); err != nil {
			return nil, err
		}
		l.Time = l.CreatedAt.Format("02/01/2006 15:04")
		l.Title = statusLabel(toSt)
		if note.Valid && note.String != "" {
			l.Note = note.String
			l.Subtitle = note.String
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

func (h *CustomerHandler) loadReturnRequestsForOrder(ctx context.Context, orderID int64) ([]ReturnView, error) {
	rows, err := h.db.QueryContext(ctx,
		`SELECT rr.id, rr.shop_order_id, so.shop_order_code, rr.user_id, u.full_name, u.phone, 
			rr.type, rr.reason, rr.status, rr.refund_amount, rr.handled_by, rr.handled_note, 
			rr.created_at, rr.updated_at
		FROM return_requests rr
		JOIN shop_orders so ON rr.shop_order_id = so.id
		JOIN users u ON rr.user_id = u.id
		WHERE so.order_id = ?
		ORDER BY rr.id DESC`,
		orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []ReturnView
	for rows.Next() {
		var r ReturnView
		var refAmt sql.NullFloat64
		var handledBy sql.NullInt64
		var handledNote sql.NullString

		if err := rows.Scan(
			&r.ID, &r.ShopOrderID, &r.ShopOrderCode, &r.UserID, &r.UserName, &r.UserPhone,
			&r.Type, &r.Reason, &r.Status, &refAmt, &handledBy, &handledNote,
			&r.CreatedAt, &r.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if refAmt.Valid {
			r.RefundAmount = &refAmt.Float64
		}
		if handledBy.Valid {
			r.HandledBy = &handledBy.Int64
		}
		if handledNote.Valid {
			r.HandledNote = &handledNote.String
		}
		list = append(list, r)
	}
	return list, rows.Err()
}
