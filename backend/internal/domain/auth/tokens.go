package auth

import (
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

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
