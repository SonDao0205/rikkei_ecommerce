package auth

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type App struct {
	cfg    Config
	db     *sql.DB
	logger *log.Logger
	mux    *http.ServeMux
	rateMu sync.Mutex
	rates  map[string]rateWindow
}
type rateWindow struct {
	started time.Time
	count   int
}

const passwordHashCost = 12

var dummyPasswordHash, _ = bcrypt.GenerateFromPassword([]byte("unmatched-login-dummy-secret"), passwordHashCost)

func NewApp(c Config, db *sql.DB, l *log.Logger) *App {
	a := &App{cfg: c, db: db, logger: l, mux: http.NewServeMux(), rates: map[string]rateWindow{}}
	RegisterRoutes(a)
	return a
}

func (a *App) Handler() http.Handler { return a.securityHeaders(a.cors(a.mux)) }

func (a *App) Mux() *http.ServeMux { return a.mux }

func (a *App) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return a.requireAuth(next)
}

func (a *App) RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return a.requireRole(role, next)
}

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	ctx, c := context.WithTimeout(r.Context(), 2*time.Second)
	defer c()
	if e := a.db.PingContext(ctx); e != nil {
		writeError(w, 503, "database_unavailable", "Database unavailable")
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]string{"status": "ok"}})
}

func (a *App) serverError(w http.ResponseWriter, r *http.Request, e error) {
	a.logger.Printf("internal request error: %v", e)
	writeError(w, 500, "internal_error", "Internal server error")
}
