package auth

import (
	"context"
	"crypto/hmac"
	"database/sql"
	"errors"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
}

type loginRequest struct {
	Email      string `json:"email"`
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

func (a *App) register(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 10, time.Minute) {
		return
	}
	var q registerRequest
	if !decode(w, r, &q) {
		return
	}
	q.Email = strings.ToLower(strings.TrimSpace(q.Email))
	q.FullName = strings.TrimSpace(q.FullName)
	q.Phone = strings.TrimSpace(q.Phone)
	parsed, e := mail.ParseAddress(q.Email)
	if e != nil || parsed.Address != q.Email || len(q.Email) > 150 {
		writeError(w, 400, "invalid_email", "A valid email is required")
		return
	}
	if len(q.FullName) < 2 || len(q.FullName) > 120 {
		writeError(w, 400, "invalid_name", "Full name must be 2 to 120 characters")
		return
	}
	if !validPhone(q.Phone) {
		writeError(w, 400, "invalid_phone", "Phone must contain 9 to 15 digits and may start with +")
		return
	}
	if !validPassword(q.Password) {
		writeError(w, 400, "weak_password", "Password must be at least 10 characters and contain a letter and a number")
		return
	}
	hash, e := bcrypt.GenerateFromPassword([]byte(q.Password), passwordHashCost)
	if e != nil {
		writeError(w, 500, "internal_error", "Internal server error")
		return
	}
	res, e := a.db.ExecContext(r.Context(), `INSERT INTO users(email,phone,password_hash,full_name,role) VALUES(?,?,?,?, 'client')`, q.Email, q.Phone, string(hash), q.FullName)
	if e != nil {
		if strings.Contains(strings.ToLower(e.Error()), "duplicate") {
			writeError(w, 409, "account_exists", "An account with this email or phone already exists")
			return
		}
		a.serverError(w, r, e)
		return
	}
	id, e := res.LastInsertId()
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	u := User{ID: id, Email: q.Email, FullName: q.FullName, Phone: q.Phone, Role: "CLIENT", Status: "ACTIVE", CreatedAt: time.Now().UTC()}
	writeJSON(w, 201, map[string]any{"success": true, "data": u, "message": "Account created"})
}

func (a *App) login(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 10, time.Minute) {
		return
	}
	var q loginRequest
	if !decode(w, r, &q) {
		return
	}
	identifier := strings.TrimSpace(q.Identifier)
	if identifier == "" {
		identifier = strings.TrimSpace(q.Email)
	}
	identifier = (resetOTPRequest{Identifier: identifier}).normalizedIdentifier()
	lookup := `SELECT id,COALESCE(email,''),password_hash,full_name,phone,role,status,email_verified,created_at FROM users WHERE phone=?`
	if strings.Contains(identifier, "@") {
		lookup = `SELECT id,COALESCE(email,''),password_hash,full_name,phone,role,status,email_verified,created_at FROM users WHERE email=?`
	}
	var u User
	var hash string
	err := a.db.QueryRowContext(r.Context(), lookup, identifier).Scan(&u.ID, &u.Email, &hash, &u.FullName, &u.Phone, &u.Role, &u.Status, &u.EmailVerified, &u.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		_ = bcrypt.CompareHashAndPassword(dummyPasswordHash, []byte(q.Password))
		writeError(w, 401, "invalid_credentials", "Email/phone or password is incorrect")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(q.Password)) != nil || u.Status != "ACTIVE" {
		writeError(w, 401, "invalid_credentials", "Email/phone or password is incorrect")
		return
	}
	u.Role = roleFromDB(u.Role)
	accessToken, e := a.newSession(r.Context(), w, u)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]any{"user": u, "access_token": accessToken, "token_type": "Bearer", "expires_in": int64(a.cfg.AccessTTL.Seconds())}})
}

func (a *App) newSession(ctx context.Context, w http.ResponseWriter, u User) (string, error) {
	randomID, e := newID()
	if e != nil {
		return "", e
	}
	placeholder := digest(randomID)
	tx, e := a.db.BeginTx(ctx, nil)
	if e != nil {
		return "", e
	}
	defer tx.Rollback()
	res, e := tx.ExecContext(ctx, `INSERT INTO refresh_tokens(user_id,token_hash,expires_at,revoked) VALUES(?,?,?,0)`, u.ID, placeholder, time.Now().UTC().Add(a.cfg.RefreshTTL))
	if e != nil {
		return "", e
	}
	sessionNumber, e := res.LastInsertId()
	if e != nil {
		return "", e
	}
	sid := strconv.FormatInt(sessionNumber, 10)
	refresh, e := a.issue(u, "refresh", a.cfg.RefreshTTL, sid)
	if e != nil {
		return "", e
	}
	accessToken, e := a.issue(u, "access", a.cfg.AccessTTL, sid)
	if e != nil {
		return "", e
	}
	hash := digest(refresh)
	if _, e = tx.ExecContext(ctx, `UPDATE refresh_tokens SET token_hash=? WHERE id=?`, hash, sessionNumber); e != nil {
		return "", e
	}
	if _, e = tx.ExecContext(ctx, `INSERT INTO auth_refresh_history(refresh_token_id,token_hash) VALUES(?,?)`, sessionNumber, hash); e != nil {
		return "", e
	}
	if e = tx.Commit(); e != nil {
		return "", e
	}
	a.setRefreshCookie(w, refresh, a.cfg.RefreshTTL)
	return accessToken, nil
}

