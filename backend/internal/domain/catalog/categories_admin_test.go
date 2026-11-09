package catalog

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestValidateCategoryRequest(t *testing.T) {
	parentID := int64(930001)
	image := "https://cdn.example.test/category.png"
	active := true
	tests := []struct {
		name      string
		request   categoryRequest
		wantValid bool
		wantCode  string
	}{
		{name: "valid unicode name and parent", request: categoryRequest{ParentID: &parentID, Name: "Áo khoác", Slug: "ao-khoac", ImageURL: &image, SortOrder: 3, IsActive: &active}, wantValid: true},
		{name: "trims fields and normalizes slug case", request: categoryRequest{Name: "  Điện thoại  ", Slug: "DIEN-THOAI"}, wantValid: true},
		{name: "empty name", request: categoryRequest{Name: " ", Slug: "valid-slug"}, wantCode: "invalid_category_name"},
		{name: "slug with spaces", request: categoryRequest{Name: "Category", Slug: "bad slug"}, wantCode: "invalid_category_slug"},
		{name: "reserved all slug", request: categoryRequest{Name: "Category", Slug: "all"}, wantCode: "invalid_category_slug"},
		{name: "invalid image scheme", request: categoryRequest{Name: "Category", Slug: "category", ImageURL: stringPointer("http://cdn.example.test/a.png")}, wantCode: "invalid_category_image_url"},
		{name: "image with embedded credentials", request: categoryRequest{Name: "Category", Slug: "category", ImageURL: stringPointer("https://user:pass@cdn.example.test/a.png")}, wantCode: "invalid_category_image_url"},
		{name: "sort order out of range", request: categoryRequest{Name: "Category", Slug: "category", SortOrder: 100001}, wantCode: "invalid_category_sort_order"},
		{name: "non-positive parent", request: categoryRequest{Name: "Category", Slug: "category", ParentID: int64Pointer(0)}, wantCode: "invalid_category_parent"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			valid := validateCategoryRequest(recorder, &test.request)
			if valid != test.wantValid {
				t.Fatalf("valid=%v want=%v body=%s", valid, test.wantValid, recorder.Body.String())
			}
			if test.wantCode != "" && !strings.Contains(recorder.Body.String(), test.wantCode) {
				t.Fatalf("error code missing: want %q body=%s", test.wantCode, recorder.Body.String())
			}
			if test.name == "trims fields and normalizes slug case" && (test.request.Name != "Điện thoại" || test.request.Slug != "dien-thoai") {
				t.Fatalf("normalized fields name=%q slug=%q", test.request.Name, test.request.Slug)
			}
		})
	}
}

func stringPointer(value string) *string { return &value }
func int64Pointer(value int64) *int64    { return &value }
