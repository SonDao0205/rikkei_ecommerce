package media

import (
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, config auth.Config) {
	handler := NewHandler(config)
	mux.Handle("POST /api/v1/media", security.RequireAuth(handler.upload))
}
