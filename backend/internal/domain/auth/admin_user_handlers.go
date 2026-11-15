package auth

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"unicode/utf8"

	"golang.org/x/crypto/bcrypt"
	"rikkei-ecommerce/internal/platform/auditlog"
)

type adminUserRequest struct {
	FullName string   `json:"full_name"`
	Email    string   `json:"email"`
	Phone    string   `json:"phone"`
	Password string   `json:"password,omitempty"`
	Roles    []string `json:"roles,omitempty"`
	Status   string   `json:"status,omitempty"`
	Reason   string   `json:"reason,omitempty"`
}

func (a *App) getAdminUser(w http.ResponseWriter, r *http.Request) {
	id, ok := adminUserID(w, r)
	if !ok {
		return
	}
	user, err := a.loadAdminUser(r, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "user_not_found", "User was not found")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": user})
}

func (a *App) createAdminUser(w http.ResponseWriter, r *http.Request) {
	var request adminUserRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateAdminUserRequest(w, &request, true) {
		return
	}
	roles, ok := normalizeAdminRoles(w, request.Roles)
	if !ok {
		return
	}
	if containsRole(roles, "SELLER") {
		writeError(w, http.StatusBadRequest, "seller_role_requires_approved_shop", "Seller role is granted only after a shop is approved")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(request.Password), passwordHashCost)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	status := strings.ToUpper(strings.TrimSpace(request.Status))
	if status == "" {
		status = "ACTIVE"
	}
	if status != "ACTIVE" && status != "LOCKED" {
		writeError(w, http.StatusBadRequest, "invalid_user_status", "status must be ACTIVE or LOCKED")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(r.Context(), `INSERT INTO users(email,phone,password_hash,full_name,email_verified,status,role,lock_reason,locked_at) VALUES(?,?,?,?,1,?,'client',?,IF(?='LOCKED',UTC_TIMESTAMP(),NULL))`, request.Email, request.Phone, string(hash), request.FullName, status, nullableLockReason(status, request.Reason), status)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			writeError(w, http.StatusConflict, "user_contact_in_use", "Email or phone is already in use")
		} else {
			a.serverError(w, r, err)
		}
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	for _, role := range roles {
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO user_roles(user_id,role_code) VALUES(?,?)`, id, role); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if err = auditlog.Record(r.Context(), tx, CurrentUser(r).ID, "USER_CREATED", "user", id, nil, map[string]any{"email": request.Email, "roles": roles, "status": status, "reason": strings.TrimSpace(request.Reason)}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	user, err := a.loadAdminUser(r, id)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "data": user})
}

func (a *App) updateAdminUser(w http.ResponseWriter, r *http.Request) {
	id, ok := adminUserID(w, r)
	if !ok {
		return
	}
	if idString := CurrentUser(r).ID; idString == strconv.FormatInt(id, 10) {
		writeError(w, http.StatusConflict, "cannot_edit_own_admin_account", "Administrators cannot edit their own account through user management")
		return
	}
	var request adminUserRequest
	if !decode(w, r, &request) {
		return
	}
	request.Password = ""
	if !validateAdminUserRequest(w, &request, false) {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var oldStatus string
	if err = tx.QueryRowContext(r.Context(), `SELECT status FROM users WHERE id=? FOR UPDATE`, id).Scan(&oldStatus); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "user_not_found", "User was not found")
		return
	} else if err != nil {
		a.serverError(w, r, err)
		return
	}
	var isAdmin bool
	if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=? AND role_code='ADMIN')`, id).Scan(&isAdmin); err != nil {
		a.serverError(w, r, err)
		return
	}
	if isAdmin {
		writeError(w, http.StatusConflict, "admin_account_protected", "Admin role and profile cannot be changed through this endpoint")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE users SET full_name=?,email=?,phone=? WHERE id=?`, request.FullName, request.Email, request.Phone, id); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			writeError(w, http.StatusConflict, "user_contact_in_use", "Email or phone is already in use")
		} else {
			a.serverError(w, r, err)
		}
		return
	}
	if request.Status != "" && strings.ToUpper(request.Status) != oldStatus {
		status := strings.ToUpper(request.Status)
		if _, err = tx.ExecContext(r.Context(), `UPDATE users SET status=?,lock_reason=?,locked_at=IF(?='LOCKED',UTC_TIMESTAMP(),NULL) WHERE id=?`, status, nullableLockReason(status, request.Reason), status, id); err != nil {
			a.serverError(w, r, err)
			return
		}
		if status == "LOCKED" {
			if _, err = tx.ExecContext(r.Context(), `UPDATE refresh_tokens SET revoked=1 WHERE user_id=? AND revoked=0`, id); err != nil {
				a.serverError(w, r, err)
				return
			}
			if err = suspendActiveUserShops(r.Context(), tx, id, request.Reason, CurrentUser(r).ID); err != nil {
				a.serverError(w, r, err)
				return
			}
		}
	}
	if request.Roles != nil {
		roles, ok := normalizeAdminRoles(w, request.Roles)
		if !ok {
			return
		}
		var hasActiveShop bool
		if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM shops WHERE owner_id=? AND status='ACTIVE')`, id).Scan(&hasActiveShop); err != nil {
			a.serverError(w, r, err)
			return
		}
		if hasActiveShop && !containsRole(roles, "SELLER") {
			writeError(w, http.StatusConflict, "active_shop_requires_seller_role", "An active shop owner must retain the SELLER role")
			return
		}
		if containsRole(roles, "SELLER") && !hasActiveShop {
			writeError(w, http.StatusBadRequest, "seller_role_requires_approved_shop", "Seller role is granted only after a shop is approved")
			return
		}
		if _, err = tx.ExecContext(r.Context(), `DELETE FROM user_roles WHERE user_id=? AND role_code IN ('CLIENT','SELLER')`, id); err != nil {
			a.serverError(w, r, err)
			return
		}
		for _, role := range roles {
			if _, err = tx.ExecContext(r.Context(), `INSERT INTO user_roles(user_id,role_code) VALUES(?,?)`, id, role); err != nil {
				a.serverError(w, r, err)
				return
			}
		}
		legacyRole := "client"
		if containsRole(roles, "SELLER") {
			legacyRole = "seller"
		}
		if _, err = tx.ExecContext(r.Context(), `UPDATE users SET role=? WHERE id=?`, legacyRole, id); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	newStatus := oldStatus
	if request.Status != "" {
		newStatus = strings.ToUpper(request.Status)
	}
	if err = auditlog.Record(r.Context(), tx, CurrentUser(r).ID, "USER_UPDATED", "user", id, map[string]any{"status": oldStatus}, map[string]any{"full_name": request.FullName, "email": request.Email, "phone": request.Phone, "status": newStatus, "reason": strings.TrimSpace(request.Reason)}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	user, err := a.loadAdminUser(r, id)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": user})
}

func (a *App) loadAdminUser(r *http.Request, id int64) (User, error) {
	var user User
	err := a.db.QueryRowContext(r.Context(), `SELECT id,COALESCE(email,''),full_name,phone,avatar_url,role,status,email_verified,created_at,lock_reason,locked_at FROM users WHERE id=?`, id).
		Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.AvatarURL, &user.Role, &user.Status, &user.EmailVerified, &user.CreatedAt, &user.LockReason, &user.LockedAt)
	if err != nil {
		return User{}, err
	}
	user.Roles, err = loadUserRoles(r.Context(), a.db, strconv.FormatInt(id, 10))
	if err != nil {
		return User{}, err
	}
	user.Role = primaryRole(user.Roles)
	user.ShopStatus, err = loadUserShopStatus(r.Context(), a.db, strconv.FormatInt(id, 10))
	return user, err
}

