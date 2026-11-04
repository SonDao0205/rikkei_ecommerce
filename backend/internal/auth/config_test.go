package auth

import (
	"bufio"
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadDotEnvReturnsScannerError(t *testing.T) {
	path := filepath.Join(t.TempDir(), ".env")
	line := make([]byte, 70*1024)
	for i := range line {
		line[i] = 'a'
	}
	if err := os.WriteFile(path, line, 0o600); err != nil {
		t.Fatal(err)
	}

	err := loadDotEnv(path)
	if !errors.Is(err, bufio.ErrTooLong) {
		t.Fatalf("loadDotEnv error=%v, want wrapped scanner token length error", err)
	}
}

func TestLoadDotEnvAllowsMissingFile(t *testing.T) {
	if err := loadDotEnv(filepath.Join(t.TempDir(), "missing.env")); err != nil {
		t.Fatalf("loadDotEnv missing file error=%v, want nil", err)
	}
}

func TestLoadDotEnvPreservesExistingEnvironment(t *testing.T) {
	const key = "RIKKEI_TEST_DOTENV_PRECEDENCE"
	t.Setenv(key, "from-environment")
	path := filepath.Join(t.TempDir(), ".env")
	if err := os.WriteFile(path, []byte(key+"=from-file\n"), 0o600); err != nil {
		t.Fatal(err)
	}

	if err := loadDotEnv(path); err != nil {
		t.Fatal(err)
	}
	if got := os.Getenv(key); got != "from-environment" {
		t.Fatalf("dotenv overwrote existing environment: got %q", got)
	}
}
