package auth

import (
	"crypto/hmac"
	"database/sql"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type passwordChangeRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
	ConfirmPassword string `json:"confirm_password"`
}

// changePassword requires a valid access token and the current password. All
// refresh sessions are revoked atomically with the password update.
func (a *App) changePassword(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 5, time.Minute) {
		return
	}
	var q passwordChangeRequest
	if !decode(w, r, &q) {
		return
	}
	user := current(r)
	if q.CurrentPassword == "" || !validPassword(q.NewPassword) ||
		(q.ConfirmPassword != "" && q.ConfirmPassword != q.NewPassword) {
		writeError(w, http.StatusBadRequest, "invalid_password_request", "Current password and a valid new password are required")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var existingHash string
	if err = tx.QueryRowContext(r.Context(), `SELECT password_hash FROM users WHERE id=? AND status='ACTIVE' FOR UPDATE`, user.ID).Scan(&existingHash); err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusUnauthorized, "invalid_session", "Session is invalid")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(existingHash), []byte(q.CurrentPassword)) != nil {
		writeError(w, http.StatusUnauthorized, "invalid_current_password", "Current password is incorrect")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(existingHash), []byte(q.NewPassword)) == nil {
		writeError(w, http.StatusBadRequest, "password_reused", "New password must differ from current password")
		return
	}
	newHash, err := bcrypt.GenerateFromPassword([]byte(q.NewPassword), passwordHashCost)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE users SET password_hash=? WHERE id=?`, string(newHash), user.ID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE refresh_tokens SET revoked=1 WHERE user_id=? AND revoked=0`, user.ID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	a.clearRefreshCookie(w)
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "message": "Password updated. Please sign in again"})
}

type resetOTPRequest struct {
	Identifier string `json:"identifier"`
	Email      string `json:"email"` // Backward compatible with older clients.
	OTP        string `json:"otp"`
}

func (q resetOTPRequest) normalizedIdentifier() string {
	value := strings.TrimSpace(q.Identifier)
	if value == "" {
		value = strings.TrimSpace(q.Email)
	}
	if strings.Contains(value, "@") {
		return strings.ToLower(value)
	}
	if strings.HasPrefix(value, "+") {
		value = "+" + strings.NewReplacer(" ", "", "-", "", "(", "", ")", "").Replace(value[1:])
	} else {
		value = strings.NewReplacer(" ", "", "-", "", "(", "", ")", "").Replace(value)
	}
	return value
}

// verifyResetOTP verifies the code at the server and records failed attempts.
// Reset still verifies it again, so this endpoint never creates a reusable
// password-reset credential on its own.
func (a *App) verifyResetOTP(w http.ResponseWriter, r *http.Request) {
	if !a.allow(w, r, 8, time.Minute) {
		return
	}
	var q resetOTPRequest
	if !decode(w, r, &q) {
		return
	}
	identifier := q.normalizedIdentifier()
	if identifier == "" || !validOTP(q.OTP) {
		writeError(w, http.StatusBadRequest, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	email, err := a.resetEmailForIdentifier(r, identifier)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return
	}
	if !a.checkResetOTP(w, r, email, q.OTP) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "message": "Verification code is valid"})
}

func validOTP(value string) bool {
	if len(value) != 6 {
		return false
	}
	for _, digit := range value {
		if digit < '0' || digit > '9' {
			return false
		}
	}
	return true
}

func (a *App) resetEmailForIdentifier(r *http.Request, identifier string) (string, error) {
	query := `SELECT COALESCE(email,'') FROM users WHERE phone=? AND status='ACTIVE'`
	if strings.Contains(identifier, "@") {
		query = `SELECT COALESCE(email,'') FROM users WHERE email=? AND status='ACTIVE'`
	}
	var email string
	err := a.db.QueryRowContext(r.Context(), query, identifier).Scan(&email)
	if err != nil || email == "" {
		return "", sql.ErrNoRows
	}
	return email, nil
}

func (a *App) checkResetOTP(w http.ResponseWriter, r *http.Request, email, otp string) bool {
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return false
	}
	defer tx.Rollback()
	var hash string
	var expires time.Time
	var attempts int
	err = tx.QueryRowContext(r.Context(), `SELECT otp_hash,expires_at,attempts FROM password_reset_otps WHERE email=? FOR UPDATE`, email).Scan(&hash, &expires, &attempts)
	valid := err == nil && attempts < 5 && time.Now().Before(expires) && hmac.Equal([]byte(hash), []byte(hmacDigest(a.cfg.JWTSecret, otp)))
	if !valid {
		if err == nil && attempts < 5 {
			if _, err = tx.ExecContext(r.Context(), `UPDATE password_reset_otps SET attempts=attempts+1 WHERE email=?`, email); err != nil {
				a.serverError(w, r, err)
				return false
			}
			if err = tx.Commit(); err != nil {
				a.serverError(w, r, err)
				return false
			}
		}
		writeError(w, http.StatusBadRequest, "invalid_or_expired_otp", "Verification code is invalid or expired")
		return false
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return false
	}
	return true
}
