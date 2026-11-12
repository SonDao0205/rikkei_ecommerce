package media

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"net/http/httptest"
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

func TestValidateFileImagesRequireRealJPEGAndJpegExtension(t *testing.T) {
	valid := testJPEG(t)
	for _, name := range []string{"photo.jpg", "photo.JPEG"} {
		if _, err := validateFile(name, "image", valid); err != nil {
			t.Errorf("valid JPEG %q rejected: %v", name, err)
		}
	}
	for name, data := range map[string][]byte{
		"renamed-png.jpg": append([]byte("\x89PNG\r\n\x1a\n"), bytes.Repeat([]byte{0}, 32)...),
		"fake.jpg":        []byte("not an image"),
		"image.png":       valid,
	} {
		if _, err := validateFile(name, "image", data); err == nil {
			t.Errorf("invalid image %q was accepted", name)
		}
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
			_, _, folder, ok := NewHandler(auth.Config{}).uploadPolicy(w, r, tc.purpose)
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
	if _, _, _, ok := NewHandler(auth.Config{}).uploadPolicy(w, r, "avatar"); ok {
		t.Fatal("identity containing path separators was accepted")
	}
}

func TestUploadRateLimitIsPerUserAndResetsAfterWindow(t *testing.T) {
	h := NewHandler(auth.Config{})
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
