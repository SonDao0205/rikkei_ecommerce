package cart

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestEmptyCartResponseIsInitialized(t *testing.T) {
	got := emptyCart()
	if got.Items == nil || len(got.Items) != 0 || got.LineCount != 0 || got.ItemCount != 0 || got.Subtotal != 0 {
		t.Fatalf("unexpected empty cart response: %+v", got)
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
