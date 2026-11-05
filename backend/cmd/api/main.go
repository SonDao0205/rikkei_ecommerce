package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/app/migrations"
	"rikkei-ecommerce/internal/platform/observability"
	"rikkei-ecommerce/internal/app/server"
)

func main() {
	cfg, err := auth.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	structuredLogger := observability.NewLogger(cfg.AppEnv, cfg.LogLevel)
	legacyLogger := observability.LegacyLogger(structuredLogger)
	db, err := sql.Open("mysql", cfg.DatabaseDSN)
	if err != nil {
		structuredLogger.Error("database initialization failed", slog.Any("error", err))
		os.Exit(1)
	}
	defer db.Close()
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(3 * time.Minute)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err = db.PingContext(ctx); err != nil {
		structuredLogger.Error("database connection failed", slog.Any("error", err))
		os.Exit(1)
	}
	if cfg.AutoMigrate {
		if err = migrations.Run(ctx, db); err != nil {
			structuredLogger.Error("database migration failed", slog.Any("error", err))
			os.Exit(1)
		}
	}
	srv := &http.Server{Addr: cfg.HTTPAddr, Handler: observability.Wrap(structuredLogger, server.NewHandler(cfg, db, legacyLogger)), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 20 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 1 << 20}
	go func() {
		structuredLogger.Info("API listening", slog.String("addr", cfg.HTTPAddr), slog.String("environment", cfg.AppEnv))
		if e := srv.ListenAndServe(); e != nil && !errors.Is(e, http.ErrServerClosed) {
			structuredLogger.Error("HTTP server failed", slog.Any("error", e))
			os.Exit(1)
		}
	}()
	stop, stopCancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stopCancel()
	<-stop.Done()
	shutdown, done := context.WithTimeout(context.Background(), 10*time.Second)
	defer done()
	if err := srv.Shutdown(shutdown); err != nil {
		structuredLogger.Error("HTTP server shutdown failed", slog.Any("error", err))
	} else {
		structuredLogger.Info("HTTP server stopped")
	}
}
