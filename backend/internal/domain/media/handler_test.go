package media

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"rikkei-ecommerce/internal/domain/auth"
)

func testJPEG(t *testing.T) []byte {
	t.Helper()
	var out bytes.Buffer
	img := image.NewRGBA(image.Rect(0, 0, 2, 2))
	img.Set(0, 0, color.White)
	if err := jpeg.Encode(&out, img, nil); err != nil {
		t.Fatal(err)
	}
	return out.Bytes()
}

func testPNG(t *testing.T) []byte {
	t.Helper()
	var out bytes.Buffer
	img := image.NewRGBA(image.Rect(0, 0, 8, 8))
	img.Set(0, 0, color.RGBA{R: 255, A: 255})
	if err := png.Encode(&out, img); err != nil {
		t.Fatal(err)
	}
	return out.Bytes()
}

func TestValidateFileAcceptsOnlyMatchingJpegAndPngExtensionAndBytes(t *testing.T) {
	valid := testJPEG(t)
	for _, name := range []string{"photo.jpg", "photo.JPEG"} {
		if _, err := validateFile(name, "image", valid); err != nil {
			t.Errorf("valid JPEG %q rejected: %v", name, err)
		}
	}
	if format, err := validateFile("photo.png", "image", testPNG(t)); err != nil || format != "png" {
		t.Fatalf("valid PNG rejected: format=%q err=%v", format, err)
	}
	for name, data := range map[string][]byte{
		"renamed-png.jpg": append([]byte("\x89PNG\r\n\x1a\n"), bytes.Repeat([]byte{0}, 32)...),
		"fake.jpg":        []byte("not an image"),
		"image.png":       valid,
		"image.webp":      valid,
	} {
		if _, err := validateFile(name, "image", data); err == nil {
			t.Errorf("invalid image %q was accepted", name)
		}
	}
}

func TestUploadSizeBoundaries(t *testing.T) {
	if !validUploadSize(15*1024, maxImageBytes) {
		t.Fatal("15 KiB image should be below the 5 MiB limit")
	}
	if !validUploadSize(maxImageBytes, maxImageBytes) {
		t.Fatal("file exactly at the configured limit should be accepted")
	}
	if validUploadSize(maxImageBytes+1, maxImageBytes) {
		t.Fatal("image above the 5 MiB limit should be rejected")
	}
	if !validUploadSize(maxVideoBytes, maxVideoBytes) || validUploadSize(maxVideoBytes+1, maxVideoBytes) {
		t.Fatal("video 20 MiB boundary is incorrect")
	}
}

func TestMediaIdempotencyFingerprintAndPublicID(t *testing.T) {
	data := testJPEG(t)
	fingerprint, err := uploadFingerprint("product-image", "fakepath/item.jpg", data)
	if err != nil {
		t.Fatal(err)
	}
	retryFingerprint, err := uploadFingerprint("product-image", "item.jpg", data)
	if err != nil || retryFingerprint != fingerprint {
		t.Fatalf("same upload should have a stable fingerprint: equal=%v err=%v", retryFingerprint == fingerprint, err)
	}
	changedFingerprint, err := uploadFingerprint("avatar", "item.jpg", data)
	if err != nil || changedFingerprint == fingerprint {
		t.Fatalf("upload purpose must be part of the fingerprint: equal=%v err=%v", changedFingerprint == fingerprint, err)
	}
	key := "9f5e14a2-bd44-4ebc-a95a-5ba041c73509"
	if mediaPublicID("7", "product-image", key) != mediaPublicID("7", "product-image", key) {
		t.Fatal("retry must target the same Cloudinary public ID")
	}
	if mediaPublicID("7", "product-image", key) == mediaPublicID("8", "product-image", key) || mediaPublicID("7", "product-image", key) == mediaPublicID("7", "avatar", key) {
		t.Fatal("public IDs must be isolated by user and purpose")
	}
}

func TestUploadRequiresIdempotencyKey(t *testing.T) {
	config := auth.Config{CloudinaryCloudName: "cloud", CloudinaryAPIKey: "key", CloudinaryAPISecret: "secret"}
	handler := NewHandler(nil, config)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/media", nil)
	req = req.WithContext(auth.WithUser(req.Context(), "900001", "SELLER"))
	rec := httptest.NewRecorder()

	handler.upload(rec, req)
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "idempotency_key_required") {
		t.Fatalf("missing idempotency key status=%d body=%s", rec.Code, rec.Body.String())
	}
}

func TestValidateFileVideoSignatures(t *testing.T) {
	if _, err := validateFile("clip.mp4", "video", append([]byte{0, 0, 0, 0}, append([]byte("ftyp"), bytes.Repeat([]byte{0}, 8)...)...)); err != nil {
		t.Fatalf("valid MP4 signature rejected: %v", err)
	}
	if _, err := validateFile("clip.webm", "video", []byte{0x1a, 0x45, 0xdf, 0xa3}); err != nil {
		t.Fatalf("valid WebM signature rejected: %v", err)
	}
	for _, tc := range []struct {
		name string
		data []byte
	}{{"clip.mp4", []byte("not a video")}, {"clip.avi", []byte{0, 1, 2, 3}}} {
		if _, err := validateFile(tc.name, "video", tc.data); err == nil {
			t.Errorf("invalid video %q was accepted", tc.name)
		}
	}
}

func TestUploadPolicyScopesMediaByRoleAndUser(t *testing.T) {
	tests := []struct {
		name, role, purpose string
		allowed             bool
	}{
		{"client avatar", "CLIENT", "avatar", true},
		{"client shop branding", "CLIENT", "shop-image", true},
		{"client cannot upload product", "CLIENT", "product-image", false},
		{"seller product image", "SELLER", "product-image", true},
		{"admin cannot upload seller product", "ADMIN", "product-video", false},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			r := httptest.NewRequest("POST", "/api/v1/media", nil)
			r = r.WithContext(auth.WithUser(r.Context(), "user-123", tc.role))
			w := httptest.NewRecorder()
			_, _, folder, ok := NewHandler(nil, auth.Config{}).uploadPolicy(w, r, tc.purpose)
			if ok != tc.allowed {
				t.Fatalf("allowed=%v, want %v (response: %s)", ok, tc.allowed, w.Body.String())
			}
			if ok && folder == "" {
				t.Fatal("authorized upload did not receive a user-scoped storage folder")
			}
		})
	}
}

func TestUploadPolicyRejectsIdentityPathInjection(t *testing.T) {
	r := httptest.NewRequest("POST", "/api/v1/media", nil)
	r = r.WithContext(auth.WithUser(r.Context(), "../other", "CLIENT"))
	w := httptest.NewRecorder()
	if _, _, _, ok := NewHandler(nil, auth.Config{}).uploadPolicy(w, r, "avatar"); ok {
		t.Fatal("identity containing path separators was accepted")
	}
}

func TestUploadRateLimitIsPerUserAndResetsAfterWindow(t *testing.T) {
	h := NewHandler(nil, auth.Config{})
	start := time.Date(2026, 11, 12, 10, 0, 0, 0, time.UTC)
	for i := 0; i < maxUploadsPerMinute; i++ {
		if !h.allowUpload("user-a", start) {
			t.Fatalf("upload %d was unexpectedly rejected", i+1)
		}
	}
	if h.allowUpload("user-a", start) {
		t.Fatal("upload beyond the per-user minute limit was accepted")
	}
	if !h.allowUpload("user-b", start) {
		t.Fatal("one user's upload limit affected another user")
	}
	if !h.allowUpload("user-a", start.Add(time.Minute)) {
		t.Fatal("upload limit did not reset after one minute")
	}
}
