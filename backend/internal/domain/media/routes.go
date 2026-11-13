package media

import (
	"database/sql"
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, config auth.Config) {
	handler := NewHandler(db, config)
	mux.Handle("POST /api/v1/media", security.RequireAuth(handler.upload))
}
