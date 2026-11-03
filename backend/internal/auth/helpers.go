package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
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
