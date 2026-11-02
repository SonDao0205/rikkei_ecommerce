package auth

import (
	"bufio"
	"fmt"
	"net/mail"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv, HTTPAddr, DatabaseDSN, JWTSecret   string
	SMTPHost, SMTPUser, SMTPPassword, SMTPFrom string
	SMTPPort                                   int
	AccessTTL, RefreshTTL, OTPTTL              time.Duration
	Origins                                    []string
	CookieSecure, AutoMigrate                  bool
}

func LoadConfig() (Config, error) {
	loadDotEnv(".env")
	appEnv := env("APP_ENV", "development")
	if appEnv != "development" && appEnv != "production" {
		return Config{}, fmt.Errorf("APP_ENV must be development or production")
	}
	autoDefault := "true"
	if appEnv == "production" {
		autoDefault = "false"
	}
	autoValue := strings.ToLower(env("AUTO_MIGRATE", autoDefault))
	if autoValue != "true" && autoValue != "false" {
		return Config{}, fmt.Errorf("AUTO_MIGRATE must be true or false")
	}
	c := Config{AppEnv: appEnv, HTTPAddr: env("HTTP_ADDR", ":8080"), DatabaseDSN: os.Getenv("DATABASE_DSN"), JWTSecret: os.Getenv("JWT_SECRET"), SMTPHost: os.Getenv("SMTP_HOST"), SMTPUser: os.Getenv("SMTP_USER"), SMTPPassword: os.Getenv("SMTP_PASSWORD"), SMTPFrom: os.Getenv("SMTP_FROM"), SMTPPort: port("SMTP_PORT", 587), AccessTTL: duration("ACCESS_TOKEN_TTL", 15*time.Minute), RefreshTTL: duration("REFRESH_TOKEN_TTL", 7*24*time.Hour), OTPTTL: duration("OTP_TTL", 10*time.Minute), Origins: split(os.Getenv("CORS_ALLOWED_ORIGINS")), CookieSecure: os.Getenv("COOKIE_SECURE") == "true", AutoMigrate: autoValue == "true"}
	if c.DatabaseDSN == "" {
		return c, fmt.Errorf("DATABASE_DSN is required")
	}
	if len(c.JWTSecret) < 32 {
		return c, fmt.Errorf("JWT_SECRET must contain at least 32 characters")
	}
	if c.AppEnv == "production" {
		if c.AutoMigrate {
			return c, fmt.Errorf("AUTO_MIGRATE must be false in production; run the migration command before deployment")
		}
		if !c.CookieSecure {
			return c, fmt.Errorf("COOKIE_SECURE=true is required in production")
		}
		if len(c.Origins) == 0 {
			return c, fmt.Errorf("CORS_ALLOWED_ORIGINS must be explicit in production")
		}
		for _, o := range c.Origins {
			if o == "*" {
				return c, fmt.Errorf("wildcard CORS is forbidden in production")
			}
		}
		if c.SMTPHost == "" || c.SMTPFrom == "" {
			return c, fmt.Errorf("SMTP_HOST and SMTP_FROM are required in production")
		}
		for _, origin := range c.Origins {
			parsed, err := url.Parse(origin)
			if err != nil || parsed.Scheme != "https" || parsed.Host == "" || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" || parsed.User != nil || parsed.String() != origin {
				return c, fmt.Errorf("production CORS origins must be exact HTTPS origins")
			}
		}
		from, err := mail.ParseAddress(c.SMTPFrom)
		if err != nil || from.Address != c.SMTPFrom {
			return c, fmt.Errorf("SMTP_FROM must be a valid email address")
		}
	}
	if c.SMTPPort == 0 {
		return c, fmt.Errorf("SMTP_PORT must be between 1 and 65535")
	}
	if c.AccessTTL < time.Minute || c.AccessTTL > time.Hour || c.RefreshTTL < time.Hour || c.OTPTTL < time.Minute || c.OTPTTL > 30*time.Minute {
		return c, fmt.Errorf("token/OTP TTL is outside allowed limits")
	}
	return c, nil
}
func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func duration(k string, d time.Duration) time.Duration {
	v := os.Getenv(k)
	if v == "" {
		return d
	}
	p, e := time.ParseDuration(v)
	if e != nil {
		return 0
	}
	return p
}
func split(s string) []string {
	var r []string
	for _, v := range strings.Split(s, ",") {
		if v = strings.TrimSpace(v); v != "" {
			r = append(r, v)
		}
	}
	return r
}
func port(k string, d int) int {
	value := os.Getenv(k)
	if value == "" {
		return d
	}
	n, e := strconv.Atoi(value)
	if e != nil || n < 1 || n > 65535 {
		return 0
	}
	return n
}
func loadDotEnv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()
	s := bufio.NewScanner(f)
	for s.Scan() {
		line := strings.TrimSpace(s.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key, value = strings.TrimSpace(key), strings.Trim(strings.TrimSpace(value), `"'`)
		if _, exists := os.LookupEnv(key); !exists {
			_ = os.Setenv(key, value)
		}
	}
}
