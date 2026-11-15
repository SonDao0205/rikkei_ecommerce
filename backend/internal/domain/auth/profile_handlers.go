package auth

import (
	"database/sql"
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"unicode/utf8"

	"rikkei-ecommerce/internal/platform/auditlog"
)

func (a *App) me(w http.ResponseWriter, r *http.Request) {
	u := current(r)
	var v User
	e := a.db.QueryRowContext(r.Context(), `SELECT id,email,full_name,phone,avatar_url,role,status,email_verified,created_at FROM users WHERE id=?`, u.ID).Scan(&v.ID, &v.Email, &v.FullName, &v.Phone, &v.AvatarURL, &v.Role, &v.Status, &v.EmailVerified, &v.CreatedAt)
	if errors.Is(e, sql.ErrNoRows) {
		writeError(w, 401, "invalid_session", "Session is invalid")
		return
	}
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	v.Roles, e = loadUserRoles(r.Context(), a.db, u.ID)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	v.Role = primaryRole(v.Roles)
	v.ShopStatus, e = loadUserShopStatus(r.Context(), a.db, u.ID)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": v})
}

func (a *App) updateProfile(w http.ResponseWriter, r *http.Request) {
	var q struct {
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
	}
	if !decode(w, r, &q) {
		return
	}
	q.FullName = strings.TrimSpace(q.FullName)
	q.Phone = strings.TrimSpace(q.Phone)
	if len(q.FullName) < 2 || len(q.FullName) > 120 {
		writeError(w, 400, "invalid_name", "Full name must be 2 to 120 characters")
		return
	}
	u := current(r)
	if q.Phone == "" {
		if err := a.db.QueryRowContext(r.Context(), `SELECT phone FROM users WHERE id=?`, u.ID).Scan(&q.Phone); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if !validPhone(q.Phone) {
		writeError(w, 400, "invalid_phone", "Phone must contain 9 to 15 digits and may start with +")
		return
	}
	if _, err := a.db.ExecContext(r.Context(), `UPDATE users SET full_name=?,phone=? WHERE id=?`, q.FullName, q.Phone, u.ID); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			writeError(w, 409, "phone_in_use", "Phone number is already in use")
			return
		}
		a.serverError(w, r, err)
		return
	}
	var updated User
	err := a.db.QueryRowContext(r.Context(), `SELECT id,email,full_name,phone,avatar_url,role,status,email_verified,created_at FROM users WHERE id=?`, u.ID).Scan(&updated.ID, &updated.Email, &updated.FullName, &updated.Phone, &updated.AvatarURL, &updated.Role, &updated.Status, &updated.EmailVerified, &updated.CreatedAt)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	updated.Roles, err = loadUserRoles(r.Context(), a.db, u.ID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	updated.Role = primaryRole(updated.Roles)
	updated.ShopStatus, err = loadUserShopStatus(r.Context(), a.db, u.ID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": updated, "message": "Profile updated"})
}

func (a *App) updateAvatar(w http.ResponseWriter, r *http.Request) {
	var request struct {
		AvatarURL string `json:"avatar_url"`
	}
	if !decode(w, r, &request) {
		return
	}
	request.AvatarURL = strings.TrimSpace(request.AvatarURL)
	if !validCloudinaryAvatarURL(request.AvatarURL, a.cfg.CloudinaryCloudName) {
		writeError(w, http.StatusBadRequest, "invalid_avatar_url", "Avatar URL must be a secure URL hosted by the configured Cloudinary account")
		return
	}
	user := current(r)
	if _, err := a.db.ExecContext(r.Context(), `UPDATE users SET avatar_url=? WHERE id=?`, request.AvatarURL, user.ID); err != nil {
		a.serverError(w, r, err)
		return
	}
	a.writeProfileWithAvatar(w, r, user.ID)
}

func (a *App) removeAvatar(w http.ResponseWriter, r *http.Request) {
	user := current(r)
	if _, err := a.db.ExecContext(r.Context(), `UPDATE users SET avatar_url=NULL WHERE id=?`, user.ID); err != nil {
		a.serverError(w, r, err)
		return
	}
	a.writeProfileWithAvatar(w, r, user.ID)
}

func (a *App) writeProfileWithAvatar(w http.ResponseWriter, r *http.Request, userID string) {
	var user User
	err := a.db.QueryRowContext(r.Context(), `SELECT id,email,full_name,phone,avatar_url,role,status,email_verified,created_at FROM users WHERE id=?`, userID).
		Scan(&user.ID, &user.Email, &user.FullName, &user.Phone, &user.AvatarURL, &user.Role, &user.Status, &user.EmailVerified, &user.CreatedAt)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	user.Roles, err = loadUserRoles(r.Context(), a.db, userID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	user.Role = primaryRole(user.Roles)
	user.ShopStatus, err = loadUserShopStatus(r.Context(), a.db, userID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": user, "message": "Avatar updated"})
}

func validCloudinaryAvatarURL(value, cloudName string) bool {
	parsed, err := url.Parse(value)
	if err != nil || cloudName == "" || parsed.Scheme != "https" || parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" || parsed.Host == "" {
		return false
	}
	return strings.EqualFold(parsed.Host, "res.cloudinary.com") && strings.HasPrefix(parsed.Path, "/"+cloudName+"/") && len(value) <= 500
}

func (a *App) listUsers(w http.ResponseWriter, r *http.Request) {
	rows, e := a.db.QueryContext(r.Context(), `SELECT id,COALESCE(email,''),full_name,phone,role,status,email_verified,created_at,lock_reason,locked_at FROM users ORDER BY created_at DESC LIMIT 100`)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	defer rows.Close()
	users := []User{}
	for rows.Next() {
		var u User
		if e = rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Role, &u.Status, &u.EmailVerified, &u.CreatedAt, &u.LockReason, &u.LockedAt); e != nil {
			a.serverError(w, r, e)
			return
		}
		u.Roles, e = loadUserRoles(r.Context(), a.db, u.ID)
		if e != nil {
			a.serverError(w, r, e)
			return
		}
		u.Role = primaryRole(u.Roles)
		u.ShopStatus, e = loadUserShopStatus(r.Context(), a.db, u.ID)
		if e != nil {
			a.serverError(w, r, e)
			return
		}
		users = append(users, u)
	}
	if e = rows.Err(); e != nil {
		a.serverError(w, r, e)
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": users})
}

func (a *App) updateAdminUserStatus(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || userID <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_user_id", "User ID must be a positive integer")
		return
	}
	var request struct {
		Status string `json:"status"`
		Reason string `json:"reason"`
	}
	if !decode(w, r, &request) {
		return
	}
	request.Status = strings.ToUpper(strings.TrimSpace(request.Status))
	request.Reason = strings.TrimSpace(request.Reason)
	if request.Status != "ACTIVE" && request.Status != "LOCKED" {
		writeError(w, http.StatusBadRequest, "invalid_user_status", "status must be ACTIVE or LOCKED")
		return
	}
	if request.Status == "LOCKED" && request.Reason == "" || utf8.RuneCountInString(request.Reason) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_lock_reason", "A lock reason up to 500 characters is required")
		return
	}
	actor := current(r)
	actorID, err := strconv.ParseInt(actor.ID, 10, 64)
	if err != nil || actorID == userID {
		writeError(w, http.StatusConflict, "cannot_change_own_status", "Administrators cannot change their own account status")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var oldStatus string
	if err = tx.QueryRowContext(r.Context(), `SELECT status FROM users WHERE id=? FOR UPDATE`, userID).Scan(&oldStatus); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "user_not_found", "User was not found")
		return
	} else if err != nil {
		a.serverError(w, r, err)
		return
	}
	if oldStatus == request.Status {
		writeError(w, http.StatusConflict, "user_status_unchanged", "User already has the requested status")
		return
	}
	var isAdmin bool
	if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=? AND role_code='ADMIN')`, userID).Scan(&isAdmin); err != nil {
		a.serverError(w, r, err)
		return
	}
	if isAdmin {
		writeError(w, http.StatusConflict, "admin_account_protected", "Administrator accounts cannot be changed through user management")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE users SET status=?,lock_reason=?,locked_at=IF(?='LOCKED',UTC_TIMESTAMP(),NULL) WHERE id=?`, request.Status, nullableLockReason(request.Status, request.Reason), request.Status, userID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if request.Status == "LOCKED" {
		if _, err = tx.ExecContext(r.Context(), `UPDATE refresh_tokens SET revoked=1 WHERE user_id=? AND revoked=0`, userID); err != nil {
			a.serverError(w, r, err)
			return
		}
		if err = suspendActiveUserShops(r.Context(), tx, userID, request.Reason, actor.ID); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	if err = auditlog.Record(r.Context(), tx, actor.ID, "USER_STATUS_CHANGED", "user", userID,
		map[string]any{"status": oldStatus}, map[string]any{"status": request.Status, "reason": request.Reason}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	user, err := a.loadAdminUser(r, userID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": user})
}