func (a *App) refresh(w http.ResponseWriter, r *http.Request) {
	if a.cfg.AppEnv == "production" && r.Header.Get("Origin") == "" {
		writeError(w, 403, "origin_required", "Origin header is required for refresh requests")
		return
	}
	ck, err := r.Cookie("refresh_token")
	if err != nil {
		writeError(w, 401, "invalid_session", "Refresh session is invalid or expired")
		return
	}
	claims, err := a.parse(ck.Value, "refresh")
	if err != nil {
		a.clearRefreshCookie(w)
		writeError(w, 401, "invalid_session", "Refresh session is invalid or expired")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var uid, status, currentHash string
	var expiresAt time.Time
	err = tx.QueryRowContext(r.Context(), `SELECT rt.user_id, u.status, rt.token_hash, rt.expires_at FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE rt.id=? AND rt.revoked=0 AND rt.expires_at>UTC_TIMESTAMP() FOR UPDATE`, claims.SessionID).Scan(&uid, &status, &currentHash, &expiresAt)
	if errors.Is(err, sql.ErrNoRows) || err == nil && (uid != claims.UserID || status != "ACTIVE") {
		a.clearRefreshCookie(w)
		writeError(w, 401, "invalid_session", "Refresh session is invalid or expired")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	presentedHash := digest(ck.Value)
	if !hmac.Equal([]byte(currentHash), []byte(presentedHash)) {
		var seen int
		replayErr := tx.QueryRowContext(r.Context(), `SELECT 1 FROM auth_refresh_history WHERE refresh_token_id=? AND token_hash=? AND used_at IS NOT NULL`, claims.SessionID, presentedHash).Scan(&seen)
		if replayErr == nil {
			if _, err = tx.ExecContext(r.Context(), `UPDATE refresh_tokens SET revoked=1 WHERE id=? AND revoked=0`, claims.SessionID); err == nil {
				err = tx.Commit()
			}
			if err != nil {
				a.serverError(w, r, err)
				return
			}
		} else if !errors.Is(replayErr, sql.ErrNoRows) {
			a.serverError(w, r, replayErr)
			return
		}
		a.clearRefreshCookie(w)
		writeError(w, 401, "invalid_session", "Refresh session is invalid or expired")
		return
	}
	var u User
	err = tx.QueryRowContext(r.Context(), `SELECT id,COALESCE(email,''),full_name,phone,role,status,email_verified,created_at FROM users WHERE id=?`, uid).Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Role, &u.Status, &u.EmailVerified, &u.CreatedAt)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	u.Role = roleFromDB(u.Role)
	remaining := time.Until(expiresAt)
	if remaining <= 0 {
		a.clearRefreshCookie(w)
		writeError(w, 401, "invalid_session", "Refresh session is invalid or expired")
		return
	}
	refresh, err := a.issue(u, "refresh", remaining, claims.SessionID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	accessToken, err := a.issue(u, "access", a.cfg.AccessTTL, claims.SessionID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	newHash := digest(refresh)
	if _, err = tx.ExecContext(r.Context(), `UPDATE auth_refresh_history SET used_at=UTC_TIMESTAMP() WHERE refresh_token_id=? AND token_hash=? AND used_at IS NULL`, claims.SessionID, currentHash); err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO auth_refresh_history(refresh_token_id,token_hash) VALUES(?,?)`, claims.SessionID, newHash); err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE refresh_tokens SET token_hash=? WHERE id=? AND revoked=0`, newHash, claims.SessionID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	a.setRefreshCookie(w, refresh, remaining)
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]any{"user": u, "access_token": accessToken, "token_type": "Bearer", "expires_in": int64(a.cfg.AccessTTL.Seconds())}})
}

func (a *App) logout(w http.ResponseWriter, r *http.Request) {
	u := current(r)
	_, e := a.db.ExecContext(r.Context(), `UPDATE refresh_tokens SET revoked=1 WHERE id=? AND user_id=? AND revoked=0`, u.SessionID, u.ID)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	a.clearRefreshCookie(w)
	writeJSON(w, 200, map[string]any{"success": true, "message": "Signed out"})
}
