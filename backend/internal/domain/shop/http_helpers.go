package shop

import (
	"net"
	"net/http"
	"net/url"
	"rikkei-ecommerce/internal/platform/httpx"
	"strings"
)

func requestClientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil {
		return truncate(host, 45)
	}
	return truncate(strings.TrimSpace(r.RemoteAddr), 45)
}

func truncate(value string, max int) string {
	runes := []rune(value)
	if len(runes) <= max {
		return value
	}
	return string(runes[:max])
}

func parseListPage(values url.Values) (int, int, error) { return httpx.ParseListPage(values) }

func isMySQLDuplicate(err error) bool { return httpx.IsMySQLDuplicate(err) }

func nullableText(value string) any { return httpx.NullableText(value) }

func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	return httpx.Decode(w, r, target)
}

func writeJSON(w http.ResponseWriter, status int, value any) { httpx.WriteJSON(w, status, value) }

func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}

func (a *Handler) serverError(w http.ResponseWriter, _ *http.Request, err error) {
	httpx.ServerError(w, a.logger, err)
}
