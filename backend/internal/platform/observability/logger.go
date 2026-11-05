package observability

import (
	"log"
	"log/slog"
	"os"
	"strings"
)

// NewLogger creates a service-scoped structured logger. Container deployments
// should write to stdout and let the runtime collect and retain the stream.
func NewLogger(appEnv, level string) *slog.Logger {
	var slogLevel slog.Level
	switch strings.ToLower(strings.TrimSpace(level)) {
	case "debug":
		slogLevel = slog.LevelDebug
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		slogLevel = slog.LevelInfo
	}
	options := &slog.HandlerOptions{Level: slogLevel, AddSource: slogLevel <= slog.LevelDebug}
	var handler slog.Handler
	if appEnv == "production" {
		handler = slog.NewJSONHandler(os.Stdout, options)
	} else {
		handler = slog.NewTextHandler(os.Stdout, options)
	}
	return slog.New(handler).With("service", "rikkei-ecommerce")
}

// LegacyLogger adapts existing domain packages to the structured output while
// they are gradually migrated from log.Printf to slog.
func LegacyLogger(logger *slog.Logger) *log.Logger {
	return slog.NewLogLogger(logger.Handler(), slog.LevelInfo)
}
