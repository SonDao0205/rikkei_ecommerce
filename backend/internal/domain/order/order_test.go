package order

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"rikkei-ecommerce/internal/domain/auth"
)

func TestDeriveParentStatus(t *testing.T) {
	tests := []struct {
		name         string
		shopStatuses []string
		wantStatus   string
		wantLabel    string
	}{
		{
			name:         "empty list defaults to PENDING",
			shopStatuses: []string{},
			wantStatus:   "PENDING",
			wantLabel:    "Chờ xác nhận",
		},
		{
			name:         "all cancelled yields CANCELLED",
			shopStatuses: []string{"CANCELLED", "CANCELLED"},
			wantStatus:   "CANCELLED",
			wantLabel:    "Đã hủy",
		},
		{
			name:         "all returned yields RETURNED",
			shopStatuses: []string{"RETURNED", "RETURNED"},
			wantStatus:   "RETURNED",
			wantLabel:    "Đổi / Trả hàng",
		},
		{
			name:         "all completed yields COMPLETED",
			shopStatuses: []string{"COMPLETED", "COMPLETED"},
			wantStatus:   "COMPLETED",
			wantLabel:    "Hoàn thành",
		},
		{
			name:         "one cancelled and one completed yields COMPLETED",
			shopStatuses: []string{"CANCELLED", "COMPLETED"},
			wantStatus:   "COMPLETED",
			wantLabel:    "Hoàn thành",
		},
		{
			name:         "one shipping takes precedence over packing or confirmed",
			shopStatuses: []string{"PACKING", "SHIPPING", "CONFIRMED"},
			wantStatus:   "SHIPPING",
			wantLabel:    "Đang vận chuyển",
		},
		{
			name:         "one packing takes precedence over confirmed or pending",
			shopStatuses: []string{"PENDING", "PACKING", "CONFIRMED"},
			wantStatus:   "PACKING",
			wantLabel:    "Đang chuẩn bị hàng",
		},
		{
			name:         "one confirmed takes precedence over pending",
			shopStatuses: []string{"PENDING", "CONFIRMED"},
			wantStatus:   "CONFIRMED",
			wantLabel:    "Đã xác nhận",
		},
		{
			name:         "all pending yields PENDING",
			shopStatuses: []string{"PENDING", "PENDING"},
			wantStatus:   "PENDING",
			wantLabel:    "Chờ xác nhận",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotStatus, gotLabel := deriveParentStatus(tt.shopStatuses)
			if gotStatus != tt.wantStatus {
				t.Errorf("deriveParentStatus() status = %v, want %v", gotStatus, tt.wantStatus)
			}
			if gotLabel != tt.wantLabel {
				t.Errorf("deriveParentStatus() label = %v, want %v", gotLabel, tt.wantLabel)
			}
		})
	}
}

func TestStatusLabel(t *testing.T) {
	cases := map[string]string{
		"PENDING":   "Chờ xác nhận",
		"CONFIRMED": "Đã xác nhận",
		"PACKING":   "Đang chuẩn bị hàng",
		"SHIPPING":  "Đang vận chuyển",
		"COMPLETED": "Hoàn thành",
		"CANCELLED": "Đã hủy",
		"RETURNED":  "Đổi / Trả hàng",
		"UNKNOWN":   "UNKNOWN",
	}

	for status, expected := range cases {
		if got := statusLabel(status); got != expected {
			t.Errorf("statusLabel(%q) = %q, want %q", status, got, expected)
		}
	}
}

