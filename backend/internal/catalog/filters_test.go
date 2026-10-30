package catalog

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
)

func TestParseProductFilters(t *testing.T) {
	tests := []struct {
		name    string
		query   string
		wantErr bool
	}{
		{name: "defaults", query: "", wantErr: false},
		{name: "supported filters", query: "q=shirt&category_id=12&brand_id=3&min_price=10.50&max_price=25&min_rating=4.5&sort=price_asc&page=2&limit=20", wantErr: false},
		{name: "legacy search alias", query: "search=shirt", wantErr: false},
		{name: "unknown parameter", query: "unexpected=value", wantErr: true},
		{name: "repeated parameter", query: "q=a&q=b", wantErr: true},
		{name: "conflicting search aliases", query: "q=a&search=b", wantErr: true},
		{name: "oversized search", query: "q=12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901", wantErr: true},
		{name: "invalid category", query: "category_id=-1", wantErr: true},
		{name: "invalid brand", query: "brand_id=0", wantErr: true},
		{name: "inverted price range", query: "min_price=20&max_price=10", wantErr: true},
		{name: "non-finite price", query: "min_price=NaN", wantErr: true},
		{name: "rating out of range", query: "min_rating=5.1", wantErr: true},
		{name: "invalid sort", query: "sort=price%3BDROP%20TABLE%20products", wantErr: true},
		{name: "invalid page", query: "page=0", wantErr: true},
		{name: "shop filter only when enabled", query: "shop_id=4", wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := parseProductFilters(mustQuery(t, test.query), false)
			if (err != nil) != test.wantErr {
				t.Fatalf("parseProductFilters() error=%v wantErr=%v", err, test.wantErr)
			}
		})
	}
}

func TestParseProductFiltersValues(t *testing.T) {
	filters, err := parseProductFilters(mustQuery(t, "q=shirt&category_id=12&brand_id=3&min_price=10.50&max_price=25&min_rating=4.5&sort=price_asc&page=2&limit=20"), false)
	if err != nil {
		t.Fatal(err)
	}
	if filters.search != "shirt" || filters.category != 12 || filters.brandID != 3 || filters.sort != "price_asc" || filters.page != 2 || filters.limit != 20 {
		t.Fatalf("unexpected parsed filters: %+v", filters)
	}
	if filters.minPrice == nil || *filters.minPrice != 10.5 || filters.maxPrice == nil || *filters.maxPrice != 25 || filters.minRating == nil || *filters.minRating != 4.5 {
		t.Fatalf("unexpected parsed numeric filters: %+v", filters)
	}
}

func TestParseProductFiltersShopPath(t *testing.T) {
	filters, err := parseProductFilters(mustQuery(t, "shop_id=4"), true)
	if err != nil || filters.shopID != 4 {
		t.Fatalf("filters=%+v err=%v", filters, err)
	}
}

func TestEscapeLikeTreatsWildcardsAsLiteral(t *testing.T) {
	if got, want := escapeLike(`100%_!`), `100!%!_!!`; got != want {
		t.Fatalf("escapeLike()=%q want %q", got, want)
	}
}

func TestValidateAdminProductQuery(t *testing.T) {
	for _, test := range []struct {
		name    string
		query   string
		wantErr bool
	}{
		{name: "valid", query: "search=shirt&stock_status=in_stock&sort_by=stock_desc"},
		{name: "unknown parameter", query: "debug=1", wantErr: true},
		{name: "repeated parameter", query: "search=a&search=b", wantErr: true},
		{name: "invalid sort", query: "sort_by=name", wantErr: true},
		{name: "invalid stock status", query: "stock_status=any", wantErr: true},
	} {
		t.Run(test.name, func(t *testing.T) {
			err := validateAdminProductQuery(mustQuery(t, test.query))
			if (err != nil) != test.wantErr {
				t.Fatalf("validateAdminProductQuery() error=%v wantErr=%v", err, test.wantErr)
			}
		})
	}
}

func TestProductOrderIsAllowlisted(t *testing.T) {
	for _, test := range []struct {
		value string
		want  string
	}{
		{value: "price_asc", want: "p.price ASC,p.id ASC"},
		{value: "latest", want: "p.created_at DESC,p.id DESC"},
		{value: "unknown DESC; DROP TABLE products", want: "p.created_at DESC,p.id DESC"},
	} {
		if got := productOrder(test.value); got != test.want {
			t.Errorf("productOrder(%q)=%q want %q", test.value, got, test.want)
		}
	}
}

func TestAllowShopIDQueryOnlyForShopListing(t *testing.T) {
	values := url.Values{"shop_id": []string{"4"}}
	_, err := parseProductFilters(values, false)
	if err == nil {
		t.Fatal("shop_id must not be accepted by the general product-list parser")
	}
}

func TestParseRequestQueryRejectsMalformedEscapesAndSemicolons(t *testing.T) {
	for _, target := range []string{"/api/v1/products?q=shirt%ZZ", "/api/v1/products?q=shirt;drop"} {
		request := httptest.NewRequest(http.MethodGet, target, nil)
		if _, err := parseRequestQuery(request); err == nil {
			t.Errorf("parseRequestQuery(%q) accepted malformed query", target)
		}
	}
}

func TestDecodeJSONRequiresBoundedStrictJSON(t *testing.T) {
	tests := []struct {
		name        string
		contentType string
		body        string
		maxBytes    int64
		want        bool
	}{
		{name: "valid", contentType: "application/json; charset=utf-8", body: `{"name":"item"}`, maxBytes: 32, want: true},
		{name: "wrong content type", contentType: "text/plain", body: `{"name":"item"}`, maxBytes: 32},
		{name: "unknown field", contentType: "application/json", body: `{"unknown":"value"}`, maxBytes: 32},
		{name: "multiple values", contentType: "application/json", body: `{"name":"one"}{"name":"two"}`, maxBytes: 32},
		{name: "body too large", contentType: "application/json", body: `{"name":"item"}`, maxBytes: 4},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(test.body))
			request.Header.Set("Content-Type", test.contentType)
			var destination struct {
				Name string `json:"name"`
			}
			if got := decodeJSON(httptest.NewRecorder(), request, &destination, test.maxBytes); got != test.want {
				t.Fatalf("decodeJSON()=%v want %v", got, test.want)
			}
		})
	}
}

func mustQuery(t *testing.T, raw string) url.Values {
	t.Helper()
	values, err := url.ParseQuery(raw)
	if err != nil {
		t.Fatal(err)
	}
	return values
}
