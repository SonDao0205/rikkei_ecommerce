package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math/big"
	"mime"
	"net"
	"net/http"
	"net/mail"
	"net/smtp"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type App struct {
	cfg    Config
	db     *sql.DB
	logger *log.Logger
	mux    *http.ServeMux
	rateMu sync.Mutex
	rates  map[string]rateWindow
}
type rateWindow struct {
	started time.Time
	count   int
}

const passwordHashCost = 12

var dummyPasswordHash, _ = bcrypt.GenerateFromPassword([]byte("unmatched-login-dummy-secret"), passwordHashCost)

func NewApp(c Config, db *sql.DB, l *log.Logger) *App {
	a := &App{cfg: c, db: db, logger: l, mux: http.NewServeMux(), rates: map[string]rateWindow{}}
	RegisterRoutes(a)
	return a
}
func (a *App) Handler() http.Handler { return a.securityHeaders(a.cors(a.mux)) }
func (a *App) health(w http.ResponseWriter, r *http.Request) {
	ctx, c := context.WithTimeout(r.Context(), 2*time.Second)
	defer c()
	if e := a.db.PingContext(ctx); e != nil {
		writeError(w, 503, "database_unavailable", "Database unavailable")
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]string{"status": "ok"}})
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
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

type loginRequest struct {
	Email      string `json:"email"`
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
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
	v.Role = roleFromDB(v.Role)
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
	updated.Role = roleFromDB(updated.Role)
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
		u.Role = roleFromDB(u.Role)
		users = append(users, u)
	}
	if e = rows.Err(); e != nil {
		a.serverError(w, r, e)
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": users})
}
func (a *App) forgotPassword(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 5, time.Minute) {
		return
	}
	started := time.Now()
	defer func() {
		if wait := 100*time.Millisecond - time.Since(started); wait > 0 {
			time.Sleep(wait)
		}
	}()
	var q struct {
		Email      string `json:"email"`
		Identifier string `json:"identifier"`
	}
	if !decode(w, r, &q) {
		return
	}
	identifier := strings.TrimSpace(q.Identifier)
	if identifier == "" {
		identifier = strings.TrimSpace(q.Email)
	}
	identifier = strings.ToLower(identifier)
	generic := map[string]any{"success": true, "message": "If the account exists, a verification code has been sent"}
	lookup := `SELECT COALESCE(email,'') FROM users WHERE phone=? AND status='ACTIVE'`
	if strings.Contains(identifier, "@") {
		lookup = `SELECT COALESCE(email,'') FROM users WHERE email=? AND status='ACTIVE'`
	}
	var email string
	if e := a.db.QueryRowContext(r.Context(), lookup, identifier).Scan(&email); errors.Is(e, sql.ErrNoRows) || e == nil && email == "" {
		writeJSON(w, 200, generic)
		return
	} else if e != nil {
		a.serverError(w, r, e)
		return
	}
	var recent int
	e := a.db.QueryRowContext(r.Context(), `SELECT 1 FROM password_reset_otps WHERE email=? AND created_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL 60 SECOND)`, email).Scan(&recent)
	if e == nil {
		writeJSON(w, 200, generic)
		return
	}
	if !errors.Is(e, sql.ErrNoRows) {
		a.serverError(w, r, e)
		return
	}
	n, e := rand.Int(rand.Reader, big.NewInt(1000000))
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	otp := fmt.Sprintf("%06d", n.Int64())
	_, e = a.db.ExecContext(r.Context(), `INSERT INTO password_reset_otps(email,otp_hash,expires_at,attempts) VALUES(?,?,?,0) ON DUPLICATE KEY UPDATE otp_hash=VALUES(otp_hash),expires_at=VALUES(expires_at),attempts=0,created_at=UTC_TIMESTAMP()`, email, hmacDigest(a.cfg.JWTSecret, otp), time.Now().UTC().Add(a.cfg.OTPTTL))
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	if a.cfg.AppEnv == "development" {
		a.logger.Printf("DEV password reset code for %s: %s", email, otp)
	} else {
		go func() {
			if e := a.sendOTP(email, otp); e != nil {
				a.logger.Printf("password reset email delivery failed: %v", e)
			}
		}()
	}
	writeJSON(w, 200, generic)
}
func (a *App) resetPassword(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 8, time.Minute) {
		return
	}
	var q struct {
		Identifier string `json:"identifier"`
		Email      string `json:"email"` // Backward compatible with older clients.
		OTP        string `json:"otp"`
		Password   string `json:"new_password"`
	}
	if !decode(w, r, &q) {
		return
	}
	identifier := (resetOTPRequest{Identifier: q.Identifier, Email: q.Email}).normalizedIdentifier()
	if identifier == "" || !validOTP(q.OTP) || !validPassword(q.Password) {
		writeError(w, 400, "invalid_reset_request", "A six digit OTP and a strong new password are required")
		return
	}
	email, err := a.resetEmailForIdentifier(r, identifier)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, 400, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	tx, e := a.db.BeginTx(r.Context(), nil)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	defer tx.Rollback()
	var hash string
	var expires time.Time
	var attempts int
	e = tx.QueryRowContext(r.Context(), `SELECT otp_hash,expires_at,attempts FROM password_reset_otps WHERE email=? FOR UPDATE`, email).Scan(&hash, &expires, &attempts)
	if e != nil && !errors.Is(e, sql.ErrNoRows) {
		a.serverError(w, r, e)
		return
	}
	valid := e == nil && attempts < 5 && time.Now().Before(expires) && hmac.Equal([]byte(hash), []byte(hmacDigest(a.cfg.JWTSecret, q.OTP)))
	if !valid {
		if e == nil && attempts < 5 {
			if _, updateErr := tx.ExecContext(r.Context(), `UPDATE password_reset_otps SET attempts=attempts+1 WHERE email=?`, email); updateErr != nil {
				a.serverError(w, r, updateErr)
				return
			}
			if commitErr := tx.Commit(); commitErr != nil {
				a.serverError(w, r, commitErr)
				return
			}
		}
		writeError(w, 400, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	pw, e := bcrypt.GenerateFromPassword([]byte(q.Password), passwordHashCost)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	if _, e = tx.ExecContext(r.Context(), `UPDATE users SET password_hash=? WHERE email=?`, string(pw), email); e != nil {
		a.serverError(w, r, e)
		return
	}
	if _, e = tx.ExecContext(r.Context(), `UPDATE refresh_tokens SET revoked=1 WHERE user_id=(SELECT id FROM users WHERE email=?) AND revoked=0`, email); e != nil {
		a.serverError(w, r, e)
		return
	}
	if _, e = tx.ExecContext(r.Context(), `DELETE FROM password_reset_otps WHERE email=?`, email); e != nil {
		a.serverError(w, r, e)
		return
	}
	if e = tx.Commit(); e != nil {
		a.serverError(w, r, e)
		return
	}
	a.clearRefreshCookie(w)
	writeJSON(w, 200, map[string]any{"success": true, "message": "Password updated. Please sign in again"})
}

func (a *App) issue(u User, typ string, ttl time.Duration, sid string) (string, error) {
	if sid == "" {
		var err error
		sid, err = newID()
		if err != nil {
			return "", err
		}
	}
	jti, err := newID()
	if err != nil {
		return "", err
	}
	uid := strconv.FormatInt(u.ID, 10)
	claims := struct {
		tokenClaims
		jwt.RegisteredClaims
	}{tokenClaims{UserID: uid, Role: u.Role, SessionID: sid, Type: typ}, jwt.RegisteredClaims{ID: jti, Subject: uid, IssuedAt: jwt.NewNumericDate(time.Now()), ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)), Issuer: "rikkei-ecommerce", Audience: []string{"rikkei-ecommerce-api"}}}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(a.cfg.JWTSecret))
}
func (a *App) parse(raw, typ string) (tokenClaims, error) {
	c := struct {
		tokenClaims
		jwt.RegisteredClaims
	}{}
	t, e := jwt.ParseWithClaims(raw, &c, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, fmt.Errorf("invalid signing method")
		}
		return []byte(a.cfg.JWTSecret), nil
	}, jwt.WithValidMethods([]string{"HS256"}), jwt.WithIssuer("rikkei-ecommerce"), jwt.WithAudience("rikkei-ecommerce-api"))
	if e != nil || !t.Valid || c.Type != typ || c.UserID == "" || c.SessionID == "" || c.Subject != c.UserID {
		return tokenClaims{}, fmt.Errorf("invalid token")
	}
	return c.tokenClaims, nil
}
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
		var role, status string
		e = a.db.QueryRowContext(r.Context(), `SELECT role,status FROM users WHERE id=?`, c.UserID).Scan(&role, &status)
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
		next(w, r.WithContext(context.WithValue(r.Context(), ctxKey{}, contextUser{ID: c.UserID, Role: roleFromDB(role), SessionID: c.SessionID})))
	}
}
func (a *App) requireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return a.requireAuth(func(w http.ResponseWriter, r *http.Request) {
		if current(r).Role != role {
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
func (a *App) setRefreshCookie(w http.ResponseWriter, v string, ttl time.Duration) {
	http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: v, Path: "/api/v1/auth/refresh", HttpOnly: true, Secure: a.cfg.CookieSecure, SameSite: http.SameSiteStrictMode, MaxAge: max(1, int(ttl.Seconds()))})
}
func (a *App) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: "", Path: "/api/v1/auth/refresh", HttpOnly: true, Secure: a.cfg.CookieSecure, SameSite: http.SameSiteStrictMode, MaxAge: -1})
}
func (a *App) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowed := false
		for _, v := range a.cfg.Origins {
			if v == origin {
				allowed = true
				break
			}
		}
		if origin != "" && allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		if r.Method == http.MethodOptions {
			if !allowed && origin != "" {
				writeError(w, 403, "origin_denied", "Origin is not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.WriteHeader(204)
			return
		}
		if origin != "" && !allowed {
			writeError(w, 403, "origin_denied", "Origin is not allowed")
			return
		}
		next.ServeHTTP(w, r)
	})
}
func (a *App) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cache-Control", "no-store")
		if a.cfg.CookieSecure {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		next.ServeHTTP(w, r)
	})
}
func (a *App) serverError(w http.ResponseWriter, r *http.Request, e error) {
	a.logger.Printf("internal request error: %v", e)
	writeError(w, 500, "internal_error", "Internal server error")
}
func (a *App) allow(w http.ResponseWriter, r *http.Request, limit int, window time.Duration) bool {
	ip, _, e := net.SplitHostPort(r.RemoteAddr)
	if e != nil {
		ip = r.RemoteAddr
	}
	key := r.URL.Path + ":" + ip
	now := time.Now()
	a.rateMu.Lock()
	defer a.rateMu.Unlock()
	if len(a.rates) > 5000 {
		for k, v := range a.rates {
			if now.Sub(v.started) > 5*time.Minute {
				delete(a.rates, k)
			}
		}
	}
	v := a.rates[key]
	if now.Sub(v.started) >= window {
		v = rateWindow{started: now}
	}
	v.count++
	a.rates[key] = v
	if v.count > limit {
		w.Header().Set("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
		writeError(w, 429, "rate_limited", "Too many requests")
		return false
	}
	return true
}
func (a *App) sendOTP(to, otp string) error {
	addr := net.JoinHostPort(a.cfg.SMTPHost, strconv.Itoa(a.cfg.SMTPPort))
	conn, e := net.DialTimeout("tcp", addr, 8*time.Second)
	if e != nil {
		return e
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(12 * time.Second))
	c, e := smtp.NewClient(conn, a.cfg.SMTPHost)
	if e != nil {
		return e
	}
	defer c.Close()
	ok, _ := c.Extension("STARTTLS")
	if !ok {
		return fmt.Errorf("SMTP server does not offer STARTTLS")
	}
	if e = c.StartTLS(&tls.Config{ServerName: a.cfg.SMTPHost, MinVersion: tls.VersionTLS12}); e != nil {
		return e
	}
	if a.cfg.SMTPUser != "" {
		if e = c.Auth(smtp.PlainAuth("", a.cfg.SMTPUser, a.cfg.SMTPPassword, a.cfg.SMTPHost)); e != nil {
			return e
		}
	}
	from := a.cfg.SMTPFrom
	if e = c.Mail(from); e != nil {
		return e
	}
	if e = c.Rcpt(to); e != nil {
		return e
	}
	w, e := c.Data()
	if e != nil {
		return e
	}
	_, e = fmt.Fprintf(w, "From: %s\r\nTo: %s\r\nSubject: Rikkei E-Commerce password reset code\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nYour verification code is %s. It expires in %d minutes.\r\n", from, to, otp, int(a.cfg.OTPTTL.Minutes()))
	if e != nil {
		_ = w.Close()
		return e
	}
	if e = w.Close(); e != nil {
		return e
	}
	return c.Quit()
}
func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	mediaType, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if e != nil || mediaType != "application/json" {
		writeError(w, 415, "unsupported_media_type", "Content-Type must be application/json")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if e := d.Decode(v); e != nil {
		writeError(w, 400, "invalid_request", "Request body is invalid")
		return false
	}
	var extra any
	if e := d.Decode(&extra); e != io.EOF {
		writeError(w, 400, "invalid_request", "Request body must contain one JSON value")
		return false
	}
	return true
}
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func writeError(w http.ResponseWriter, status int, code, msg string) {
	writeJSON(w, status, map[string]any{"success": false, "message": msg, "errors": []map[string]string{{"code": code, "message": msg}}})
}
func validPassword(v string) bool {
	if len(v) < 10 || len(v) > 72 {
		return false
	}
	letter, digit := false, false
	for _, r := range v {
		if unicode.IsDigit(r) {
			digit = true
		}
		if unicode.IsLetter(r) {
			letter = true
		}
	}
	return digit && letter
}
func validPhone(v string) bool {
	if strings.HasPrefix(v, "+") {
		v = v[1:]
	}
	if len(v) < 9 || len(v) > 15 {
		return false
	}
	for _, r := range v {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}
func roleFromDB(v string) string {
	switch strings.ToLower(v) {
	case "", "client":
		return "CLIENT"
	case "seller":
		return "SELLER"
	case "admin":
		return "ADMIN"
	default:
		return ""
	}
}
func digest(s string) string { h := sha256.Sum256([]byte(s)); return hex.EncodeToString(h[:]) }
func hmacDigest(key, value string) string {
	h := hmac.New(sha256.New, []byte(key))
	_, _ = h.Write([]byte(value))
	return hex.EncodeToString(h.Sum(nil))
}
func newID() (string, error) {
	b := make([]byte, 16)
	if _, e := rand.Read(b); e != nil {
		return "", e
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[:4], b[4:6], b[6:8], b[8:10], b[10:]), nil
}
