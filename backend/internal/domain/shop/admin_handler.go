package shop

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/auditlog"
	"strconv"
	"strings"
	"unicode/utf8"
)

func (a *Handler) listAdminShops(w http.ResponseWriter, r *http.Request) {
	values, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_query", "Query string is malformed")
		return
	}
	for key, items := range values {
		if key != "status" && key != "statusTab" && key != "search" && key != "category" &&
			key != "commissionTier" && key != "rating" && key != "page" && key != "limit" && key != "pageSize" {
			writeError(w, http.StatusBadRequest, "invalid_query", "Unsupported shop filter")
			return
		}
		if len(items) != 1 {
			writeError(w, http.StatusBadRequest, "invalid_query", "Query parameters must be provided once")
			return
		}
	}
	statusRaw := values.Get("status")
	if values.Get("statusTab") != "" {
		if statusRaw != "" {
			writeError(w, http.StatusBadRequest, "invalid_query", "Provide only one status filter")
			return
		}
		statusRaw = values.Get("statusTab")
	}
	status := strings.ToUpper(strings.TrimSpace(statusRaw))
	if status == "ALL" {
		status = ""
	}
	if status != "" && status != "DRAFT" && status != "PENDING" && status != "NEEDS_INFO" && status != "ACTIVE" && status != "REJECTED" && status != "SUSPENDED" {
		writeError(w, http.StatusBadRequest, "invalid_shop_status", "status must be all, DRAFT, PENDING, NEEDS_INFO, ACTIVE, REJECTED, or SUSPENDED")
		return
	}
	for _, unsupportedFilter := range []string{"category", "commissionTier", "rating"} {
		value := strings.TrimSpace(values.Get(unsupportedFilter))
		if value != "" && !strings.EqualFold(value, "all") {
			writeError(w, http.StatusBadRequest, "unsupported_shop_filter", unsupportedFilter+" is not supported by the current shop schema")
			return
		}
	}
	search := strings.TrimSpace(values.Get("search"))
	if utf8.RuneCountInString(search) > 100 {
		writeError(w, http.StatusBadRequest, "invalid_search", "search must be at most 100 characters")
		return
	}
	if values.Get("pageSize") != "" {
		if values.Get("limit") != "" {
			writeError(w, http.StatusBadRequest, "invalid_query", "Provide only one of pageSize or limit")
			return
		}
		values.Set("limit", values.Get("pageSize"))
	}
	page, limit, err := parseListPage(values)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_pagination", err.Error())
		return
	}
	query := `SELECT s.id,s.owner_id,s.name,s.description,s.logo_url,s.banner_url,s.phone,
		s.warehouse_address,s.status,s.reject_reason,s.approval_notes,s.follower_count,s.approved_at,s.created_at,s.updated_at,
		u.full_name,u.email,u.phone
		FROM shops s JOIN users u ON u.id=s.owner_id
		WHERE (?='' OR s.status=?) AND (?='' OR LOCATE(?,LOWER(CONCAT_WS(' ',s.name,u.full_name,u.email,u.phone)))>0)
		ORDER BY s.created_at DESC,s.id DESC LIMIT ? OFFSET ?`
	searchLower := strings.ToLower(search)
	rows, err := a.db.QueryContext(r.Context(), query, status, status, searchLower, searchLower, limit, (page-1)*limit)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer rows.Close()
	shops := make([]managedShop, 0)
	for rows.Next() {
		shop, scanErr := scanManagedShop(rows)
		if scanErr != nil {
			a.serverError(w, r, scanErr)
			return
		}
		shops = append(shops, shop)
	}
	if err = rows.Err(); err != nil {
		a.serverError(w, r, err)
		return
	}
	var total int64
	if err = a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM shops WHERE (?='' OR status=?)`, status, status).Scan(&total); err != nil {
		a.serverError(w, r, err)
		return
	}
	if searchLower != "" {
		if err = a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM shops s JOIN users u ON u.id=s.owner_id
			WHERE (?='' OR s.status=?) AND LOCATE(?,LOWER(CONCAT_WS(' ',s.name,u.full_name,u.email,u.phone)))>0`,
			status, status, searchLower).Scan(&total); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	statusCounts := map[string]int64{
		"DRAFT": 0, "PENDING": 0, "NEEDS_INFO": 0,
		"ACTIVE": 0, "REJECTED": 0, "SUSPENDED": 0,
	}
	countRows, err := a.db.QueryContext(r.Context(), `SELECT status,COUNT(*) FROM shops GROUP BY status`)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	for countRows.Next() {
		var currentStatus string
		var count int64
		if err = countRows.Scan(&currentStatus, &count); err != nil {
			countRows.Close()
			a.serverError(w, r, err)
			return
		}
		if _, ok := statusCounts[currentStatus]; !ok {
			countRows.Close()
			a.serverError(w, r, fmt.Errorf("unknown shop status %q", currentStatus))
			return
		}
		statusCounts[currentStatus] = count
	}
	if err = countRows.Err(); err != nil {
		countRows.Close()
		a.serverError(w, r, err)
		return
	}
	if err = countRows.Close(); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{
		"shops": shops, "total": total, "page": page, "pageSize": limit, "limit": limit,
		"status_counts": statusCounts,
	}})
}

