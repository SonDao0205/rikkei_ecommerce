package shop

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAllowedShopTransition(t *testing.T) {
	tests := []struct {
		name    string
		current string
		target  string
		allowed bool
	}{
		{"pending approval", "PENDING", "ACTIVE", true},
		{"pending request information", "PENDING", "NEEDS_INFO", true},
		{"pending rejection", "PENDING", "REJECTED", true},
		{"needs info rejection", "NEEDS_INFO", "REJECTED", true},
		{"active suspension", "ACTIVE", "SUSPENDED", true},
		{"suspended restoration", "SUSPENDED", "ACTIVE", true},
		{"pending idempotency", "PENDING", "PENDING", true},
		{"draft cannot be approved", "DRAFT", "ACTIVE", false},
		{"needs info must be resubmitted before approval", "NEEDS_INFO", "ACTIVE", false},
		{"rejected shop must be resubmitted", "REJECTED", "ACTIVE", false},
		{"active shop cannot be rejected", "ACTIVE", "REJECTED", false},
		{"suspended shop cannot be rejected", "SUSPENDED", "REJECTED", false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := allowedShopTransition(test.current, test.target); got != test.allowed {
				t.Errorf("allowedShopTransition(%q, %q)=%v; want %v", test.current, test.target, got, test.allowed)
			}
		})
	}
}

func TestValidateShopProfile(t *testing.T) {
	tests := []struct {
		name    string
		request shopProfileRequest
		valid   bool
	}{
		{
			name: "valid profile trims text",
			request: shopProfileRequest{
				Name: "  Tiệm Mây  ", Phone: "+84901234567", WarehouseAddress: "  Hanoi, Vietnam  ",
			},
			valid: true,
		},
		{name: "short name rejected", request: shopProfileRequest{Name: "A", WarehouseAddress: "Hanoi, Vietnam"}},
		{name: "missing warehouse address rejected", request: shopProfileRequest{Name: "Shop name"}},
		{name: "invalid phone rejected", request: shopProfileRequest{Name: "Shop name", Phone: "call-me", WarehouseAddress: "Hanoi, Vietnam"}},
		{name: "HTTP logo rejected", request: shopProfileRequest{Name: "Shop name", WarehouseAddress: "Hanoi, Vietnam", LogoURL: stringPointer("http://cdn.example.test/logo.png")}},
		{name: "URL credentials rejected", request: shopProfileRequest{Name: "Shop name", WarehouseAddress: "Hanoi, Vietnam", BannerURL: stringPointer("https://user:pass@cdn.example.test/banner.png")}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			request := test.request
			got := validateShopProfile(response, &request)
			if got != test.valid {
				t.Errorf("validateShopProfile()=%v; want %v; response=%s", got, test.valid, response.Body.String())
			}
			if test.valid && (request.Name != "Tiệm Mây" || request.WarehouseAddress != "Hanoi, Vietnam") {
				t.Errorf("profile values were not normalized: %#v", request)
			}
			if !test.valid && !strings.Contains(response.Body.String(), "success") {
				// Error responses use the project's JSON API envelope.
				t.Errorf("validation response was empty: %s", response.Body.String())
			}
		})
	}
}

func stringPointer(value string) *string { return &value }
