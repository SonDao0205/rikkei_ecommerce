package payment

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"rikkei-ecommerce/internal/domain/auth"
)

type payOSRoundTripper func(*http.Request) (*http.Response, error)

func (f payOSRoundTripper) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestCreatePayOSLinkRequestUsesSupportedPayloadAndPaymentLinkID(t *testing.T) {
	h := &Handler{
		cfg: auth.Config{
			PayOSClientID: "test-client", PayOSAPIKey: "test-api-key", PayOSChecksumKey: "test-checksum",
			PayOSReturnURL: "https://shop.example/payment/result", PayOSCancelURL: "https://shop.example/payment/result",
			PublicAPIURL: "https://shop.example",
		},
		client: &http.Client{Transport: payOSRoundTripper(func(r *http.Request) (*http.Response, error) {
			if r.Method != http.MethodPost || r.URL.Path != "/v2/payment-requests" {
				t.Fatalf("unexpected PayOS request: %s %s", r.Method, r.URL)
			}
			var payload map[string]any
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatalf("decode request body: %v", err)
			}
			if _, exists := payload["webhookUrl"]; exists {
				t.Fatal("webhookUrl must not be sent when creating a payment request")
			}
			if payload["orderCode"] != float64(995005) || payload["amount"] != float64(40000) {
				t.Fatalf("unexpected payment fields: %#v", payload)
			}
			if payload["description"] != "PAY995005" {
				t.Fatalf("unexpected short payment description: %#v", payload["description"])
			}
			if payload["returnUrl"] != "https://shop.example/payment/result?orderId=990005" || payload["cancelUrl"] != "https://shop.example/payment/result?orderId=990005" {
				t.Fatalf("order result URLs missing: %#v", payload)
			}
			body := `{"code":"00","desc":"success","data":{"paymentLinkId":"provider-link-123","checkoutUrl":"https://pay.payos.vn/web/provider-link-123","qrCode":"qr-payload","orderCode":995005}}`
			return &http.Response{StatusCode: http.StatusOK, Header: make(http.Header), Body: io.NopCloser(strings.NewReader(body))}, nil
		})},
	}
	got, err := h.createPayOSLinkRequest(context.Background(), 995005, 990005, 40000)
	if err != nil {
		t.Fatalf("createPayOSLinkRequest() error = %v", err)
	}
	if got.Data.ID != "provider-link-123" || got.Data.CheckoutURL == "" || got.Data.QRCode != "qr-payload" {
		t.Fatalf("PayOS response fields not normalized: %#v", got.Data)
	}
}

func TestPayOSDescriptionStaysWithinBankTransferLimit(t *testing.T) {
	for _, paymentID := range []int64{1, 995005, 1234567, 999999999} {
		if got := payOSDescription(paymentID); len(got) > 9 {
			t.Fatalf("payOSDescription(%d) = %q (%d chars)", paymentID, got, len(got))
		}
	}
}

func TestRefreshPayOSPaymentRequiresMatchingProviderOrderAndAmount(t *testing.T) {
	h := &Handler{
		cfg: auth.Config{PayOSClientID: "client", PayOSAPIKey: "api-key"},
		client: &http.Client{Transport: payOSRoundTripper(func(r *http.Request) (*http.Response, error) {
			if r.Method != http.MethodGet || r.URL.Path != "/v2/payment-requests/123" {
				t.Fatalf("unexpected PayOS lookup: %s %s", r.Method, r.URL)
			}
			body := `{"code":"00","data":{"orderCode":123,"amount":40000,"status":"PAID"}}`
			return &http.Response{StatusCode: http.StatusOK, Header: make(http.Header), Body: io.NopCloser(strings.NewReader(body))}, nil
		})},
	}

	if _, err := h.refreshPayOSPayment(context.Background(), 123, 40001); err == nil {
		t.Fatal("mismatched provider amount was accepted")
	}
}

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
