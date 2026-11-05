package wishlist

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestParseProductID(t *testing.T) {
	for _, testCase := range []struct {
		value string
		valid bool
	}{{"1", true}, {"0", false}, {"-1", false}, {"abc", false}, {"9223372036854775808", false}} {
		request := httptest.NewRequest(http.MethodPost, "/api/v1/wishlist/products/"+testCase.value, nil)
		request.SetPathValue("id", testCase.value)
		recorder := httptest.NewRecorder()
		_, valid := parseProductID(recorder, request)
		if valid != testCase.valid {
			t.Errorf("parseProductID(%q) valid=%v want=%v", testCase.value, valid, testCase.valid)
		}
		if !testCase.valid && recorder.Code != http.StatusBadRequest {
			t.Errorf("parseProductID(%q) status=%d want=%d", testCase.value, recorder.Code, http.StatusBadRequest)
		}
	}
}
