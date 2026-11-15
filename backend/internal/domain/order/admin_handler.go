package order

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type AdminHandler struct {
	db     *sql.DB
	logger *log.Logger
}

func (h *AdminHandler) listAdminOrders(w http.ResponseWriter, r *http.Request) {
	values := r.URL.Query()
	for key, entries := range values {
		if key != "status" && key != "search" && key != "page" && key != "limit" || len(entries) != 1 {
			writeError(w, http.StatusBadRequest, "invalid_query", "Unsupported or repeated order filter")
			return
		}
	}
	page, limit, err := parseListPage(values)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_pagination", err.Error())
		return
	}
	if limit > 100 {
		limit = 100
	}
	status := strings.ToUpper(strings.TrimSpace(values.Get("status")))
	if status == "ALL" {
		status = ""
	}
	if !validAdminOrderStatus(status) {
		writeError(w, http.StatusBadRequest, "invalid_order_status", "Unsupported order status")
		return
	}
	search := strings.TrimSpace(values.Get("search"))
	if len(search) > 100 {
		writeError(w, http.StatusBadRequest, "invalid_search", "search must be at most 100 bytes")
		return
	}
	pattern := "%" + strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(search, "!", "!!"), "%", "!%"), "_", "!_") + "%"
	filter := `(?='' OR EXISTS(SELECT 1 FROM shop_orders so WHERE so.order_id=o.id AND so.status=?))
		AND (?='' OR o.order_code LIKE ? ESCAPE '!' OR u.full_name LIKE ? ESCAPE '!' OR u.phone LIKE ? ESCAPE '!'
		OR EXISTS(SELECT 1 FROM shop_orders so2 JOIN shops s ON s.id=so2.shop_id WHERE so2.order_id=o.id AND s.name LIKE ? ESCAPE '!'))`
	args := []any{status, status, search, pattern, pattern, pattern, pattern}
	rows, err := h.db.QueryContext(r.Context(), `SELECT o.id FROM orders o JOIN users u ON u.id=o.user_id WHERE `+filter+
		` ORDER BY o.created_at DESC,o.id DESC LIMIT ? OFFSET ?`, append(args, limit, (page-1)*limit)...)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	ids := make([]int64, 0, limit)
	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil {
			rows.Close()
			serverError(w, h.logger, err)
			return
		}
		ids = append(ids, id)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		serverError(w, h.logger, err)
		return
	}
	if err = rows.Close(); err != nil {
		serverError(w, h.logger, err)
		return
	}
	var total int64
	if err = h.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM orders o JOIN users u ON u.id=o.user_id WHERE `+filter, args...).Scan(&total); err != nil {
		serverError(w, h.logger, err)
		return
	}
	orders, err := (&CustomerHandler{db: h.db, logger: h.logger}).loadParentOrderSummaries(r.Context(), ids)
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"orders": orders, "total": total, "page": page, "limit": limit}})
}

func (h *AdminHandler) getAdminOrderDetail(w http.ResponseWriter, r *http.Request) {
	param := strings.TrimSpace(r.PathValue("id"))
	if param == "" || len(param) > 30 {
		writeError(w, http.StatusBadRequest, "invalid_order_id", "Order ID or code is required")
		return
	}
	parsedID, _ := strconv.ParseInt(param, 10, 64)
	var id int64
	err := h.db.QueryRowContext(r.Context(), `SELECT id FROM orders WHERE id=? OR order_code=?`, parsedID, param).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "order_not_found", "Order was not found")
		return
	}
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	orders, err := (&CustomerHandler{db: h.db, logger: h.logger}).loadParentOrderSummaries(r.Context(), []int64{id})
	if err != nil {
		serverError(w, h.logger, err)
		return
	}
	if len(orders) == 0 {
		writeError(w, http.StatusNotFound, "order_not_found", "Order was not found")
		return
	}
	var buyer struct {
		ID     int64  `json:"id"`
		Name   string `json:"name"`
		Email  string `json:"email"`
		Phone  string `json:"phone"`
		Status string `json:"status"`
	}
	if err = h.db.QueryRowContext(r.Context(), `SELECT u.id,u.full_name,COALESCE(u.email,''),u.phone,u.status FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?`, id).Scan(&buyer.ID, &buyer.Name, &buyer.Email, &buyer.Phone, &buyer.Status); err != nil {
		serverError(w, h.logger, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"order": orders[0], "buyer": buyer}})
}

func validAdminOrderStatus(status string) bool {
	switch status {
	case "", "PENDING", "CONFIRMED", "PACKING", "SHIPPING", "COMPLETED", "CANCELLED", "RETURNED":
		return true
	default:
		return false
	}
}
