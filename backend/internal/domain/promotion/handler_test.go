package promotion

import "testing"

func TestCodeAllowed(t *testing.T) {
	for _, tc := range []struct {
		code string
		want bool
	}{
		{"SAVE-10", true}, {"SHOP_2026", true}, {"", true}, {"bad code", false}, {"<script>", false}, {"Mã10", false},
	} {
		if got := codeAllowed(tc.code); got != tc.want {
			t.Errorf("codeAllowed(%q)=%v want %v", tc.code, got, tc.want)
		}
	}
}

func TestSafeURLRequiresHTTPSAndHost(t *testing.T) {
	for _, tc := range []struct {
		url  string
		want bool
	}{{"https://cdn.example.com/banner.jpg", true}, {"http://example.com/x", false}, {"//example.com/x", false}, {"javascript:alert(1)", false}, {"https:///x", false}} {
		if got := safeURL(tc.url); got != tc.want {
			t.Errorf("safeURL(%q)=%v want %v", tc.url, got, tc.want)
		}
	}
}
