package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"unicode"

	"rikkei-ecommerce/internal/httpx"
)

func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	return httpx.Decode(w, r, v)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	httpx.WriteJSON(w, status, v)
}

func writeError(w http.ResponseWriter, status int, code, msg string) {
	httpx.WriteError(w, status, code, msg)
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
	return httpx.ValidPhone(v)
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

type roleQueryer interface {
	QueryContext(context.Context, string, ...any) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...any) *sql.Row
}

func loadUserShopStatus(ctx context.Context, queryer roleQueryer, userID any) (string, error) {
	var status string
	err := queryer.QueryRowContext(ctx, `SELECT status FROM shops WHERE owner_id=?`, userID).Scan(&status)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	return status, err
}

func loadUserRoles(ctx context.Context, queryer roleQueryer, userID any) ([]string, error) {
	rows, err := queryer.QueryContext(ctx, `SELECT role_code FROM user_roles WHERE user_id=? ORDER BY role_code`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	roles := make([]string, 0, 2)
	seen := make(map[string]struct{}, 3)
	for rows.Next() {
		var role string
		if err = rows.Scan(&role); err != nil {
			return nil, err
		}
		role = roleFromDB(role)
		if role == "" {
			return nil, fmt.Errorf("unknown role assigned to user")
		}
		if _, exists := seen[role]; !exists {
			roles = append(roles, role)
			seen[role] = struct{}{}
		}
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	if len(roles) == 0 {
		return nil, fmt.Errorf("user has no assigned roles")
	}
	return roles, nil
}

func primaryRole(roles []string) string {
	for _, preferred := range []string{"ADMIN", "SELLER", "CLIENT"} {
		for _, role := range roles {
			if role == preferred {
				return preferred
			}
		}
	}
	return ""
}

func hasRole(roles []string, role string) bool {
	role = strings.ToUpper(strings.TrimSpace(role))
	for _, assigned := range roles {
		if assigned == role {
			return true
		}
	}
	return false
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
