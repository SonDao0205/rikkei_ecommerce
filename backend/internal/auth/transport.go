package auth

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/smtp"
	"strconv"
	"strings"
	"time"
)

func (a *App) setRefreshCookie(w http.ResponseWriter, v string, ttl time.Duration) {
	http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: v, Path: "/api/v1/auth/refresh", HttpOnly: true, Secure: a.cfg.CookieSecure, SameSite: http.SameSiteStrictMode, MaxAge: max(1, int(ttl.Seconds()))})
}

func (a *App) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: "", Path: "/api/v1/auth/refresh", HttpOnly: true, Secure: a.cfg.CookieSecure, SameSite: http.SameSiteStrictMode, MaxAge: -1})
}

func (a *App) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowed := false
		for _, v := range a.cfg.Origins {
			if v == origin {
				allowed = true
				break
			}
		}
		if origin != "" && allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		if r.Method == http.MethodOptions {
			if !allowed && origin != "" {
				writeError(w, 403, "origin_denied", "Origin is not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.WriteHeader(204)
			return
		}
		if origin != "" && !allowed {
			writeError(w, 403, "origin_denied", "Origin is not allowed")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cache-Control", "no-store")
		if a.cfg.CookieSecure {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) allow(w http.ResponseWriter, r *http.Request, limit int, window time.Duration) bool {
	ip := a.clientIP(r)
	key := r.URL.Path + ":" + ip
	now := time.Now()
	a.rateMu.Lock()
	defer a.rateMu.Unlock()
	if len(a.rates) > 5000 {
		for k, v := range a.rates {
			if now.Sub(v.started) > 5*time.Minute {
				delete(a.rates, k)
			}
		}
	}
	v := a.rates[key]
	if now.Sub(v.started) >= window {
		v = rateWindow{started: now}
	}
	v.count++
	a.rates[key] = v
	if v.count > limit {
		w.Header().Set("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
		writeError(w, 429, "rate_limited", "Too many requests")
		return false
	}
	return true
}

func (a *App) clientIP(r *http.Request) string {
	remoteIP := r.RemoteAddr
	if host, _, err := net.SplitHostPort(remoteIP); err == nil {
		remoteIP = host
	}
	remote := net.ParseIP(remoteIP)
	if remote == nil {
		return r.RemoteAddr
	}

	for _, cidr := range a.cfg.TrustedProxyCIDRs {
		_, network, err := net.ParseCIDR(cidr)
		if err != nil || !network.Contains(remote) {
			continue
		}
		forwarded := net.ParseIP(strings.TrimSpace(r.Header.Get("X-Real-IP")))
		if forwarded != nil {
			return forwarded.String()
		}
		break
	}
	return remote.String()
}

func (a *App) sendOTP(to, otp string) error {
	addr := net.JoinHostPort(a.cfg.SMTPHost, strconv.Itoa(a.cfg.SMTPPort))
	conn, e := net.DialTimeout("tcp", addr, 8*time.Second)
	if e != nil {
		return e
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(12 * time.Second))
	c, e := smtp.NewClient(conn, a.cfg.SMTPHost)
	if e != nil {
		return e
	}
	defer c.Close()
	ok, _ := c.Extension("STARTTLS")
	if !ok {
		return fmt.Errorf("SMTP server does not offer STARTTLS")
	}
	if e = c.StartTLS(&tls.Config{ServerName: a.cfg.SMTPHost, MinVersion: tls.VersionTLS12}); e != nil {
		return e
	}
	if a.cfg.SMTPUser != "" {
		if e = c.Auth(smtp.PlainAuth("", a.cfg.SMTPUser, a.cfg.SMTPPassword, a.cfg.SMTPHost)); e != nil {
			return e
		}
	}
	from := a.cfg.SMTPFrom
	if e = c.Mail(from); e != nil {
		return e
	}
	if e = c.Rcpt(to); e != nil {
		return e
	}
	w, e := c.Data()
	if e != nil {
		return e
	}
	_, e = fmt.Fprintf(w, "From: %s\r\nTo: %s\r\nSubject: Rikkei E-Commerce password reset code\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nYour verification code is %s. It expires in %d minutes.\r\n", from, to, otp, int(a.cfg.OTPTTL.Minutes()))
	if e != nil {
		_ = w.Close()
		return e
	}
	if e = w.Close(); e != nil {
		return e
	}
	return c.Quit()
}
