package shop

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"unicode/utf8"

	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/httpx"
)

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

func NewHandler(db *sql.DB, logger *log.Logger) *Handler {
	return &Handler{db: db, logger: logger}
}

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := NewHandler(db, logger)
	mux.Handle("POST /api/v1/shops", security.RequireRole("CLIENT", handler.createShop))
	mux.Handle("POST /api/v1/me/shop", security.RequireRole("CLIENT", handler.createShopDraft))
	mux.Handle("GET /api/v1/me/shop", security.RequireAuth(handler.myShop))
	mux.Handle("PUT /api/v1/me/shop", security.RequireAuth(handler.updateMyShop))
	mux.Handle("POST /api/v1/me/shop/submit", security.RequireRole("CLIENT", handler.submitShop))
	mux.Handle("GET /api/v1/admin/shops", security.RequireRole("ADMIN", handler.listAdminShops))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/status", security.RequireRole("ADMIN", handler.updateShopStatus))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/approve", security.RequireRole("ADMIN", handler.approveShop))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/reject", security.RequireRole("ADMIN", handler.rejectShop))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/lock", security.RequireRole("ADMIN", handler.lockShop))
}

type shopProfileRequest struct {
	Name             string  `json:"name"`
	Description      string  `json:"description"`
	LogoURL          *string `json:"logo_url"`
	BannerURL        *string `json:"banner_url"`
	Phone            string  `json:"phone"`
	WarehouseAddress string  `json:"warehouse_address"`
}