func TestCustomerCancelOrderValidation(t *testing.T) {
	h := &CustomerHandler{}

	t.Run("unauthenticated user rejected with 401", func(t *testing.T) {
		body := `{"reason":"Đổi ý"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/orders/1/cancel", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		rec := httptest.NewRecorder()

		h.cancelCustomerOrder(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("reason exceeding 500 characters rejected with 400", func(t *testing.T) {
		longReason := strings.Repeat("R", 501)
		payload, _ := json.Marshal(map[string]any{"reason": longReason})

		req := httptest.NewRequest(http.MethodPost, "/api/v1/orders/1/cancel", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

		rec := httptest.NewRecorder()
		h.cancelCustomerOrder(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for long reason, got %d", rec.Code)
		}
	})
}

func TestCustomerReturnRequestValidation(t *testing.T) {
	h := &CustomerHandler{}

	t.Run("unauthenticated user rejected with 401", func(t *testing.T) {
		body := `{"shop_order_id":1,"reason":"Hàng lỗi"}`
		req := httptest.NewRequest(http.MethodPost, "/api/v1/orders/1/returns", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		rec := httptest.NewRecorder()

		h.createCustomerReturnRequest(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("short reason rejected with 400", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]any{
			"shop_order_id": 1,
			"type":          "RETURN",
			"reason":        "lỗi",
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/orders/1/returns", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

		rec := httptest.NewRecorder()
		h.createCustomerReturnRequest(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for short reason, got %d", rec.Code)
		}
	})

	t.Run("invalid return type rejected with 400", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]any{
			"shop_order_id": 1,
			"type":          "INVALID_TYPE",
			"reason":        "Hàng giao bị sai mẫu",
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/orders/1/returns", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

		rec := httptest.NewRecorder()
		h.createCustomerReturnRequest(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for invalid type, got %d", rec.Code)
		}
	})

	t.Run("missing shop_order_id rejected with 400", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]any{
			"type":   "RETURN",
			"reason": "Hàng giao bị sai mẫu hoàn toàn",
		})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/orders/1/returns", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900001", "CLIENT"))

		rec := httptest.NewRecorder()
		h.createCustomerReturnRequest(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for missing shop_order_id, got %d", rec.Code)
		}
	})
}

func TestSellerShipOrderValidation(t *testing.T) {
	h := &SellerHandler{}

	t.Run("unauthenticated seller rejected with 401", func(t *testing.T) {
		body := `{"carrier":"GHN","tracking_code":"GHN123"}`
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/orders/1/ship", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		rec := httptest.NewRecorder()

		h.shipSellerOrder(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("empty carrier rejected with 400", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]any{
			"carrier":       "",
			"tracking_code": "GHN123",
		})
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/orders/1/ship", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900002", "SELLER"))

		rec := httptest.NewRecorder()
		h.shipSellerOrder(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for empty carrier, got %d", rec.Code)
		}
	})

	t.Run("empty tracking_code rejected with 400", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]any{
			"carrier":       "GHN",
			"tracking_code": "",
		})
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/orders/1/ship", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900002", "SELLER"))

		rec := httptest.NewRecorder()
		h.shipSellerOrder(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for empty tracking_code, got %d", rec.Code)
		}
	})
}

func TestSellerCancelOrderValidation(t *testing.T) {
	h := &SellerHandler{}

	t.Run("unauthenticated seller rejected with 401", func(t *testing.T) {
		body := `{"reason":"Hết hàng"}`
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/orders/1/cancel", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		rec := httptest.NewRecorder()

		h.cancelSellerOrder(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("reason exceeding 500 characters rejected with 400", func(t *testing.T) {
		longReason := strings.Repeat("A", 501)
		payload, _ := json.Marshal(map[string]any{
			"reason": longReason,
		})
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/orders/1/cancel", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900002", "SELLER"))

		rec := httptest.NewRecorder()
		h.cancelSellerOrder(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for long reason, got %d", rec.Code)
		}
	})
}

func TestSellerReturnHandlingValidation(t *testing.T) {
	h := &SellerHandler{}

	t.Run("unauthenticated reject return rejected with 401", func(t *testing.T) {
		body := `{"note":"Sản phẩm đã qua sử dụng"}`
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/returns/1/reject", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		rec := httptest.NewRecorder()

		h.rejectSellerReturn(rec, req)
		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", rec.Code)
		}
	})

	t.Run("reject return note under 5 characters rejected with 400", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]any{
			"note": "ngắn", // 4 runes
		})
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/returns/1/reject", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900002", "SELLER"))

		rec := httptest.NewRecorder()
		h.rejectSellerReturn(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for short note, got %d", rec.Code)
		}
	})

	t.Run("approve return note exceeding 500 characters rejected with 400", func(t *testing.T) {
		longNote := strings.Repeat("B", 501)
		payload, _ := json.Marshal(map[string]any{
			"note": longNote,
		})
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/seller/returns/1/approve", bytes.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.SetPathValue("id", "1")
		req = req.WithContext(auth.WithUser(req.Context(), "900002", "SELLER"))

		rec := httptest.NewRecorder()
		h.approveSellerReturn(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for long note, got %d", rec.Code)
		}
	})
}
