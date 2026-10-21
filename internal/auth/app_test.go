package auth

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func testApp() *App {
	c := Config{AppEnv: "test", JWTSecret: "01234567890123456789012345678901", AccessTTL: 15 * time.Minute, RefreshTTL: 24 * time.Hour, OTPTTL: 10 * time.Minute}
	return NewApp(c, nil, log.New(&bytes.Buffer{}, "", 0))
}

func TestPasswordPolicy(t *testing.T) {
	for _, tc := range []struct {
		value string
		want  bool
	}{{"short1", false}, {"onlyletters", false}, {"lettersand1", true}, {"0123456789", false}, {"ValidPassword123", true}, {"MậtKhẩuAnToàn123", true}} {
		if got := validPassword(tc.value); got != tc.want {
			t.Errorf("validPassword(%q)=%v want %v", tc.value, got, tc.want)
		}
	}
}

func TestPhoneAndRoleValidation(t *testing.T) {
	if !validPhone("+84901234567") || validPhone("12x") || validPhone("12345678") {
		t.Fatal("phone validation did not enforce the DB contract")
	}
	for in, want := range map[string]string{"": "CLIENT", "client": "CLIENT", "seller": "SELLER", "admin": "ADMIN", "unknown": ""} {
		if got := roleFromDB(in); got != want {
			t.Errorf("roleFromDB(%q)=%q want %q", in, got, want)
		}
	}
}

func TestJWTTypeAndSessionClaims(t *testing.T) {
	a := testApp()
	u := User{ID: 42, Role: "CLIENT"}
	raw := a.issue(u, "access", time.Minute, "session-id")
	c, err := a.parse(raw, "access")
	if err != nil {
		t.Fatal(err)
	}
	if c.UserID != "42" || c.SessionID != "session-id" || c.Type != "access" {
		t.Fatalf("unexpected claims: %+v", c)
	}
	if _, err = a.parse(raw, "refresh"); err == nil {
		t.Fatal("access token accepted as refresh token")
	}
	mutatedPrefix := "A"
	if raw[0] == 'A' {
		mutatedPrefix = "B"
	}
	mutated := mutatedPrefix + raw[1:]
	if _, err = a.parse(mutated, "access"); err == nil {
		t.Fatal("tampered token accepted")
	}
	expired := a.issue(u, "access", -time.Minute, "session-id")
	if _, err = a.parse(expired, "access"); err == nil {
		t.Fatal("expired token accepted")
	}
}

func TestIssuedTokensAreUniqueWithinSameSecond(t *testing.T) {
	a := testApp()
	u := User{ID: 42, Role: "CLIENT"}
	first := a.issue(u, "refresh", time.Hour, "session-id")
	second := a.issue(u, "refresh", time.Hour, "session-id")
	if first == "" || second == "" || first == second {
		t.Fatal("separate token issuance must produce distinct JWTs")
	}
}

func TestProtectedRouteRequiresAccessToken(t *testing.T) {
	a := testApp()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	rec := httptest.NewRecorder()
	a.Handler().ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
}

func TestCORSRejectsUnknownOrigin(t *testing.T) {
	a := testApp()
	a.cfg.Origins = []string{"https://shop.example"}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("Origin", "https://attacker.example")
	rec := httptest.NewRecorder()
	a.Handler().ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
}

func TestJSONRequestValidation(t *testing.T) {
	a := testApp()
	for _, tc := range []struct {
		name, contentType, body string
		want                    int
	}{{"content type", "text/plain", "{}", 415}, {"multiple values", "application/json", "{} {}", 400}, {"unknown field", "application/json", `{"unexpected":true}`, 400}} {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBufferString(tc.body))
			req.Header.Set("Content-Type", tc.contentType)
			rec := httptest.NewRecorder()
			a.Handler().ServeHTTP(rec, req)
			if rec.Code != tc.want {
				t.Fatalf("status=%d want=%d body=%s", rec.Code, tc.want, rec.Body.String())
			}
		})
	}
}

func TestRateLimitReturns429(t *testing.T) {
	a := testApp()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
	req.RemoteAddr = "192.0.2.1:1234"
	for i := 0; i < 2; i++ {
		rec := httptest.NewRecorder()
		if !a.allow(rec, req, 2, time.Minute) {
			t.Fatal("request was limited too early")
		}
	}
	rec := httptest.NewRecorder()
	if a.allow(rec, req, 2, time.Minute) || rec.Code != http.StatusTooManyRequests {
		t.Fatalf("request should be rate limited; status=%d", rec.Code)
	}
}
