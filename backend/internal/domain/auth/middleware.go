package auth

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"rikkei-ecommerce/internal/platform/observability"
)

func (a *App) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		v := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
		if v == "" || v == r.Header.Get("Authorization") {
			writeError(w, 401, "unauthorized", "Bearer access token is required")
			return
		}
		c, e := a.parse(v, "access")
		if e != nil {
			writeError(w, 401, "unauthorized", "Access token is invalid or expired")
			return
		}
		var status string
		e = a.db.QueryRowContext(r.Context(), `SELECT status FROM users WHERE id=?`, c.UserID).Scan(&status)
		if errors.Is(e, sql.ErrNoRows) || e == nil && status != "ACTIVE" {
			writeError(w, 401, "unauthorized", "Session is invalid")
			return
		}
		if e != nil {
			a.serverError(w, r, e)
			return
		}
		var active int
		e = a.db.QueryRowContext(r.Context(), `SELECT 1 FROM refresh_tokens WHERE id=? AND user_id=? AND revoked=0 AND expires_at>UTC_TIMESTAMP()`, c.SessionID, c.UserID).Scan(&active)
		if errors.Is(e, sql.ErrNoRows) {
			writeError(w, 401, "unauthorized", "Session is invalid or expired")
			return
		}
		if e != nil {
			a.serverError(w, r, e)
			return
		}
		roles, err := loadUserRoles(r.Context(), a.db, c.UserID)
		if err != nil {
			a.serverError(w, r, err)
			return
		}
		observability.WithUserID(r.Context(), c.UserID)
		next(w, r.WithContext(context.WithValue(r.Context(), ctxKey{}, contextUser{
			ID: c.UserID, Role: primaryRole(roles), Roles: roles, SessionID: c.SessionID,
		})))
	}
}

func (a *App) requireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return a.requireAuth(func(w http.ResponseWriter, r *http.Request) {
		if !hasRole(current(r).Roles, role) {
			writeError(w, 403, "forbidden", "Insufficient permissions")
			return
		}
		next(w, r)
	})
}

func current(r *http.Request) contextUser {
	u, _ := r.Context().Value(ctxKey{}).(contextUser)
	return u
}

func CurrentUser(r *http.Request) Identity {
	user := current(r)
	return Identity{ID: user.ID, Role: user.Role, Roles: append([]string(nil), user.Roles...), SessionID: user.SessionID}
}

func WithUser(ctx context.Context, id, role string) context.Context {
	return context.WithValue(ctx, ctxKey{}, contextUser{
		ID:    id,
		Role:  role,
		Roles: []string{role},
	})
}
