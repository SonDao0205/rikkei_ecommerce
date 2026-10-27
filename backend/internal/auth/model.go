package auth

import "time"

type User struct {
	ID            int64     `json:"id"`
	Email         string    `json:"email"`
	FullName      string    `json:"full_name"`
	Phone         string    `json:"phone"`
	Role          string    `json:"role"`
	Status        string    `json:"status"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
}
type tokenClaims struct {
	UserID    string `json:"uid"`
	Role      string `json:"role"`
	SessionID string `json:"sid"`
	Type      string `json:"typ"`
}
type tokenPair struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
}
type contextUser struct{ ID, Role, SessionID string }
type ctxKey struct{}