func adminUserID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_user_id", "User ID must be a positive integer")
		return 0, false
	}
	return id, true
}

func validateAdminUserRequest(w http.ResponseWriter, request *adminUserRequest, creating bool) bool {
	request.FullName = strings.TrimSpace(request.FullName)
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))
	request.Phone = strings.TrimSpace(request.Phone)
	nameLength := utf8.RuneCountInString(request.FullName)
	if nameLength < 2 || nameLength > 120 {
		writeError(w, http.StatusBadRequest, "invalid_name", "Full name must be 2 to 120 characters")
		return false
	}
	address, err := mail.ParseAddress(request.Email)
	if err != nil || address.Address != request.Email || len(request.Email) > 150 {
		writeError(w, http.StatusBadRequest, "invalid_email", "A valid email address is required")
		return false
	}
	if !validPhone(request.Phone) {
		writeError(w, http.StatusBadRequest, "invalid_phone", "Phone must contain 9 to 15 digits and may start with +")
		return false
	}
	if creating && !validPassword(request.Password) {
		writeError(w, http.StatusBadRequest, "invalid_password", "Password must contain 10 to 72 characters with letters and numbers")
		return false
	}
	if request.Status != "" && strings.ToUpper(request.Status) != "ACTIVE" && strings.ToUpper(request.Status) != "LOCKED" {
		writeError(w, http.StatusBadRequest, "invalid_user_status", "status must be ACTIVE or LOCKED")
		return false
	}
	request.Reason = strings.TrimSpace(request.Reason)
	if strings.ToUpper(request.Status) == "LOCKED" && (request.Reason == "" || utf8.RuneCountInString(request.Reason) > 500) {
		writeError(w, http.StatusBadRequest, "invalid_lock_reason", "A lock reason up to 500 characters is required")
		return false
	}
	return true
}

