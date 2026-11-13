package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"time"
)

var (
	errAccountExists = errors.New("account already exists")
	errEmailDelivery = errors.New("email delivery failed")
)

func newOTP() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func (a *App) deliverOTP(email, code, purpose string) error {
	if strings.TrimSpace(a.cfg.SMTPHost) != "" {
		return a.sendOTP(email, code, purpose)
	}
	if a.cfg.AppEnv == "development" {
		a.logger.Printf("DEV %s code for %s: %s", purpose, email, code)
		return nil
	}
	return errors.New("SMTP is not configured")
}

func (a *App) beginEmailVerification(r *http.Request, email, phone, passwordHash, fullName string) error {
	if _, err := a.db.ExecContext(r.Context(), `DELETE FROM email_verification_otps WHERE expires_at<=UTC_TIMESTAMP()`); err != nil {
		return err
	}
	var exists int
	err := a.db.QueryRowContext(r.Context(), `SELECT 1 FROM users WHERE email=? OR phone=? LIMIT 1`, email, phone).Scan(&exists)
	if err == nil {
		return errAccountExists
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return err
	}
	var recent int
	err = a.db.QueryRowContext(r.Context(), `SELECT 1 FROM email_verification_otps WHERE (email=? OR phone=?) AND created_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL 60 SECOND) LIMIT 1`, email, phone).Scan(&recent)
	if err == nil {
		return nil
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return err
	}
	code, err := newOTP()
	if err != nil {
		return err
	}
	digest := hmacDigest(a.cfg.JWTSecret, code)
	_, err = a.db.ExecContext(r.Context(), `INSERT INTO email_verification_otps(email,phone,password_hash,full_name,otp_hash,expires_at,attempts) VALUES(?,?,?,?,?,?,0)
		ON DUPLICATE KEY UPDATE phone=VALUES(phone),password_hash=VALUES(password_hash),full_name=VALUES(full_name),otp_hash=VALUES(otp_hash),expires_at=VALUES(expires_at),attempts=0,created_at=UTC_TIMESTAMP()`,
		email, phone, passwordHash, fullName, digest, time.Now().UTC().Add(a.cfg.OTPTTL))
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return errAccountExists
		}
		return err
	}
	if err = a.deliverOTP(email, code, "email verification"); err != nil {
		_, _ = a.db.ExecContext(r.Context(), `DELETE FROM email_verification_otps WHERE email=? AND otp_hash=?`, email, digest)
		return fmt.Errorf("%w: %v", errEmailDelivery, err)
	}
	return nil
}

func (a *App) resendEmailOTP(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 5, time.Minute) {
		return
	}
	var q struct {
		Email string `json:"email"`
	}
	if !decode(w, r, &q) {
		return
	}
	email := strings.ToLower(strings.TrimSpace(q.Email))
	generic := map[string]any{"success": true, "message": "If a pending registration exists, a verification code has been sent"}
	if email == "" {
		writeJSON(w, http.StatusOK, generic)
		return
	}
	var phone, passwordHash, fullName string
	err := a.db.QueryRowContext(r.Context(), `SELECT phone,password_hash,full_name FROM email_verification_otps WHERE email=?`, email).Scan(&phone, &passwordHash, &fullName)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusOK, generic)
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	var recent int
	err = a.db.QueryRowContext(r.Context(), `SELECT 1 FROM email_verification_otps WHERE email=? AND created_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL 60 SECOND)`, email).Scan(&recent)
	if err == nil {
		writeJSON(w, http.StatusOK, generic)
		return
	}
	if !errors.Is(err, sql.ErrNoRows) {
		a.serverError(w, r, err)
		return
	}
	if err = a.beginEmailVerification(r, email, phone, passwordHash, fullName); err != nil {
		if errors.Is(err, errEmailDelivery) {
			writeError(w, http.StatusServiceUnavailable, "email_delivery_unavailable", "We could not send the verification email. Please try again shortly")
			return
		}
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, generic)
}

func (a *App) verifyEmailOTP(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 8, time.Minute) {
		return
	}
	var q struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if !decode(w, r, &q) {
		return
	}
	q.Email = strings.ToLower(strings.TrimSpace(q.Email))
	if q.Email == "" || !validOTP(q.OTP) {
		writeError(w, http.StatusBadRequest, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var phone, passwordHash, fullName, otpHash string
	var expires time.Time
	var attempts int
	err = tx.QueryRowContext(r.Context(), `SELECT phone,password_hash,full_name,otp_hash,expires_at,attempts FROM email_verification_otps WHERE email=? FOR UPDATE`, q.Email).Scan(&phone, &passwordHash, &fullName, &otpHash, &expires, &attempts)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusBadRequest, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if attempts >= 5 || !time.Now().Before(expires) || !hmac.Equal([]byte(otpHash), []byte(hmacDigest(a.cfg.JWTSecret, q.OTP))) {
		if attempts < 5 {
			if _, err = tx.ExecContext(r.Context(), `UPDATE email_verification_otps SET attempts=attempts+1 WHERE email=?`, q.Email); err != nil {
				a.serverError(w, r, err)
				return
			}
		}
		if err = tx.Commit(); err != nil {
			a.serverError(w, r, err)
			return
		}
		writeError(w, http.StatusBadRequest, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	res, err := tx.ExecContext(r.Context(), `INSERT INTO users(email,phone,password_hash,full_name,email_verified,role) VALUES(?,?,?,?,1,'client')`, q.Email, phone, passwordHash, fullName)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			_, _ = tx.ExecContext(r.Context(), `DELETE FROM email_verification_otps WHERE email=?`, q.Email)
			_ = tx.Commit()
			writeError(w, http.StatusConflict, "account_exists", "An account with this email or phone already exists")
			return
		}
		a.serverError(w, r, err)
		return
	}
	userID, err := res.LastInsertId()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO user_roles(user_id,role_code) VALUES(?,'CLIENT')`, userID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `DELETE FROM email_verification_otps WHERE email=?`, q.Email); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "message": "Email verified. You can now sign in"})
}
