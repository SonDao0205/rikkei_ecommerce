package payment

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"testing"
)

func TestVerifyPayOSSignature(t *testing.T) {
	data := map[string]any{"orderCode": float64(123), "amount": float64(250000), "reference": "bank-ref", "code": "00", "description": "PAY123", "counterAccountName": ""}
	keys := []string{"amount", "code", "counterAccountName", "description", "orderCode", "reference"}
	canonical := "amount=250000&code=00&counterAccountName=&description=PAY123&orderCode=123&reference=bank-ref"
	_ = keys // documents that the signature input is alphabetically ordered.
	mac := hmac.New(sha256.New, []byte("test-checksum"))
	_, _ = mac.Write([]byte(canonical))
	signature := hex.EncodeToString(mac.Sum(nil))
	if !verifyPayOSSignature(data, signature, "test-checksum") {
		t.Fatal("valid provider signature rejected")
	}
	data["amount"] = float64(250001)
	if verifyPayOSSignature(data, signature, "test-checksum") {
		t.Fatal("tampered webhook accepted")
	}
	if verifyPayOSSignature(data, "not-hex", "test-checksum") {
		t.Fatal("malformed signature accepted")
	}
}

func TestNumberFromJSON(t *testing.T) {
	for _, raw := range []string{`123`, `"123"`} {
		var value any
		if err := json.Unmarshal([]byte(raw), &value); err != nil {
			t.Fatal(err)
		}
		got, err := numberFromJSON(value)
		if err != nil || got != 123 {
			t.Fatalf("numberFromJSON(%s) = %d, %v", raw, got, err)
		}
	}
	for _, raw := range []string{`1.2`, `-1`, `"bad"`} {
		var value any
		if err := json.Unmarshal([]byte(raw), &value); err != nil {
			t.Fatal(err)
		}
		if _, err := numberFromJSON(value); err == nil {
			t.Fatalf("numberFromJSON(%s) unexpectedly succeeded", raw)
		}
	}
}
