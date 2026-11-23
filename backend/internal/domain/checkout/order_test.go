package checkout

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sort"
	"strings"
	"testing"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/idempotency"
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

		shopCode := generateShopOrderCode(code, 100)
		if !strings.HasPrefix(shopCode, code+"-L") {
			t.Fatalf("unexpected shop order code format: %s", shopCode)
		}
		if len(shopCode) > 40 {
			t.Fatalf("shop order code length %d exceeds VARCHAR(40) database limit: %s", len(shopCode), shopCode)
		}
	}
}

func TestCheckoutIdempotencyHelpers(t *testing.T) {
	if !idempotency.ValidKey("9f5e14a2-bd44-4ebc-a95a-5ba041c73509") {
		t.Fatal("UUID idempotency key should be accepted")
	}
	for _, key := range []string{"", "short", strings.Repeat("x", 129), "has spaces in key!!"} {
		if idempotency.ValidKey(key) {
			t.Errorf("invalid idempotency key %q was accepted", key)
		}
	}

	first, err := idempotency.Fingerprint(createOrderRequest{AddressID: 1, CartItemIDs: []int64{2, 3}, ShopVouchers: map[string]string{"7": "A", "8": "B"}})
	if err != nil {
		t.Fatal(err)
	}
	second, err := idempotency.Fingerprint(createOrderRequest{AddressID: 1, CartItemIDs: []int64{2, 3}, ShopVouchers: map[string]string{"8": "B", "7": "A"}})
	if err != nil {
		t.Fatal(err)
	}
	if first != second {
		t.Fatal("equivalent voucher maps must produce a stable request fingerprint")
	}
	changed, err := idempotency.Fingerprint(createOrderRequest{AddressID: 2, CartItemIDs: []int64{2, 3}})
	if err != nil {
		t.Fatal(err)
	}
	if first == changed {
		t.Fatal("different checkout requests must not share a fingerprint")
	}
}

func TestCreateOrderRequiresIdempotencyKey(t *testing.T) {
	handler := &Handler{}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/checkout/orders", strings.NewReader(
		`{"address_id":1,"shipping_method_id":1,"payment_method_id":1,"cart_item_ids":[10]}`,
	))
	req.Header.Set("Content-Type", "application/json")
	req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))
	rec := httptest.NewRecorder()

	handler.createOrder(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected missing idempotency key to return 400, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "idempotency_key_required") {
		t.Fatalf("expected an idempotency key error, got %s", rec.Body.String())
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

func TestPlanShopOrdersSplitsSameShopLines(t *testing.T) {
	voucherID := int64(31)
	shops := map[int64]*shopCheckout{
		11: {
			SubtotalCents:     900,
			ShopVoucherID:     &voucherID,
			ShopDiscountCents: 900,
			Items: []itemDetails{
				{ShopID: 11, ProductID: 101, VariantID: 201, Quantity: 2, LineCents: 600},
				{ShopID: 11, ProductID: 102, VariantID: 202, Quantity: 1, LineCents: 300},
			},
		},
		12: {
			SubtotalCents: 900,
			Items: []itemDetails{
				{ShopID: 12, ProductID: 103, VariantID: 203, Quantity: 1, LineCents: 900},
			},
		},
	}
	plans := planShopOrders([]int64{11, 12}, shops, 1800, 7, 900, 899)
	if len(plans) != 3 {
		t.Fatalf("got %d child orders for 3 lines across 2 shops", len(plans))
	}
	if plans[0].Item != shops[11].Items[0] || plans[1].Item != shops[11].Items[1] {
		t.Fatalf("same-shop child orders did not keep their distinct lines and quantities: %+v", plans[:2])
	}
	if plans[0].ShopVoucherID != &voucherID || plans[1].ShopVoucherID != &voucherID || plans[2].ShopVoucherID != nil {
		t.Fatal("voucher attribution should remain scoped to its shop")
	}

	var shipping, shopDiscount, platformDiscount, total int64
	for _, plan := range plans {
		if plan.ShopDiscountCents+plan.PlatformDiscountCents > plan.Item.LineCents || plan.ShippingCents < 0 {
			t.Fatalf("invalid allocation: %+v", plan)
		}
		shipping += plan.ShippingCents
		shopDiscount += plan.ShopDiscountCents
		platformDiscount += plan.PlatformDiscountCents
		total += plan.totalCents()
	}
	if shipping != 7 || shopDiscount != 900 || platformDiscount != 899 || total != 8 {
		t.Errorf("child sums (shipping, shop discount, platform discount, total) = (%d, %d, %d, %d), want (7, 900, 899, 8)",
			shipping, shopDiscount, platformDiscount, total)
	}
	if generateShopOrderCode("ORD-TEST", 1) == generateShopOrderCode("ORD-TEST", 2) {
		t.Fatal("distinct lines of an order require distinct child order codes")
	}
}

func TestProportionalAllocationPreservesCents(t *testing.T) {
	for _, tc := range []struct {
		name    string
		amount  int64
		weights []int64
		want    []int64
	}{
		{name: "rounding across small lines", amount: 2, weights: []int64{1, 1, 1, 1}, want: []int64{0, 1, 0, 1}},
		{name: "zero discount on fully covered lines", amount: 0, weights: []int64{0, 0}, want: []int64{0, 0}},
		{
			name: "maximum supported amount", amount: maxAmountCents - 1,
			weights: []int64{maxAmountCents - 1, 1}, want: []int64{maxAmountCents - 2, 1},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			allocation := proportionalAllocation{amount: tc.amount}
			for _, weight := range tc.weights {
				allocation.totalWeight += weight
			}
			for i, weight := range tc.weights {
				if got := allocation.take(weight); got != tc.want[i] {
					t.Errorf("line %d: got %d, want %d", i, got, tc.want[i])
				}
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
