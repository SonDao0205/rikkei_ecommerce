package auth

import (
	"net/http"

	"rikkei-ecommerce/internal/catalog"
)

// RegisterRoutes keeps the HTTP surface in one place. Each handler owns only
// request/response concerns; authentication and role checks are composed here.
func RegisterRoutes(a *App) {
	a.mux.HandleFunc("GET /healthz", a.health)
	a.mux.HandleFunc("POST /api/v1/auth/register", a.register)
	a.mux.HandleFunc("POST /api/v1/auth/login", a.login)
	a.mux.HandleFunc("POST /api/v1/auth/refresh", a.refresh)
	a.mux.Handle("POST /api/v1/auth/logout", a.requireAuth(a.logout))
	a.mux.Handle("GET /api/v1/auth/me", a.requireAuth(a.me))
	a.mux.Handle("PUT /api/v1/auth/profile", a.requireAuth(a.updateProfile))
	a.mux.Handle("PUT /api/v1/auth/password", a.requireAuth(a.changePassword))
	a.mux.HandleFunc("POST /api/v1/auth/forgot-password", a.forgotPassword)
	a.mux.HandleFunc("POST /api/v1/auth/verify-reset-otp", a.verifyResetOTP)
	a.mux.HandleFunc("POST /api/v1/auth/reset-password", a.resetPassword)
	a.mux.Handle("GET /api/v1/admin/users", a.requireRole("ADMIN", a.listUsers))
	catalog.RegisterRoutes(a.mux, a.db, func(next http.HandlerFunc) http.HandlerFunc {
		return a.requireRole("ADMIN", next)
	})
}
