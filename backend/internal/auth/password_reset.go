package auth

import (
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

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
	valid, e := checkResetOTP(r.Context(), tx, a.cfg.JWTSecret, email, q.OTP)
	if e != nil {
		a.serverError(w, r, e)
		return
	}
	if !valid {
		if commitErr := tx.Commit(); commitErr != nil {
			a.serverError(w, r, commitErr)
			return
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
