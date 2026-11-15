package auth

import (
	"fmt"
	"net"
	"net/mail"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv, HTTPAddr, DatabaseDSN, JWTSecret                   string
	LogLevel                                                   string
	SMTPHost, SMTPUser, SMTPPassword, SMTPFrom                 string
	CloudinaryCloudName, CloudinaryAPIKey, CloudinaryAPISecret string
	SMTPPort                                                   int
	SMTPSecure                                                 bool
	AccessTTL, RefreshTTL, OTPTTL                              time.Duration
	Origins, TrustedProxyCIDRs                                 []string
	CookieSecure, AutoMigrate                                  bool
}

func LoadConfig() (Config, error) {
	if err := loadDotEnv(".env"); err != nil {
		return Config{}, err
	}
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
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	if smtpPassword == "" {
		smtpPassword = os.Getenv("SMTP_PASS")
	}
	smtpSecure := strings.ToLower(strings.TrimSpace(os.Getenv("SMTP_SECURE")))
	if smtpSecure != "" && smtpSecure != "true" && smtpSecure != "false" {
		return Config{}, fmt.Errorf("SMTP_SECURE must be true or false")
	}
	c := Config{AppEnv: appEnv, HTTPAddr: env("HTTP_ADDR", ":8080"), DatabaseDSN: os.Getenv("DATABASE_DSN"), JWTSecret: os.Getenv("JWT_SECRET"), LogLevel: strings.ToLower(env("LOG_LEVEL", "info")), SMTPHost: strings.TrimSpace(os.Getenv("SMTP_HOST")), SMTPUser: strings.TrimSpace(os.Getenv("SMTP_USER")), SMTPPassword: smtpPassword, SMTPFrom: strings.TrimSpace(os.Getenv("SMTP_FROM")), CloudinaryCloudName: strings.TrimSpace(os.Getenv("CLOUDINARY_CLOUD_NAME")), CloudinaryAPIKey: strings.TrimSpace(os.Getenv("CLOUDINARY_API_KEY")), CloudinaryAPISecret: strings.TrimSpace(os.Getenv("CLOUDINARY_API_SECRET")), SMTPPort: port("SMTP_PORT", 587), SMTPSecure: smtpSecure == "true", AccessTTL: duration("ACCESS_TOKEN_TTL", 15*time.Minute), RefreshTTL: duration("REFRESH_TOKEN_TTL", 7*24*time.Hour), OTPTTL: duration("OTP_TTL", 10*time.Minute), Origins: split(os.Getenv("CORS_ALLOWED_ORIGINS")), TrustedProxyCIDRs: split(os.Getenv("TRUSTED_PROXY_CIDRS")), CookieSecure: os.Getenv("COOKIE_SECURE") == "true", AutoMigrate: autoValue == "true"}
	cloudinarySet := 0
	for _, value := range []string{c.CloudinaryCloudName, c.CloudinaryAPIKey, c.CloudinaryAPISecret} {
		if value != "" {
			cloudinarySet++
		}
	}
	if cloudinarySet != 0 && cloudinarySet != 3 {
		return Config{}, fmt.Errorf("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be configured together")
	}
	if c.CloudinaryCloudName != "" {
		for _, char := range c.CloudinaryCloudName {
			if !(char >= 'a' && char <= 'z') && !(char >= 'A' && char <= 'Z') && !(char >= '0' && char <= '9') && char != '-' && char != '_' {
				return Config{}, fmt.Errorf("CLOUDINARY_CLOUD_NAME contains unsupported characters")
			}
		}
	}
	if c.LogLevel != "debug" && c.LogLevel != "info" && c.LogLevel != "warn" && c.LogLevel != "error" {
		return Config{}, fmt.Errorf("LOG_LEVEL must be debug, info, warn, or error")
	}
	if c.DatabaseDSN == "" {
		return c, fmt.Errorf("DATABASE_DSN is required")
	}
	if len(c.JWTSecret) < 32 {
		return c, fmt.Errorf("JWT_SECRET must contain at least 32 characters")
	}
	for _, cidr := range c.TrustedProxyCIDRs {
		if _, _, err := net.ParseCIDR(cidr); err != nil {
			return c, fmt.Errorf("TRUSTED_PROXY_CIDRS contains an invalid CIDR %q", cidr)
		}
	}
	if c.AppEnv == "production" {
		if c.CloudinaryCloudName == "" {
			return Config{}, fmt.Errorf("CLOUDINARY_* settings are required in production")
		}
		if c.AutoMigrate {
			return c, fmt.Errorf("AUTO_MIGRATE must be false in production; run the migration command before deployment")
		}
		if !c.CookieSecure {
			return c, fmt.Errorf("COOKIE_SECURE=true is required in production")
		}
		if len(c.Origins) == 0 {
			return c, fmt.Errorf("CORS_ALLOWED_ORIGINS must be explicit in production")
		}
		if len(c.TrustedProxyCIDRs) == 0 {
			return c, fmt.Errorf("TRUSTED_PROXY_CIDRS must explicitly list reverse proxy networks in production")
		}
		for _, o := range c.Origins {
			if o == "*" {
				return c, fmt.Errorf("wildcard CORS is forbidden in production")
			}
		}
		if c.SMTPHost == "" || c.SMTPFrom == "" || c.SMTPUser == "" || c.SMTPPassword == "" {
			return c, fmt.Errorf("SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM are required in production")
		}
		for _, origin := range c.Origins {
			parsed, err := url.Parse(origin)
			if err != nil || parsed.Scheme != "https" || parsed.Host == "" || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" || parsed.User != nil || parsed.String() != origin {
				return c, fmt.Errorf("production CORS origins must be exact HTTPS origins")
			}
		}
		if _, err := mail.ParseAddress(c.SMTPFrom); err != nil {
			return c, fmt.Errorf("SMTP_FROM must be a valid email address or display-name address")
		}
		if strings.EqualFold(c.SMTPHost, "smtp.gmail.com") {
			from, _ := mail.ParseAddress(c.SMTPFrom)
			if !strings.EqualFold(from.Address, c.SMTPUser) {
				return c, fmt.Errorf("for Gmail SMTP, SMTP_FROM address must match SMTP_USER")
			}
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
