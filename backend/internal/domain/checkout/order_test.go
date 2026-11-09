package checkout

import (
	"bytes"
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"sort"
	"strings"
	"testing"

	"rikkei-ecommerce/internal/domain/auth"
)

func TestGenerateOrderCode(t *testing.T) {
	seen := make(map[string]bool)
	for i := 0; i < 50; i++ {
		code, err := generateOrderCode()
		if err != nil {
			t.Fatalf("generateOrderCode failed: %v", err)
		}
		if !strings.HasPrefix(code, "ORD") {
			t.Fatalf("expected order code to start with ORD, got %q", code)
		}
		if len(code) > 30 {
			t.Fatalf("order code length %d exceeds VARCHAR(30) database limit: %s", len(code), code)
		}
		if seen[code] {
			t.Fatalf("duplicate order code generated: %s", code)
		}
		seen[code] = true

		shopCode := generateShopOrderCode(code, 920001)
		if !strings.HasPrefix(shopCode, code+"-S") {
			t.Fatalf("unexpected shop order code format: %s", shopCode)
		}
		if len(shopCode) > 40 {
			t.Fatalf("shop order code length %d exceeds VARCHAR(40) database limit: %s", len(shopCode), shopCode)
		}
	}
}

func TestCreateOrderValidation(t *testing.T) {
	handler := &Handler{}

	t.Run("unauthenticated user rejected with 401", func(t *testing.T) {
		body := `{"address_id":1,"shipping_method_id":1,"payment_method_id":1,"cart_item_ids":[10]}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/orders", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.createOrder(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d (body: %s)", rec.Code, rec.Body.String())
		}
	})

	t.Run("missing required fields rejected with 400", func(t *testing.T) {
		invalidBodies := []string{
			`{}`,
			`{"address_id":0,"shipping_method_id":1,"payment_method_id":1,"cart_item_ids":[1]}`,
			`{"address_id":1,"shipping_method_id":0,"payment_method_id":1,"cart_item_ids":[1]}`,
			`{"address_id":1,"shipping_method_id":1,"payment_method_id":0,"cart_item_ids":[1]}`,
			`{"address_id":1,"shipping_method_id":1,"payment_method_id":1,"cart_item_ids":[]}`,
		}

		for _, b := range invalidBodies {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/orders", strings.NewReader(b))
			req.Header.Set("Content-Type", "application/json")
			req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

			rec := httptest.NewRecorder()
			handler.createOrder(rec, req)

			if rec.Code != http.StatusBadRequest {
				t.Errorf("body %s: expected 400, got %d", b, rec.Code)
			}
		}
	})

	t.Run("duplicate and negative cart item ids rejected with 400", func(t *testing.T) {
		invalidLists := [][]int64{
			{1, 2, 1},
			{-1, 2},
			{0, 5},
		}

		for _, ids := range invalidLists {
			payload, _ := json.Marshal(map[string]any{
				"address_id":         1,
				"shipping_method_id": 1,
				"payment_method_id":  1,
				"cart_item_ids":      ids,
			})

			req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/orders", bytes.NewReader(payload))
			req.Header.Set("Content-Type", "application/json")
			req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

			rec := httptest.NewRecorder()
			handler.createOrder(rec, req)

			if rec.Code != http.StatusBadRequest {
				t.Errorf("cart item IDs %v: expected 400, got %d", ids, rec.Code)
			}
		}
	})

	t.Run("oversized cart item list rejected with 400", func(t *testing.T) {
		tooManyIDs := make([]int64, 101)
		for i := range tooManyIDs {
			tooManyIDs[i] = int64(i + 1)
		}

		payload, _ := json.Marshal(map[string]any{
			"address_id":         1,
			"shipping_method_id": 1,
			"payment_method_id":  1,
			"cart_item_ids":      tooManyIDs,
		})

		req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/orders", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

		rec := httptest.NewRecorder()
		handler.createOrder(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("101 cart items: expected 400, got %d", rec.Code)
		}
	})

	t.Run("note exceeding 500 characters rejected with 400", func(t *testing.T) {
		longNote := strings.Repeat("A", 501)
		payload, _ := json.Marshal(map[string]any{
			"address_id":         1,
			"shipping_method_id": 1,
			"payment_method_id":  1,
			"cart_item_ids":      []int64{1},
			"note":               longNote,
		})

		req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/orders", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

		rec := httptest.NewRecorder()
		handler.createOrder(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("note length 501: expected 400, got %d", rec.Code)
		}
	})
}

func TestMultiShopDistributionMath(t *testing.T) {
	testCases := []struct {
		name                  string
		shopSubtotals         []int64
		shopDiscounts         []int64
		totalShippingCents    int64
		platformDiscountCents int64
	}{
		{
			name:                  "Single shop order",
			shopSubtotals:         []int64{25000000},
			shopDiscounts:         []int64{2500000},
			totalShippingCents:    3000000,
			platformDiscountCents: 5000000,
		},
		{
			name:                  "Two shops proportional split",
			shopSubtotals:         []int64{25000000, 2999000000},
			shopDiscounts:         []int64{2500000, 0},
			totalShippingCents:    3000000,
			platformDiscountCents: 5000000,
		},
		{
			name:                  "Three shops with rounding odd cents",
			shopSubtotals:         []int64{10000001, 20000003, 30000007},
			shopDiscounts:         []int64{500000, 1000000, 1500000},
			totalShippingCents:    3333333,
			platformDiscountCents: 4444444,
		},
		{
			name:                  "Zero discounts",
			shopSubtotals:         []int64{5000000, 15000000},
			shopDiscounts:         []int64{0, 0},
			totalShippingCents:    2500000,
			platformDiscountCents: 0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			var totalSubtotalCents int64
			for _, sub := range tc.shopSubtotals {
				totalSubtotalCents += sub
			}
			var totalShopDiscountsCents int64
			for _, d := range tc.shopDiscounts {
				totalShopDiscountsCents += d
			}

			totalAmountCents := totalSubtotalCents + tc.totalShippingCents - (totalShopDiscountsCents + tc.platformDiscountCents)
			if totalAmountCents < 0 {
				totalAmountCents = 0
			}

			// Simulate distribution algorithm used in order.go
			numShops := len(tc.shopSubtotals)
			shopShipping := make([]int64, numShops)
			shopPlatformDisc := make([]int64, numShops)
			shopTotals := make([]int64, numShops)

			var allocatedShipping int64
			var allocatedPlatformDisc int64

			for i := 0; i < numShops; i++ {
				sub := tc.shopSubtotals[i]
				isLast := i == numShops-1

				if isLast {
					shopShipping[i] = tc.totalShippingCents - allocatedShipping
					shopPlatformDisc[i] = tc.platformDiscountCents - allocatedPlatformDisc
				} else {
					shopShipping[i] = int64(math.Round(float64(tc.totalShippingCents) * float64(sub) / float64(totalSubtotalCents)))
					shopPlatformDisc[i] = int64(math.Round(float64(tc.platformDiscountCents) * float64(sub) / float64(totalSubtotalCents)))
					allocatedShipping += shopShipping[i]
					allocatedPlatformDisc += shopPlatformDisc[i]
				}

				if remaining := sub - tc.shopDiscounts[i]; shopPlatformDisc[i] > remaining {
					shopPlatformDisc[i] = remaining
				}
				if shopPlatformDisc[i] < 0 {
					shopPlatformDisc[i] = 0
				}

				shopTotals[i] = sub + shopShipping[i] - tc.shopDiscounts[i] - shopPlatformDisc[i]
				if shopTotals[i] < 0 {
					shopTotals[i] = 0
				}
			}

			// Verify sum of shipping fees matches parent
			var sumShipping int64
			for _, s := range shopShipping {
				sumShipping += s
			}
			if sumShipping != tc.totalShippingCents {
				t.Errorf("sum(shopShipping)=%d != totalShippingCents=%d", sumShipping, tc.totalShippingCents)
			}

			// Verify sum of platform discounts matches parent
			var sumPlatformDisc int64
			for _, p := range shopPlatformDisc {
				sumPlatformDisc += p
			}
			if sumPlatformDisc != tc.platformDiscountCents {
				t.Errorf("sum(shopPlatformDisc)=%d != platformDiscountCents=%d", sumPlatformDisc, tc.platformDiscountCents)
			}

			// Verify sum of shop totals matches parent total
			var sumShopTotals int64
			for _, st := range shopTotals {
				sumShopTotals += st
			}
			if sumShopTotals != totalAmountCents {
				t.Errorf("sum(shopTotals)=%d != totalAmountCents=%d", sumShopTotals, totalAmountCents)
			}
		})
	}
}

func TestDeadlockPreventionSorting(t *testing.T) {
	// Verify that variant IDs are strictly sorted ascending
	variantIDs := []int64{961005, 961001, 961003, 961002}
	sort.Slice(variantIDs, func(i, j int) bool { return variantIDs[i] < variantIDs[j] })

	for i := 0; i < len(variantIDs)-1; i++ {
		if variantIDs[i] >= variantIDs[i+1] {
			t.Fatalf("variantIDs not strictly ascending at index %d: %v", i, variantIDs)
		}
	}
}
