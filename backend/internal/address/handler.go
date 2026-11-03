package address

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/httpx"
)

const maxAddressesPerUser = 20

type address struct {
	ID            int64  `json:"id"`
	UserID        int64  `json:"user_id,omitempty"`
	RecipientName string `json:"recipient_name"`
	Phone         string `json:"phone"`
	Province      string `json:"province"`
	District      string `json:"district"`
	Ward          string `json:"ward"`
	StreetDetail  string `json:"street_detail"`
	IsDefault     bool   `json:"is_default"`
	AddressType   string `json:"address_type"`
	CreatedAt     string `json:"created_at,omitempty"`
	UpdatedAt     string `json:"updated_at,omitempty"`
}

type addressRequest struct {
	ID            *int64          `json:"id"`
	RecipientName string          `json:"recipient_name"`
	Phone         string          `json:"phone"`
	Province      string          `json:"province"`
	District      string          `json:"district"`
	Ward          string          `json:"ward"`
	StreetDetail  string          `json:"street_detail"`
	IsDefault     *requestBoolean `json:"is_default"`
	AddressType   string          `json:"address_type"`
}

type requestBoolean bool

func (b *requestBoolean) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		return errors.New("expected a boolean or 0/1")
	}
	var booleanValue bool
	if err := json.Unmarshal(data, &booleanValue); err == nil {
		*b = requestBoolean(booleanValue)
		return nil
	}
	var integerValue int
	if err := json.Unmarshal(data, &integerValue); err != nil || integerValue < 0 || integerValue > 1 {
		return errors.New("expected a boolean or 0/1")
	}
	*b = requestBoolean(integerValue == 1)
	return nil
}

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := &Handler{db: db, logger: logger}
	mux.Handle("GET /api/v1/addresses", security.RequireAuth(handler.listAddresses))
	mux.Handle("POST /api/v1/addresses", security.RequireAuth(handler.createAddress))
	mux.Handle("PUT /api/v1/addresses/{id}", security.RequireAuth(handler.updateAddress))
	mux.Handle("DELETE /api/v1/addresses/{id}", security.RequireAuth(handler.deleteAddress))
	mux.Handle("PATCH /api/v1/addresses/{id}/default", security.RequireAuth(handler.setDefaultAddress))
}

