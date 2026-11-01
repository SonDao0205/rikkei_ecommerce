package seller

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSellerProductInputValidation(t *testing.T) {
	validRequest := func() sellerProductRequest {
		return sellerProductRequest{
			Name:       "Phone Model",
			CategoryID: 1,
			Price:      19.99,
			Images:     []sellerProductImage{{URL: "https://cdn.example.test/image.png"}},
			Variants:   []sellerProductVariant{{SKU: "SKU-1", Price: 19.99, Stock: 4}},
		}
	}
	request := validRequest()
	recorder := httptest.NewRecorder()
	if !validateSellerProductRequest(recorder, &request) {
		t.Fatalf("valid product rejected: %s", recorder.Body.String())
	}
	if !request.Images[0].IsPrimary {
		t.Fatal("first image was not selected as primary")
	}

	request = validRequest()
	request.Price = 19.999
	recorder = httptest.NewRecorder()
	if validateSellerProductRequest(recorder, &request) || recorder.Code != http.StatusBadRequest {
		t.Fatalf("fractional cents were not rejected: status=%d", recorder.Code)
	}

	request = validRequest()
	request.Images[0].URL = "http://cdn.example.test/image.png"
	recorder = httptest.NewRecorder()
	if validateSellerProductRequest(recorder, &request) || recorder.Code != http.StatusBadRequest {
		t.Fatalf("non-HTTPS image URL was not rejected: status=%d", recorder.Code)
	}

	request = validRequest()
	request.Variants = append(request.Variants, request.Variants[0])
	recorder = httptest.NewRecorder()
	if validateSellerProductRequest(recorder, &request) || !strings.Contains(recorder.Body.String(), "duplicate_sku") {
		t.Fatalf("duplicate SKU was not rejected: status=%d body=%s", recorder.Code, recorder.Body.String())
	}
}
