package observability

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"runtime/debug"
	"sync"
	"time"
)

const requestIDHeader = "X-Request-ID"

type requestMetaKey struct{}
type requestIDKey struct{}

type requestMeta struct {
	mu     sync.RWMutex
	userID string
}

// WithUserID adds the authenticated actor to the current request's access log.
func WithUserID(ctx context.Context, userID string) {
	meta, _ := ctx.Value(requestMetaKey{}).(*requestMeta)
	if meta == nil || userID == "" {
		return
	}
	meta.mu.Lock()
	meta.userID = userID
	meta.mu.Unlock()
}

func requestID(ctx context.Context) string {
	value, _ := ctx.Value(requestIDKey{}).(string)
	return value
}

// RequestID returns the correlation ID attached by Wrap, if this request passed
// through the HTTP observability middleware.
func RequestID(ctx context.Context) string { return requestID(ctx) }

// Wrap adds a server-generated request ID, access log, and panic recovery to an HTTP
// handler. It deliberately records URL.Path only, never query strings or body.
func Wrap(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Never trust a caller-supplied ID as our canonical trace key. A trusted
		// gateway can correlate its own ID separately in gateway logs.
		id := newRequestID()
		meta := &requestMeta{}
		ctx := context.WithValue(r.Context(), requestIDKey{}, id)
		ctx = context.WithValue(ctx, requestMetaKey{}, meta)
		r = r.WithContext(ctx)
		w.Header().Set(requestIDHeader, id)

		start := time.Now()
		tracked := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		defer func() {
			if recovered := recover(); recovered != nil {
				logger.ErrorContext(r.Context(), "http handler panic",
					slog.String("panic_type", fmt.Sprintf("%T", recovered)), slog.String("stack", string(debug.Stack())),
					slog.String("request_id", id), slog.String("method", r.Method), slog.String("path", r.URL.Path),
				)
				if !tracked.wroteHeader {
					tracked.Header().Set("Content-Type", "application/json; charset=utf-8")
					tracked.WriteHeader(http.StatusInternalServerError)
					_ = json.NewEncoder(tracked).Encode(map[string]any{
						"success": false,
						"errors":  []map[string]string{{"code": "internal_error", "message": "Internal server error"}},
					})
				}
			}
			attrs := []any{
				slog.String("request_id", id), slog.String("method", r.Method),
				slog.String("path", r.URL.Path), slog.Int("status", tracked.status),
				slog.Int64("duration_ms", time.Since(start).Milliseconds()),
			}
			meta.mu.RLock()
			if meta.userID != "" {
				attrs = append(attrs, slog.String("user_id", meta.userID))
			}
			meta.mu.RUnlock()
			message, level := "http request", slog.LevelInfo
			if tracked.status >= http.StatusInternalServerError {
				level = slog.LevelError
			} else if tracked.status >= http.StatusBadRequest {
				level = slog.LevelWarn
			}
			logger.Log(r.Context(), level, message, attrs...)
		}()
		next.ServeHTTP(tracked, r)
	})
}

type statusWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (w *statusWriter) WriteHeader(code int) {
	if w.wroteHeader {
		return
	}
	w.status = code
	w.wroteHeader = true
	w.ResponseWriter.WriteHeader(code)
}

func (w *statusWriter) Write(p []byte) (int, error) {
	if !w.wroteHeader {
		w.WriteHeader(http.StatusOK)
	}
	return w.ResponseWriter.Write(p)
}

func (w *statusWriter) Unwrap() http.ResponseWriter { return w.ResponseWriter }

func (w *statusWriter) Flush() {
	if !w.wroteHeader {
		w.WriteHeader(http.StatusOK)
	}
	if flusher, ok := w.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

func (w *statusWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	return http.NewResponseController(w.ResponseWriter).Hijack()
}

func (w *statusWriter) Push(target string, options *http.PushOptions) error {
	if pusher, ok := w.ResponseWriter.(http.Pusher); ok {
		return pusher.Push(target, options)
	}
	return http.ErrNotSupported
}

func newRequestID() string {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err == nil {
		return hex.EncodeToString(bytes[:])
	}
	return hex.EncodeToString([]byte(time.Now().UTC().Format("20060102150405.000000000")))
}
