package idempotency

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"strings"
)

// ValidKey accepts opaque client-generated request identifiers, not user content.
func ValidKey(key string) bool {
	if len(key) < 16 || len(key) > 128 {
		return false
	}
	for _, r := range key {
		if !(r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || strings.ContainsRune("-_.:", r)) {
			return false
		}
	}
	return true
}

// Fingerprint returns a stable SHA-256 digest for JSON-compatible request values.
func Fingerprint(value any) (string, error) {
	body, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	digest := sha256.Sum256(body)
	return hex.EncodeToString(digest[:]), nil
}
