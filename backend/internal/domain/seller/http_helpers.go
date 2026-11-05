package seller

import (
	"net/http"
	"net/url"
	"rikkei-ecommerce/internal/platform/httpx"
)

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