func (a *Handler) listAddresses(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `SELECT id,user_id,recipient_name,phone,province,district,ward,
		street_detail,is_default,address_type,created_at,updated_at
		FROM addresses WHERE user_id=? ORDER BY is_default DESC,created_at DESC,id DESC`, userID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer rows.Close()
	items := make([]address, 0)
	for rows.Next() {
		item, scanErr := scanAddress(rows)
		if scanErr != nil {
			a.serverError(w, r, scanErr)
			return
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": items})
}

func (a *Handler) createAddress(w http.ResponseWriter, r *http.Request) {
	var request addressRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateAddressRequest(w, &request) {
		return
	}
	if request.ID != nil {
		writeError(w, http.StatusBadRequest, "unexpected_address_id", "Address ID is only accepted when updating an address")
		return
	}
	if request.AddressType == "" {
		request.AddressType = "HOME"
	}
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	if !a.lockAddressOwner(w, r, tx, userID) {
		return
	}
	var count int
	if err = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM addresses WHERE user_id=?`, userID).Scan(&count); err != nil {
		a.serverError(w, r, err)
		return
	}
	if count >= maxAddressesPerUser {
		writeError(w, http.StatusConflict, "address_limit_reached", "An account can store at most 20 addresses")
		return
	}
	isDefault := count == 0 || request.IsDefault != nil && bool(*request.IsDefault)
	if isDefault {
		if _, err = tx.ExecContext(r.Context(), `UPDATE addresses SET is_default=0 WHERE user_id=?`, userID); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	result, err := tx.ExecContext(r.Context(), `INSERT INTO addresses
		(user_id,recipient_name,phone,province,district,ward,street_detail,is_default,address_type)
		VALUES(?,?,?,?,?,?,?,?,?)`, userID, request.RecipientName, request.Phone, request.Province,
		request.District, request.Ward, request.StreetDetail, isDefault, request.AddressType)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	item, err := a.addressForOwner(r, userID, id)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "data": item, "message": "Address created"})
}

func (a *Handler) updateAddress(w http.ResponseWriter, r *http.Request) {
	var request addressRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateAddressRequest(w, &request) {
		return
	}
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	id, ok := parseAddressID(w, r)
	if !ok {
		return
	}
	if request.ID != nil && *request.ID != id {
		writeError(w, http.StatusBadRequest, "address_id_mismatch", "The body address ID must match the URL")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	if !a.lockAddressOwner(w, r, tx, userID) {
		return
	}
	var currentDefault bool
	var currentAddressType string
	if err = tx.QueryRowContext(r.Context(), `SELECT is_default,address_type FROM addresses WHERE id=? AND user_id=? FOR UPDATE`, id, userID).Scan(&currentDefault, &currentAddressType); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "address_not_found", "Address was not found")
			return
		}
		a.serverError(w, r, err)
		return
	}
	isDefault := currentDefault
	if request.IsDefault != nil {
		isDefault = bool(*request.IsDefault)
	}
	if request.AddressType == "" {
		request.AddressType = currentAddressType
	}
	if isDefault {
		if _, err = tx.ExecContext(r.Context(), `UPDATE addresses SET is_default=0 WHERE user_id=?`, userID); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE addresses SET recipient_name=?,phone=?,province=?,district=?,
		ward=?,street_detail=?,is_default=?,address_type=? WHERE id=? AND user_id=?`,
		request.RecipientName, request.Phone, request.Province, request.District, request.Ward,
		request.StreetDetail, isDefault, request.AddressType, id, userID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if currentDefault && !isDefault {
		if err = promoteFirstAddress(r, tx, userID, id); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	item, err := a.addressForOwner(r, userID, id)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": item, "message": "Address updated"})
}

func (a *Handler) deleteAddress(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	id, ok := parseAddressID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	if !a.lockAddressOwner(w, r, tx, userID) {
		return
	}
	var wasDefault bool
	if err = tx.QueryRowContext(r.Context(), `SELECT is_default FROM addresses WHERE id=? AND user_id=? FOR UPDATE`, id, userID).Scan(&wasDefault); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "address_not_found", "Address was not found")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `DELETE FROM addresses WHERE id=? AND user_id=?`, id, userID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if wasDefault {
		if err = promoteFirstAddress(r, tx, userID, 0); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": id, "message": "Address deleted"})
}

func (a *Handler) setDefaultAddress(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	id, ok := parseAddressID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	if !a.lockAddressOwner(w, r, tx, userID) {
		return
	}
	var exists bool
	if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM addresses WHERE id=? AND user_id=?)`, id, userID).Scan(&exists); err != nil {
		a.serverError(w, r, err)
		return
	}
	if !exists {
		writeError(w, http.StatusNotFound, "address_not_found", "Address was not found")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE addresses SET is_default=(id=?) WHERE user_id=?`, id, userID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	item, err := a.addressForOwner(r, userID, id)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": item, "message": "Default address updated"})
}

func scanAddress(row scanner) (address, error) {
	var item address
	var createdAt, updatedAt sql.NullTime
	err := row.Scan(&item.ID, &item.UserID, &item.RecipientName, &item.Phone, &item.Province, &item.District,
		&item.Ward, &item.StreetDetail, &item.IsDefault, &item.AddressType, &createdAt, &updatedAt)
	if err != nil {
		return address{}, err
	}
	if createdAt.Valid {
		item.CreatedAt = createdAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	if updatedAt.Valid {
		item.UpdatedAt = updatedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	return item, nil
}

func (a *Handler) addressForOwner(r *http.Request, userID, addressID int64) (address, error) {
	return scanAddress(a.db.QueryRowContext(r.Context(), `SELECT id,user_id,recipient_name,phone,province,district,
		ward,street_detail,is_default,address_type,created_at,updated_at
		FROM addresses WHERE id=? AND user_id=?`, addressID, userID))
}

func validateAddressRequest(w http.ResponseWriter, request *addressRequest) bool {
	request.RecipientName = strings.TrimSpace(request.RecipientName)
	request.Phone = strings.TrimSpace(request.Phone)
	request.Province = strings.TrimSpace(request.Province)
	request.District = strings.TrimSpace(request.District)
	request.Ward = strings.TrimSpace(request.Ward)
	request.StreetDetail = strings.TrimSpace(request.StreetDetail)
	request.AddressType = strings.ToUpper(strings.TrimSpace(request.AddressType))
	fields := []struct {
		name  string
		value string
		min   int
		max   int
	}{
		{"recipient_name", request.RecipientName, 2, 120},
		{"province", request.Province, 1, 100},
		{"district", request.District, 1, 100},
		{"ward", request.Ward, 1, 100},
		{"street_detail", request.StreetDetail, 3, 255},
	}
	for _, field := range fields {
		length := utf8.RuneCountInString(field.value)
		if length < field.min || length > field.max {
			writeError(w, http.StatusBadRequest, "invalid_"+field.name, field.name+" has an invalid length")
			return false
		}
	}
	if !validPhone(request.Phone) {
		writeError(w, http.StatusBadRequest, "invalid_phone", "Phone must contain 9 to 15 digits and may start with +")
		return false
	}
	if request.AddressType != "" && request.AddressType != "HOME" && request.AddressType != "OFFICE" && request.AddressType != "OTHER" {
		writeError(w, http.StatusBadRequest, "invalid_address_type", "address_type must be HOME, OFFICE, or OTHER")
		return false
	}
	return true
}

func parseAddressID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_address_id", "Address ID must be a positive integer")
		return 0, false
	}
	return id, true
}

func (a *Handler) lockAddressOwner(w http.ResponseWriter, r *http.Request, tx *sql.Tx, userID int64) bool {
	var id int64
	err := tx.QueryRowContext(r.Context(), `SELECT id FROM users WHERE id=? AND status='ACTIVE' FOR UPDATE`, userID).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "inactive_account", "An active account is required")
		return false
	}
	if err != nil {
		a.serverError(w, r, err)
		return false
	}
	return true
}

func promoteFirstAddress(r *http.Request, tx *sql.Tx, userID, excludeID int64) error {
	var id int64
	err := tx.QueryRowContext(r.Context(), `SELECT id FROM addresses WHERE user_id=? AND id<>? ORDER BY created_at,id LIMIT 1`, userID, excludeID).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		if excludeID > 0 {
			_, err = tx.ExecContext(r.Context(), `UPDATE addresses SET is_default=1 WHERE id=? AND user_id=?`, excludeID, userID)
			return err
		}
		return nil
	}
	if err != nil {
		return err
	}
	_, err = tx.ExecContext(r.Context(), `UPDATE addresses SET is_default=(id=?) WHERE user_id=?`, id, userID)
	return err
}

type scanner interface {
	Scan(dest ...any) error
}

func authenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || id <= 0 {
		httpx.WriteError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return id, true
}

func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	return httpx.Decode(w, r, target)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	httpx.WriteJSON(w, status, value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}

func validPhone(value string) bool { return httpx.ValidPhone(value) }

func (a *Handler) serverError(w http.ResponseWriter, _ *http.Request, err error) {
	httpx.ServerError(w, a.logger, err)
}
