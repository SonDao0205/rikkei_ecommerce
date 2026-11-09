package seller

import (
	"errors"
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

func TestValidateVariantAttributeSets(t *testing.T) {
	required := map[int64]struct{}{100: {}, 200: {}}
	allowed := map[int64]int64{
		11: 100, 12: 100,
		21: 200, 22: 200,
		31: 300,
	}
	tests := []struct {
		name        string
		variants    []sellerProductVariant
		noConfig    bool
		wantErrCode string
	}{
		{
			name: "valid required attributes and optional attribute",
			variants: []sellerProductVariant{
				{AttributeValueIDs: []int64{11, 21, 31}},
				{AttributeValueIDs: []int64{12, 22, 31}},
			},
		},
		{
			name:        "missing required attribute",
			variants:    []sellerProductVariant{{AttributeValueIDs: []int64{11}}},
			wantErrCode: "missing_required_variant_attribute",
		},
		{
			name:        "attribute value not configured for category",
			variants:    []sellerProductVariant{{AttributeValueIDs: []int64{11, 21, 99}}},
			wantErrCode: "invalid_category_variant_attribute",
		},
		{
			name:        "two values for one attribute",
			variants:    []sellerProductVariant{{AttributeValueIDs: []int64{11, 12, 21}}},
			wantErrCode: "duplicate_variant_attribute",
		},
		{
			name: "inconsistent attribute sets",
			variants: []sellerProductVariant{
				{AttributeValueIDs: []int64{11, 21, 31}},
				{AttributeValueIDs: []int64{12, 22}},
			},
			wantErrCode: "inconsistent_variant_attributes",
		},
		{
			name: "duplicate combinations independent of value order",
			variants: []sellerProductVariant{
				{AttributeValueIDs: []int64{11, 21}},
				{AttributeValueIDs: []int64{21, 11}},
			},
			wantErrCode: "duplicate_variant_combination",
		},
		{
			name:     "category without configured attributes",
			variants: []sellerProductVariant{{}},
			noConfig: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			requiredForTest, allowedForTest := required, allowed
			if test.noConfig {
				requiredForTest, allowedForTest = nil, nil
			}
			err := validateVariantAttributeSets(test.variants, requiredForTest, allowedForTest)
			if test.wantErrCode == "" {
				if err != nil {
					t.Fatalf("unexpected validation error: %v", err)
				}
				return
			}
			var validationErr *categoryVariantValidationError
			if !errors.As(err, &validationErr) || validationErr.code != test.wantErrCode {
				t.Fatalf("expected validation error %q, got %v", test.wantErrCode, err)
			}
		})
	}
}
