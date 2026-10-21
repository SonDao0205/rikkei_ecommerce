package main

import (
	"context"
	"database/sql"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"rikkei-ecommerce/internal/auth"
)

func main() {
	cfg, err := auth.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	db, err := sql.Open("mysql", cfg.DatabaseDSN)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err = db.PingContext(ctx); err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	if err = auth.Migrate(ctx, db); err != nil {
		log.Fatal(err)
	}
	log.Print("security migration applied")
}
