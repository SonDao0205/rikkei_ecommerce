package observability

import (
	"bytes"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

var testRequestIDPattern = regexp.MustCompile(`^[a-f0-9]{32}$`)

func TestWrapAddsRequestIDAndLogsAuthenticatedStatusWithoutSecrets(t *testing.T) {
	var output bytes.Buffer
	logger := slog.New(slog.NewJSONHandler(&output, nil))
	handler := Wrap(logger, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if RequestID(r.Context()) == "" {
			t.Error("request ID missing from request context")
		}
		WithUserID(r.Context(), "user-42")
		w.WriteHeader(http.StatusForbidden)
		_, _ = w.Write([]byte("denied"))
	}))
	request := httptest.NewRequest(http.MethodGet, "/api/private?token=query-secret", nil)
	request.Header.Set("Authorization", "Bearer header-secret")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	id := response.Header().Get(requestIDHeader)
	if !testRequestIDPattern.MatchString(id) {
		t.Fatalf("response request ID %q is not valid", id)
	}
	line := output.String()
	for _, expected := range []string{`"request_id":"` + id + `"`, `"user_id":"user-42"`, `"status":403`, `"path":"/api/private"`} {
		if !strings.Contains(line, expected) {
			t.Errorf("access log missing %s: %s", expected, line)
		}
	}
	for _, secret := range []string{"query-secret", "header-secret", "denied"} {
		if strings.Contains(line, secret) {
			t.Errorf("access log leaked %q: %s", secret, line)
		}
	}
}

func TestWrapRejectsUntrustedRequestIDAndRecoversPanic(t *testing.T) {
	var output bytes.Buffer
	logger := slog.New(slog.NewJSONHandler(&output, nil))
	handler := Wrap(logger, http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("controlled panic")
	}))
	request := httptest.NewRequest(http.MethodPost, "/api/test", nil)
	request.Header.Set(requestIDHeader, "bad id\r\nforged=true")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusInternalServerError {
		t.Fatalf("panic response status=%d, want 500", response.Code)
	}
	if response.Header().Get(requestIDHeader) == request.Header.Get(requestIDHeader) {
		t.Fatal("unsafe caller-provided request ID was trusted")
	}
	if !strings.Contains(response.Body.String(), `"code":"internal_error"`) {
		t.Fatalf("unexpected panic response: %s", response.Body.String())
	}
	if !strings.Contains(output.String(), `"msg":"http handler panic"`) || !strings.Contains(output.String(), `"status":500`) {
		t.Fatalf("panic and access log records missing: %s", output.String())
	}
}

func TestRequestIDIsStablePerRequestAndUniqueAcrossRequests(t *testing.T) {
	ids := make(map[string]bool)
	for range 32 {
		id := newRequestID()
		if !testRequestIDPattern.MatchString(id) {
			t.Fatalf("generated invalid request ID %q", id)
		}
		if ids[id] {
			t.Fatalf("duplicate request ID %q", id)
		}
		ids[id] = true
	}
	if got := fmt.Sprint(len(ids)); got != "32" {
		t.Fatalf("generated %s IDs, want 32", got)
	}
}
