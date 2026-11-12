package auth

import "time"

type User struct {
	ID            int64      `json:"id"`
	Email         string     `json:"email"`
	FullName      string     `json:"full_name"`
	Phone         string     `json:"phone"`
	AvatarURL     *string    `json:"avatar_url"`
	Role          string     `json:"role"`
	Roles         []string   `json:"roles"`
	ShopStatus    string     `json:"shop_status,omitempty"`
	Status        string     `json:"status"`
	LockReason    *string    `json:"lock_reason,omitempty"`
	LockedAt      *time.Time `json:"locked_at,omitempty"`
	EmailVerified bool       `json:"email_verified"`
	CreatedAt     time.Time  `json:"created_at"`
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
type contextUser struct {
	ID, Role, SessionID string
	Roles               []string
}
type Identity struct {
	ID, Role, SessionID string
	Roles               []string
}
type ctxKey struct{}
