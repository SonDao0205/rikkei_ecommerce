package server_test

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/server"
)

func TestBusinessRoutesRequireAuthentication(t *testing.T) {
	config := auth.Config{
		AppEnv:     "test",
		JWTSecret:  "01234567890123456789012345678901",
		AccessTTL:  15 * time.Minute,
		RefreshTTL: 24 * time.Hour,
		OTPTTL:     10 * time.Minute,
	}
	handler := server.NewHandler(config, nil, log.New(&bytes.Buffer{}, "", 0))
	for _, route := range []struct {
		method string
		path   string
	}{
		{http.MethodPost, "/api/v1/shops"},
		{http.MethodGet, "/api/v1/me/shop"},
		{http.MethodPut, "/api/v1/me/shop"},
		{http.MethodGet, "/api/v1/admin/shops"},
		{http.MethodPut, "/api/v1/admin/categories/1/attributes"},
		{http.MethodPatch, "/api/v1/admin/shops/1/status"},
		{http.MethodPatch, "/api/v1/admin/shops/1/approve"},
		{http.MethodPatch, "/api/v1/admin/shops/1/reject"},
		{http.MethodPatch, "/api/v1/admin/shops/1/lock"},
		{http.MethodGet, "/api/v1/seller/products"},
		{http.MethodPost, "/api/v1/seller/products"},
		{http.MethodGet, "/api/v1/seller/products/1"},
		{http.MethodPut, "/api/v1/seller/products/1"},
		{http.MethodDelete, "/api/v1/seller/products/1"},
		{http.MethodGet, "/api/v1/addresses"},
		{http.MethodPost, "/api/v1/addresses"},
		{http.MethodPut, "/api/v1/addresses/1"},
		{http.MethodDelete, "/api/v1/addresses/1"},
		{http.MethodPatch, "/api/v1/addresses/1/default"},
		{http.MethodGet, "/api/v1/cart"},
		{http.MethodPost, "/api/v1/cart/items"},
		{http.MethodPut, "/api/v1/cart/items/1"},
		{http.MethodDelete, "/api/v1/cart/items/1"},
		{http.MethodDelete, "/api/v1/cart/items"},
		{http.MethodGet, "/api/v1/wishlist"},
		{http.MethodPost, "/api/v1/wishlist/products/1"},
		{http.MethodDelete, "/api/v1/wishlist/products/1"},
		{http.MethodPost, "/api/v1/shops/44/follow"},
		{http.MethodGet, "/api/v1/shops/44/follow"},
		{http.MethodDelete, "/api/v1/shops/44/follow"},
		{http.MethodGet, "/api/v1/admin/inventory-stats"},
		{http.MethodGet, "/api/v1/admin/products"},
		{http.MethodPatch, "/api/v1/admin/products/1/status"},
		{http.MethodDelete, "/api/v1/admin/products/1"},
		{http.MethodPost, "/api/v1/admin/products/bulk"},
	} {
		request := httptest.NewRequest(route.method, route.path, nil)
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != http.StatusUnauthorized {
			t.Errorf("%s %s status=%d want 401", route.method, route.path, response.Code)
		}
	}
}
