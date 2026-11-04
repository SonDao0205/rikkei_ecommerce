package auth

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"
)

func (a *App) me(w http.ResponseWriter, r *http.Request) {
	u := current(r)
	var v User
	e := a.db.QueryRowContext(r.Context(), `SELECT id,email,full_name,phone,role,status,email_verified,created_at FROM users WHERE id=?`, u.ID).Scan(&v.ID, &v.Email, &v.FullName, &v.Phone, &v.Role, &v.Status, &v.EmailVerified, &v.CreatedAt)
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
	err := a.db.QueryRowContext(r.Context(), `SELECT id,email,full_name,phone,role,status,email_verified,created_at FROM users WHERE id=?`, u.ID).Scan(&updated.ID, &updated.Email, &updated.FullName, &updated.Phone, &updated.Role, &updated.Status, &updated.EmailVerified, &updated.CreatedAt)
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

func (a *App) listUsers(w http.ResponseWriter, r *http.Request) {
	rows, e := a.db.QueryContext(r.Context(), `SELECT id,email,full_name,phone,role,status,email_verified,created_at FROM users ORDER BY created_at DESC LIMIT 100`)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	defer rows.Close()
	users := []User{}
	for rows.Next() {
		var u User
		if e = rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Role, &u.Status, &u.EmailVerified, &u.CreatedAt); e != nil {
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