type managedShop struct {
	ID               int64   `json:"id"`
	OwnerID          int64   `json:"owner_id,omitempty"`
	Name             string  `json:"name"`
	Description      *string `json:"description"`
	LogoURL          *string `json:"logo_url"`
	BannerURL        *string `json:"banner_url"`
	Phone            *string `json:"phone"`
	WarehouseAddress *string `json:"warehouse_address,omitempty"`
	Status           string  `json:"status"`
	RejectReason     *string `json:"reject_reason,omitempty"`
	ApprovalNotes    *string `json:"approval_notes,omitempty"`
	FollowerCount    int64   `json:"follower_count"`
	ApprovedAt       *string `json:"approved_at"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
	OwnerName        string  `json:"owner_name,omitempty"`
	OwnerEmail       *string `json:"owner_email,omitempty"`
	OwnerPhone       string  `json:"owner_phone,omitempty"`
}

func (a *Handler) createShop(w http.ResponseWriter, r *http.Request) {
	a.createShopWithStatus(w, r, "PENDING")
}

func (a *Handler) createShopDraft(w http.ResponseWriter, r *http.Request) {
	a.createShopWithStatus(w, r, "DRAFT")
}

func (a *Handler) createShopWithStatus(w http.ResponseWriter, r *http.Request, status string) {
	var request shopProfileRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateShopProfile(w, &request) {
		return
	}
	user := auth.CurrentUser(r)
	ownerID, err := strconv.ParseInt(user.ID, 10, 64)
	if err != nil || ownerID <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}
	result, err := a.db.ExecContext(r.Context(), `INSERT INTO shops
		(owner_id,name,description,logo_url,banner_url,phone,warehouse_address,status)
		VALUES(?,?,?,?,?,?,?,?)`,
		ownerID, request.Name, nullableText(request.Description), request.LogoURL, request.BannerURL,
		request.Phone, request.WarehouseAddress, status)
	if err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "shop_already_exists", "This account or shop name is already in use")
			return
		}
		a.serverError(w, r, err)
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if shop.ID != id {
		a.serverError(w, r, fmt.Errorf("created shop ID mismatch"))
		return
	}
	message := "Shop draft created"
	if status == "PENDING" {
		message = "Shop application submitted"
	}
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "data": shop, "message": message})
}

func (a *Handler) myShop(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "shop_not_found", "You do not have a shop")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop})
}

func (a *Handler) updateMyShop(w http.ResponseWriter, r *http.Request) {
	var request shopProfileRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateShopProfile(w, &request) {
		return
	}
	ownerID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()

	var shopID int64
	var status string
	if err = tx.QueryRowContext(r.Context(), `SELECT id,status FROM shops WHERE owner_id=? FOR UPDATE`, ownerID).Scan(&shopID, &status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "shop_not_found", "You do not have a shop")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if status != "DRAFT" && status != "REJECTED" && status != "NEEDS_INFO" && status != "PENDING" && status != "ACTIVE" {
		writeError(w, http.StatusConflict, "shop_not_editable", "This shop cannot be edited in its current state")
		return
	}
	_, err = tx.ExecContext(r.Context(), `UPDATE shops
		SET name=?,description=?,logo_url=?,banner_url=?,phone=?,warehouse_address=?
		WHERE id=? AND owner_id=?`,
		request.Name, nullableText(request.Description), request.LogoURL, request.BannerURL,
		request.Phone, request.WarehouseAddress, shopID, ownerID)
	if err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "shop_name_in_use", "Shop name is already in use")
			return
		}
		a.serverError(w, r, err)
		return
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
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop, "message": "Shop profile updated"})
}

func (a *Handler) submitShop(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	result, err := a.db.ExecContext(r.Context(), `UPDATE shops
		SET status='PENDING',reject_reason=NULL
		WHERE owner_id=? AND status IN ('DRAFT','NEEDS_INFO','REJECTED')`, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	affected, err := result.RowsAffected()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if affected == 0 {
		shop, loadErr := a.shopForOwner(r, ownerID)
		if errors.Is(loadErr, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "shop_not_found", "Create a shop draft before submitting it")
			return
		}
		if loadErr != nil {
			a.serverError(w, r, loadErr)
			return
		}
		if shop.Status == "PENDING" {
			writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop, "message": "Shop application is already under review"})
			return
		}
		writeError(w, http.StatusConflict, "shop_not_submittable", "This shop cannot be submitted in its current state")
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop, "message": "Shop application submitted"})
}

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
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{
		"shops": shops, "total": total, "page": page, "pageSize": limit, "limit": limit,
	}})
}

type shopStatusRequest struct {
	Status       string `json:"status"`
	RejectReason string `json:"reject_reason"`
	Notes        string `json:"notes"`
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
	allowedTransition := currentShopStatus == status ||
		status == "ACTIVE" && (currentShopStatus == "PENDING" || currentShopStatus == "SUSPENDED") ||
		status == "REJECTED" && (currentShopStatus == "PENDING" || currentShopStatus == "NEEDS_INFO") ||
		status == "NEEDS_INFO" && currentShopStatus == "PENDING" ||
		status == "SUSPENDED" && currentShopStatus == "ACTIVE"
	if !allowedTransition {
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

func (a *Handler) shopForOwner(r *http.Request, ownerID int64) (managedShop, error) {
	row := a.db.QueryRowContext(r.Context(), `SELECT s.id,s.owner_id,s.name,s.description,s.logo_url,s.banner_url,s.phone,
		s.warehouse_address,s.status,s.reject_reason,s.approval_notes,s.follower_count,s.approved_at,s.created_at,s.updated_at,
		u.full_name,u.email,u.phone
		FROM shops s JOIN users u ON u.id=s.owner_id WHERE s.owner_id=?`, ownerID)
	return scanManagedShop(row)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanManagedShop(row scanner) (managedShop, error) {
	var shop managedShop
	var phone, rejectReason, approvalNotes, email sql.NullString
	var approvedTime sql.NullTime
	var createdAt, updatedAt sql.NullTime
	err := row.Scan(&shop.ID, &shop.OwnerID, &shop.Name, &shop.Description, &shop.LogoURL, &shop.BannerURL,
		&phone, &shop.WarehouseAddress, &shop.Status, &rejectReason, &approvalNotes, &shop.FollowerCount, &approvedTime,
		&createdAt, &updatedAt, &shop.OwnerName, &email, &shop.OwnerPhone)
	if err != nil {
		return managedShop{}, err
	}
	if phone.Valid {
		shop.Phone = &phone.String
	}
	if approvedTime.Valid {
		formatted := approvedTime.Time.UTC().Format("2006-01-02T15:04:05Z")
		shop.ApprovedAt = &formatted
	}
	if rejectReason.Valid {
		shop.RejectReason = &rejectReason.String
	}
	if approvalNotes.Valid {
		shop.ApprovalNotes = &approvalNotes.String
	}
	if email.Valid {
		shop.OwnerEmail = &email.String
	}
	if createdAt.Valid {
		shop.CreatedAt = createdAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	if updatedAt.Valid {
		shop.UpdatedAt = updatedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	return shop, nil
}

func validateShopProfile(w http.ResponseWriter, request *shopProfileRequest) bool {
	request.Name = strings.TrimSpace(request.Name)
	request.Description = strings.TrimSpace(request.Description)
	request.Phone = strings.TrimSpace(request.Phone)
	request.WarehouseAddress = strings.TrimSpace(request.WarehouseAddress)
	if !validTextLength(request.Name, 2, 150) {
		writeError(w, http.StatusBadRequest, "invalid_shop_name", "Shop name must be 2 to 150 characters")
		return false
	}
	if utf8.RuneCountInString(request.Description) > 2000 {
		writeError(w, http.StatusBadRequest, "invalid_shop_description", "Description must be at most 2000 characters")
		return false
	}
	if request.Phone != "" && !validPhone(request.Phone) {
		writeError(w, http.StatusBadRequest, "invalid_shop_phone", "Phone must contain 9 to 15 digits and may start with +")
		return false
	}
	if !validTextLength(request.WarehouseAddress, 5, 500) {
		writeError(w, http.StatusBadRequest, "invalid_warehouse_address", "Warehouse address must be 5 to 500 characters")
		return false
	}
	if !validateOptionalHTTPSURL(w, "logo_url", request.LogoURL, 500) ||
		!validateOptionalHTTPSURL(w, "banner_url", request.BannerURL, 500) {
		return false
	}
	if request.Phone == "" {
		request.Phone = ""
	}
	return true
}

func validateOptionalHTTPSURL(w http.ResponseWriter, field string, value *string, maxLength int) bool {
	if value == nil {
		return true
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		*value = ""
		return true
	}
	parsed, err := url.Parse(trimmed)
	if err != nil || len(trimmed) > maxLength || parsed.Scheme != "https" ||
		parsed.Host == "" || parsed.User != nil || parsed.Hostname() == "" {
		writeError(w, http.StatusBadRequest, "invalid_"+field, field+" must be an absolute HTTPS URL")
		return false
	}
	*value = trimmed
	return true
}

func authenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return id, true
}

func parseListPage(values url.Values) (int, int, error) { return httpx.ParseListPage(values) }
func isMySQLDuplicate(err error) bool                   { return httpx.IsMySQLDuplicate(err) }
func validPhone(value string) bool                      { return httpx.ValidPhone(value) }
func validTextLength(value string, minimum, maximum int) bool {
	return httpx.ValidTextLength(value, minimum, maximum)
}
func nullableText(value string) any { return httpx.NullableText(value) }
func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	return httpx.Decode(w, r, target)
}
func writeJSON(w http.ResponseWriter, status int, value any) { httpx.WriteJSON(w, status, value) }
func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}
func (a *Handler) serverError(w http.ResponseWriter, _ *http.Request, err error) {
	httpx.ServerError(w, a.logger, err)
}

func Migrate(ctx context.Context, db *sql.DB) error {
	var exists int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema=DATABASE() AND table_name='shops' AND column_name='approval_notes'`).Scan(&exists); err != nil {
		return err
	}
	if exists == 0 {
		if _, err := db.ExecContext(ctx, `ALTER TABLE shops ADD COLUMN approval_notes VARCHAR(500) NULL AFTER reject_reason`); err != nil {
			return err
		}
	}
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.check_constraints
		WHERE constraint_schema=DATABASE() AND constraint_name='chk_shops_status'
		AND LOCATE('DRAFT',check_clause)>0 AND LOCATE('NEEDS_INFO',check_clause)>0`).Scan(&exists); err != nil {
		return err
	}
	if exists > 0 {
		return nil
	}
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.table_constraints
		WHERE table_schema=DATABASE() AND table_name='shops' AND constraint_name='chk_shops_status'`).Scan(&exists); err != nil {
		return err
	}
	if exists > 0 {
		if _, err := db.ExecContext(ctx, `ALTER TABLE shops DROP CHECK chk_shops_status`); err != nil {
			return err
		}
	}
	_, err := db.ExecContext(ctx, `ALTER TABLE shops ADD CONSTRAINT chk_shops_status
		CHECK (status IN ('DRAFT','PENDING','NEEDS_INFO','ACTIVE','REJECTED','SUSPENDED'))`)
	return err
}
