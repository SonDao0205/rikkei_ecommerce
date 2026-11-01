package httpx

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	mysql "github.com/go-sql-driver/mysql"
)

func Decode(w http.ResponseWriter, r *http.Request, target any) bool {
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		WriteError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err = decoder.Decode(target); err != nil {
		WriteError(w, http.StatusBadRequest, "invalid_request", "Request body is invalid")
		return false
	}
	var extra any
	if err = decoder.Decode(&extra); err != io.EOF {
		WriteError(w, http.StatusBadRequest, "invalid_request", "Request body must contain one JSON value")
		return false
	}
	return true
}

func WriteJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func WriteError(w http.ResponseWriter, status int, code, message string) {
	WriteJSON(w, status, map[string]any{
		"success": false,
		"message": message,
		"errors":  []map[string]string{{"code": code, "message": message}},
	})
}

func ServerError(w http.ResponseWriter, logger *log.Logger, err error) {
	logger.Printf("internal request error: %v", err)
	WriteError(w, http.StatusInternalServerError, "internal_error", "Internal server error")
}

func ValidTextLength(value string, minimum, maximum int) bool {
	length := utf8.RuneCountInString(value)
	return length >= minimum && length <= maximum
}

func ValidPhone(value string) bool {
	if strings.HasPrefix(value, "+") {
		value = value[1:]
	}
	if len(value) < 9 || len(value) > 15 {
		return false
	}
	for _, character := range value {
		if character < '0' || character > '9' {
			return false
		}
	}
	return true
}

func NullableText(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func IsMySQLDuplicate(err error) bool {
	var mysqlErr *mysql.MySQLError
	return errors.As(err, &mysqlErr) && mysqlErr.Number == 1062
}

func ParseListPage(values map[string][]string) (int, int, error) {
	page, limit := 1, 20
	for key, target := range map[string]*int{"page": &page, "limit": &limit} {
		if entries := values[key]; len(entries) > 0 {
			raw := strings.TrimSpace(entries[0])
			if raw == "" {
				continue
			}

			value, err := strconv.Atoi(raw)
			if err != nil || value < 1 || value > 100000 {
				return 0, 0, fmt.Errorf("%s must be between 1 and 100000", key)
			}
			*target = value
		}
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit, nil
}