func normalizeAdminRoles(w http.ResponseWriter, input []string) ([]string, bool) {
	seen := map[string]bool{}
	roles := make([]string, 0, len(input))
	for _, value := range input {
		role := strings.ToUpper(strings.TrimSpace(value))
		if role != "CLIENT" && role != "SELLER" {
			writeError(w, http.StatusBadRequest, "invalid_role", "Only CLIENT and SELLER roles can be managed here; ADMIN is protected")
			return nil, false
		}
		if !seen[role] {
			seen[role] = true
			roles = append(roles, role)
		}
	}
	if !seen["CLIENT"] {
		writeError(w, http.StatusBadRequest, "client_role_required", "Every account must retain the CLIENT role")
		return nil, false
	}
	return roles, true
}

func containsRole(roles []string, expected string) bool {
	for _, role := range roles {
		if role == expected {
			return true
		}
	}
	return false
}

func nullableLockReason(status, reason string) any {
	if status != "LOCKED" {
		return nil
	}
	return strings.TrimSpace(reason)
}

func suspendActiveUserShops(ctx context.Context, tx *sql.Tx, userID int64, reason, actorID string) error {
	rows, err := tx.QueryContext(ctx, `SELECT id FROM shops WHERE owner_id=? AND status='ACTIVE' FOR UPDATE`, userID)
	if err != nil {
		return err
	}
	shopIDs := make([]int64, 0, 1)
	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil {
			rows.Close()
			return err
		}
		shopIDs = append(shopIDs, id)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	for _, shopID := range shopIDs {
		if _, err = tx.ExecContext(ctx, `UPDATE shops SET status='SUSPENDED',reject_reason=? WHERE id=? AND status='ACTIVE'`, strings.TrimSpace(reason), shopID); err != nil {
			return err
		}
		if err = auditlog.Record(ctx, tx, actorID, "SHOP_STATUS_CHANGED", "shop", shopID, map[string]any{"status": "ACTIVE"}, map[string]any{"status": "SUSPENDED", "reason": strings.TrimSpace(reason), "trigger": "OWNER_LOCKED"}); err != nil {
			return err
		}
	}
	return nil
}
