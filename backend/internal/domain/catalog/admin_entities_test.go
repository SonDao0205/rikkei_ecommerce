package catalog

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestValidateBrand(t *testing.T) {
	tests := []struct {
		name string
		in   brandRequest
		ok   bool
	}{
		{name: "valid", in: brandRequest{Name: "Brand A", Slug: "brand-a"}, ok: true},
		{name: "normalizes slug", in: brandRequest{Name: "Brand A", Slug: " BRAND-A "}, ok: true},
		{name: "invalid slug", in: brandRequest{Name: "Brand A", Slug: "bad slug"}},
		{name: "empty name", in: brandRequest{Name: " ", Slug: "brand-a"}},
		{name: "rejects credential URL", in: brandRequest{Name: "Brand A", Slug: "brand-a", LogoURL: stringPointer("https://user:pass@cdn.example.test/a.jpg")}},
		{name: "rejects insecure URL", in: brandRequest{Name: "Brand A", Slug: "brand-a", LogoURL: stringPointer("http://cdn.example.test/a.jpg")}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			got := validateBrand(recorder, &test.in)
			if got != test.ok {
				t.Fatalf("validateBrand()=%v want %v; response %s", got, test.ok, recorder.Body.String())
			}
		})
	}
}

func TestNormalizeAttributeValues(t *testing.T) {
	tests := []struct {
		name   string
		values []string
		want   bool
	}{
		{name: "trimmed distinct values", values: []string{" Small ", "Large"}, want: true},
		{name: "case-insensitive duplicates", values: []string{"Blue", " blue "}},
		{name: "empty", values: []string{}},
		{name: "blank value", values: []string{"  "}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			values, got := normalizeAttributeValues(recorder, test.values)
			if got != test.want {
				t.Fatalf("normalizeAttributeValues() ok=%v want %v; response %s", got, test.want, recorder.Body.String())
			}
			if got && (len(values) == 0 || strings.TrimSpace(values[0]) != values[0]) {
				t.Fatalf("values were not normalized: %#v", values)
			}
		})
	}
}

func TestAdminProductModerationTransitions(t *testing.T) {
	tests := []struct {
		name, current, target, shop, owner string
		categoryActive                     bool
		wantCode                           string
	}{
		{name: "approve pending product", current: "PENDING", target: "ACTIVE", shop: "ACTIVE", owner: "ACTIVE", categoryActive: true},
		{name: "reject pending product", current: "PENDING", target: "REJECTED", shop: "ACTIVE", owner: "ACTIVE", categoryActive: true},
		{name: "cannot approve while shop suspended", current: "PENDING", target: "ACTIVE", shop: "SUSPENDED", owner: "ACTIVE", categoryActive: true, wantCode: "active_shop_required"},
		{name: "cannot approve inactive owner", current: "PENDING", target: "ACTIVE", shop: "ACTIVE", owner: "LOCKED", categoryActive: true, wantCode: "active_shop_required"},
		{name: "cannot approve inactive category", current: "PENDING", target: "ACTIVE", shop: "ACTIVE", owner: "ACTIVE", wantCode: "inactive_product_category"},
		{name: "cannot reject active product", current: "ACTIVE", target: "REJECTED", shop: "ACTIVE", owner: "ACTIVE", categoryActive: true, wantCode: "product_not_pending"},
		{name: "seller must resubmit rejected product", current: "REJECTED", target: "ACTIVE", shop: "ACTIVE", owner: "ACTIVE", categoryActive: true, wantCode: "product_status_not_activatable"},
		{name: "hide approved product", current: "ACTIVE", target: "HIDDEN", shop: "ACTIVE", owner: "ACTIVE", categoryActive: true},
		{name: "cannot hide pending product", current: "PENDING", target: "HIDDEN", shop: "ACTIVE", owner: "ACTIVE", categoryActive: true, wantCode: "product_status_not_toggleable"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			code, _ := validateAdminProductTransition(test.current, test.target, test.shop, test.owner, test.categoryActive)
			if code != test.wantCode {
				t.Fatalf("code=%q want %q", code, test.wantCode)
			}
		})
	}
}