func (a *Handler) updateShopStatus(w http.ResponseWriter, r *http.Request) {
	var request shopStatusRequest
	if !decode(w, r, &request) {
		return
	}
	shopID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || shopID <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_shop_id", "Shop ID must be a positive integer")
		return
	}
	a.applyShopStatus(w, r, shopID, request.Status, request.RejectReason, request.Notes)
}

func (a *Handler) approveShop(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Notes string `json:"notes"`
	}
	if !decode(w, r, &request) {
		return
	}
	if utf8.RuneCountInString(strings.TrimSpace(request.Notes)) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_notes", "notes must be at most 500 characters")
		return
	}
	shopID, ok := parseManagedShopID(w, r)
	if !ok {
		return
	}
	a.applyShopStatus(w, r, shopID, "ACTIVE", "", request.Notes)
}

func (a *Handler) rejectShop(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Reason string `json:"reason"`
	}
	if !decode(w, r, &request) {
		return
	}
	shopID, ok := parseManagedShopID(w, r)
	if !ok {
		return
	}
	a.applyShopStatus(w, r, shopID, "REJECTED", request.Reason, "")
}

func (a *Handler) lockShop(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Reason string `json:"reason"`
	}
	if !decode(w, r, &request) {
		return
	}
	shopID, ok := parseManagedShopID(w, r)
	if !ok {
		return
	}
	a.applyShopStatus(w, r, shopID, "SUSPENDED", request.Reason, "")
}

func parseManagedShopID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_shop_id", "Shop ID must be a positive integer")
		return 0, false
	}
	return id, true
}

func (a *Handler) applyShopStatus(w http.ResponseWriter, r *http.Request, shopID int64, status, rejectReason, approvalNotes string) {
	status = strings.ToUpper(strings.TrimSpace(status))
	rejectReason = strings.TrimSpace(rejectReason)
	approvalNotes = strings.TrimSpace(approvalNotes)
	if status != "ACTIVE" && status != "REJECTED" && status != "SUSPENDED" && status != "NEEDS_INFO" {
		writeError(w, http.StatusBadRequest, "invalid_shop_status", "status must be ACTIVE, NEEDS_INFO, REJECTED, or SUSPENDED")
		return
	}
	if utf8.RuneCountInString(rejectReason) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_reject_reason", "reason must be at most 500 characters")
		return
	}
	if utf8.RuneCountInString(approvalNotes) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_notes", "notes must be at most 500 characters")
		return
	}
	if (status == "REJECTED" || status == "NEEDS_INFO" || status == "SUSPENDED") && rejectReason == "" {
		writeError(w, http.StatusBadRequest, "invalid_reject_reason", "A reason is required when rejecting, requesting information, or suspending a shop")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var ownerID int64
	var ownerStatus, currentShopStatus string
	if err = tx.QueryRowContext(r.Context(), `SELECT s.owner_id,u.status,s.status
		FROM shops s JOIN users u ON u.id=s.owner_id WHERE s.id=? FOR UPDATE`, shopID).Scan(&ownerID, &ownerStatus, &currentShopStatus); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "shop_not_found", "Shop was not found")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if !allowedShopTransition(currentShopStatus, status) {
		writeError(w, http.StatusConflict, "invalid_shop_transition", "Shop cannot transition from "+currentShopStatus+" to "+status)
		return
	}
	if status == "ACTIVE" && ownerStatus != "ACTIVE" {
		writeError(w, http.StatusConflict, "shop_owner_inactive", "An inactive account cannot be approved as a seller")
		return
	}
	if status == "ACTIVE" {
		var isClient int
		if err = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM user_roles WHERE user_id=? AND role_code='CLIENT'`, ownerID).Scan(&isClient); err != nil {
			a.serverError(w, r, err)
			return
		}
		if isClient != 1 {
			writeError(w, http.StatusConflict, "invalid_shop_owner_role", "Shop owner must have a customer account")
			return
		}
	}
	reason := any(rejectReason)
	if status == "ACTIVE" {
		reason = nil
	}
	_, err = tx.ExecContext(r.Context(), `UPDATE shops SET status=?,reject_reason=?,
		approval_notes=CASE WHEN ?='ACTIVE' AND ?<>'' THEN ? ELSE approval_notes END,
		approved_at=CASE WHEN ?='ACTIVE' THEN COALESCE(approved_at,UTC_TIMESTAMP()) ELSE approved_at END
		WHERE id=?`, status, reason, status, approvalNotes, nullableText(approvalNotes), status, shopID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if status == "ACTIVE" {
		if _, err = tx.ExecContext(r.Context(), `INSERT IGNORE INTO user_roles(user_id,role_code) VALUES(?,'SELLER')`, ownerID); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if currentShopStatus != status {
		if err = auditlog.Record(r.Context(), tx, auth.CurrentUser(r).ID, "SHOP_STATUS_CHANGED", "shop", shopID,
			map[string]any{"status": currentShopStatus}, map[string]any{"status": status}); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop})
}

func allowedShopTransition(current, target string) bool {
	return current == target ||
		target == "ACTIVE" && (current == "PENDING" || current == "SUSPENDED") ||
		target == "REJECTED" && (current == "PENDING" || current == "NEEDS_INFO") ||
		target == "NEEDS_INFO" && current == "PENDING" ||
		target == "SUSPENDED" && current == "ACTIVE"
}
