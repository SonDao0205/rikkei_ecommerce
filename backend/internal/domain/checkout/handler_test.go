package checkout

import "testing"

func TestCalculateDiscount(t *testing.T) {
	tests := []struct {
		name        string
		typ         string
		value, max  float64
		maxValid    bool
		basis, want int64
		valid       bool
	}{
		{"fixed discount", "FIXED", 50000, 0, false, 20000000, 5000000, true},
		{"fixed capped by subtotal", "FIXED", 50000, 0, false, 2000000, 2000000, true},
		{"percent discount", "PERCENT", 10, 0, false, 25000000, 2500000, true},
		{"percent maximum", "PERCENT", 10, 15000, true, 25000000, 1500000, true},
		{"round half cent", "PERCENT", 12.5, 0, false, 12345, 1543, true},
		{"unknown discount", "BOGO", 10, 0, false, 10000, 0, false},
		{"zero value", "FIXED", 0, 0, false, 10000, 0, false},
		{"negative subtotal", "FIXED", 100, 0, false, -1, 0, false},
		{"percentage above 100", "PERCENT", 120, 0, false, 10000, 0, false},
		{"percentage invalid maximum", "PERCENT", 10, 0, true, 10000, 0, false},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, valid := calculateDiscount(tc.typ, tc.value, tc.max, tc.maxValid, tc.basis)
			if got != tc.want || valid != tc.valid {
				t.Fatalf("calculateDiscount() = (%d,%v), want (%d,%v)", got, valid, tc.want, tc.valid)
			}
		})
	}
}

func TestLineAmountCentsBounds(t *testing.T) {
	if got, ok := lineAmountCents(19.99, 3); !ok || got != 5997 {
		t.Fatalf("lineAmountCents() = (%d,%v), want (5997,true)", got, ok)
	}
	for _, input := range [][2]float64{{0, 1}, {-1, 1}, {1, 0}, {float64(maxAmountCents), 2}} {
		if _, ok := lineAmountCents(input[0], int64(input[1])); ok {
			t.Errorf("lineAmountCents(%v,%v) unexpectedly accepted", input[0], input[1])
		}
	}
}

func TestRoundMoney(t *testing.T) {
	if got := roundMoney(19.999); got != 20 {
		t.Fatalf("roundMoney() = %v, want 20", got)
	}
	if got := roundMoney(19.994); got != 19.99 {
		t.Fatalf("roundMoney() = %v, want 19.99", got)
	}
}
