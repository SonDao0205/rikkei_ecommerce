package cart

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"rikkei-ecommerce/internal/domain/auth"
)

func TestEmptyCartResponseIsInitialized(t *testing.T) {
	got := emptyCart()
	if got.Items == nil || len(got.Items) != 0 || got.LineCount != 0 || got.ItemCount != 0 || got.Subtotal != 0 {
		t.Fatalf("unexpected empty cart response: %+v", got)
	}
}

func TestAddItemRequiresIdempotencyKey(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/api/v1/cart/items", strings.NewReader(`{"variant_id":1,"quantity":1}`))
	request.Header.Set("Content-Type", "application/json")
	request = request.WithContext(auth.WithUser(request.Context(), "900001", "CLIENT"))
	recorder := httptest.NewRecorder()

	(&Handler{}).addItem(recorder, request)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("missing Idempotency-Key status=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	if !strings.Contains(recorder.Body.String(), "idempotency_key_required") {
		t.Fatalf("expected idempotency key validation error, got %s", recorder.Body.String())
	}
}

func TestParseCartItemID(t *testing.T) {
	for _, testCase := range []struct {
		value string
		valid bool
	}{{"1", true}, {"0", false}, {"-1", false}, {"abc", false}, {"9223372036854775808", false}} {
		request := httptest.NewRequest(http.MethodDelete, "/api/v1/cart/items/"+testCase.value, nil)
		request.SetPathValue("id", testCase.value)
		recorder := httptest.NewRecorder()
		_, valid := parseItemID(recorder, request)
		if valid != testCase.valid {
			t.Errorf("parseItemID(%q) valid=%v want=%v", testCase.value, valid, testCase.valid)
		}
		if !testCase.valid && recorder.Code != http.StatusBadRequest {
			t.Errorf("parseItemID(%q) status=%d want=%d", testCase.value, recorder.Code, http.StatusBadRequest)
		}
	}
}

func TestAddItemRejectsInvalidQuantityBeforeDatabaseAccess(t *testing.T) {
	for _, body := range []string{
		`{"variant_id":1}`,
		`{"variant_id":1,"quantity":0}`,
		`{"variant_id":1,"quantity":-1}`,
	} {
		request := httptest.NewRequest(http.MethodPost, "/api/v1/cart/items", strings.NewReader(body))
		request.Header.Set("Content-Type", "application/json")
		recorder := httptest.NewRecorder()

		(&Handler{}).addItem(recorder, request)

		if recorder.Code != http.StatusBadRequest {
			t.Errorf("body %s status=%d want=%d", body, recorder.Code, http.StatusBadRequest)
		}
	}
}
