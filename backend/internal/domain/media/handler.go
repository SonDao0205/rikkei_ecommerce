package media

import (
	"bytes"
	"context"
	"crypto/sha1"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/idempotency"
)

const (
	maxImageBytes       = 5 << 20
	maxVideoBytes       = 20 << 20
	maxRequestPad       = 1 << 20
	maxUploadsPerMinute = 30
)

type Handler struct {
	db          *sql.DB
	config      auth.Config
	httpClient  *http.Client
	uploadSlots chan struct{}
	rateMu      sync.Mutex
	rates       map[string]uploadRateWindow
}

type uploadRateWindow struct {
	started time.Time
	count   int
}

type uploadResult struct {
	URL          string `json:"url"`
	PublicID     string `json:"public_id"`
	ResourceType string `json:"resource_type"`
	Format       string `json:"format"`
	Bytes        int64  `json:"bytes"`
}

type cloudinaryResponse struct {
	SecureURL    string `json:"secure_url"`
	PublicID     string `json:"public_id"`
	ResourceType string `json:"resource_type"`
	Format       string `json:"format"`
	Bytes        int64  `json:"bytes"`
	Error        *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func NewHandler(db *sql.DB, config auth.Config) *Handler {
	return &Handler{db: db, config: config, httpClient: &http.Client{Timeout: 120 * time.Second}, uploadSlots: make(chan struct{}, 3), rates: make(map[string]uploadRateWindow)}
}

func (h *Handler) upload(w http.ResponseWriter, r *http.Request) {
	if h.config.CloudinaryCloudName == "" || h.config.CloudinaryAPIKey == "" || h.config.CloudinaryAPISecret == "" {
		writeError(w, http.StatusServiceUnavailable, "media_storage_unavailable", "Media storage is not configured")
		return
	}
	identity := auth.CurrentUser(r)
	userID, userIDErr := strconv.ParseInt(identity.ID, 10, 64)
	if userIDErr != nil || userID < 1 || strings.ContainsAny(identity.ID, `/\\`) {
		writeError(w, http.StatusUnauthorized, "invalid_session", "Authenticated user is invalid")
		return
	}
	key := strings.TrimSpace(r.Header.Get("Idempotency-Key"))
	if !idempotency.ValidKey(key) {
		writeError(w, http.StatusBadRequest, "idempotency_key_required", "A valid Idempotency-Key header is required")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxVideoBytes+maxRequestPad)
	if err := r.ParseMultipartForm(1 << 20); err != nil {
		var sizeError *http.MaxBytesError
		if errors.As(err, &sizeError) {
			writeError(w, http.StatusRequestEntityTooLarge, "file_size_exceeded", "Upload request exceeds the 20 MB video limit")
			return
		}
		writeError(w, http.StatusBadRequest, "invalid_multipart_upload", "Upload request is malformed or exceeds the maximum file size")
		return
	}
	if r.MultipartForm != nil {
		defer r.MultipartForm.RemoveAll()
	}
	purpose := strings.TrimSpace(r.FormValue("purpose"))
	resourceType, maxBytes, folder, ok := h.uploadPolicy(w, r, purpose)
	if !ok {
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file_required", "A file field is required")
		return
	}
	defer file.Close()
	if !validUploadSize(header.Size, maxBytes) {
		writeError(w, http.StatusRequestEntityTooLarge, "file_size_exceeded", fmt.Sprintf("File must be between 1 byte and %d MB", maxBytes>>20))
		return
	}
	data, err := io.ReadAll(io.LimitReader(file, maxBytes+1))
	if err != nil {
		writeError(w, http.StatusBadRequest, "file_read_failed", "Could not read uploaded file")
		return
	}
	if !validUploadSize(int64(len(data)), maxBytes) {
		writeError(w, http.StatusRequestEntityTooLarge, "file_size_exceeded", fmt.Sprintf("File must be between 1 byte and %d MB", maxBytes>>20))
		return
	}
	if _, err = validateFile(header.Filename, resourceType, data); err != nil {
		writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", err.Error())
		return
	}
	requestHash, err := uploadFingerprint(purpose, header.Filename, data)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "The upload request could not be prepared")
		return
	}
	publicID := mediaPublicID(identity.ID, purpose, key)
	tx, replay, err := beginMediaUpload(r.Context(), h.db, userID, key, purpose, requestHash, publicID)
	if errors.Is(err, errUploadKeyReused) {
		writeError(w, http.StatusConflict, "idempotency_key_reused", "This Idempotency-Key was already used for a different upload")
		return
	}
	if errors.Is(err, errUploadInProgress) {
		writeError(w, http.StatusConflict, "upload_in_progress", "The original upload is still being processed; retry with the same key")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "The upload request could not be reserved")
		return
	}
	if replay != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Idempotency-Replayed", "true")
		w.WriteHeader(http.StatusCreated)
		_, _ = w.Write(replay.body)
		return
	}
	defer tx.Rollback()
	if !h.allowUpload(identity.ID, time.Now()) {
		w.Header().Set("Retry-After", "60")
		writeError(w, http.StatusTooManyRequests, "upload_rate_limited", "Upload limit reached. Please try again in a minute")
		return
	}
	select {
	case h.uploadSlots <- struct{}{}:
		defer func() { <-h.uploadSlots }()
	case <-r.Context().Done():
		writeError(w, http.StatusRequestTimeout, "upload_cancelled", "Upload was cancelled")
		return
	}
	result, err := h.uploadToCloudinary(r.Context(), data, filepath.Base(header.Filename), resourceType, folder, publicID)
	if err != nil {
		writeError(w, http.StatusBadGateway, "media_storage_failed", "The file could not be stored. Please try again")
		return
	}
	response, err := json.Marshal(map[string]any{"success": true, "data": result})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "The upload response could not be prepared")
		return
	}
	if err = persistMediaUpload(r.Context(), tx, userID, key, response); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "The upload result could not be recorded")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "The upload result could not be committed")
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusCreated)
	_, _ = w.Write(response)
}

func validUploadSize(size, maxBytes int64) bool { return size > 0 && size <= maxBytes }

func uploadFingerprint(purpose, filename string, data []byte) (string, error) {
	contentDigest := sha256.Sum256(data)
	return idempotency.Fingerprint(struct {
		Purpose       string `json:"purpose"`
		Filename      string `json:"filename"`
		ContentSHA256 string `json:"content_sha256"`
	}{purpose, filepath.Base(filename), hex.EncodeToString(contentDigest[:])})
}

func mediaPublicID(userID, purpose, key string) string {
	digest := sha256.Sum256([]byte(userID + "|" + purpose + "|" + key))
	return "request-" + hex.EncodeToString(digest[:16])
}

func (h *Handler) allowUpload(userID string, now time.Time) bool {
	h.rateMu.Lock()
	defer h.rateMu.Unlock()
	if h.rates == nil {
		h.rates = make(map[string]uploadRateWindow)
	}
	if len(h.rates) > 5000 {
		for id, window := range h.rates {
			if now.Sub(window.started) >= time.Minute {
				delete(h.rates, id)
			}
		}
	}
	window := h.rates[userID]
	if now.Sub(window.started) >= time.Minute || window.started.IsZero() {
		window = uploadRateWindow{started: now}
	}
	if window.count >= maxUploadsPerMinute {
		h.rates[userID] = window
		return false
	}
	window.count++
	h.rates[userID] = window
	return true
}

func (h *Handler) uploadPolicy(w http.ResponseWriter, r *http.Request, purpose string) (resourceType string, maxBytes int64, folder string, ok bool) {
	identity := auth.CurrentUser(r)
	allowed := false
	switch purpose {
	case "avatar":
		allowed = hasRole(identity.Roles, "CLIENT", "SELLER", "ADMIN") || hasRole([]string{identity.Role}, "CLIENT", "SELLER", "ADMIN")
		resourceType, maxBytes, folder = "image", maxImageBytes, "avatars"
	case "shop-image":
		allowed = hasRole(identity.Roles, "CLIENT", "SELLER") || hasRole([]string{identity.Role}, "CLIENT", "SELLER")
		resourceType, maxBytes, folder = "image", maxImageBytes, "shop-images"
	case "product-image":
		allowed = hasRole(identity.Roles, "SELLER") || hasRole([]string{identity.Role}, "SELLER")
		resourceType, maxBytes, folder = "image", maxImageBytes, "product-images"
	case "product-video":
		allowed = hasRole(identity.Roles, "SELLER") || hasRole([]string{identity.Role}, "SELLER")
		resourceType, maxBytes, folder = "video", maxVideoBytes, "product-videos"
	default:
		writeError(w, http.StatusBadRequest, "invalid_upload_purpose", "purpose must be avatar, shop-image, product-image, or product-video")
		return "", 0, "", false
	}
	if !allowed {
		writeError(w, http.StatusForbidden, "upload_forbidden", "This account role cannot upload this media type")
		return "", 0, "", false
	}
	if identity.ID == "" || strings.ContainsAny(identity.ID, `/\`) {
		writeError(w, http.StatusUnauthorized, "invalid_session", "Authenticated user is invalid")
		return "", 0, "", false
	}
	return resourceType, maxBytes, "ecommerce/" + folder + "/" + identity.ID, true
}

func hasRole(roles []string, expected ...string) bool {
	for _, role := range roles {
		for _, allowed := range expected {
			if strings.EqualFold(role, allowed) {
				return true
			}
		}
	}
	return false
}

func validateFile(filename, resourceType string, data []byte) (string, error) {
	extension := strings.ToLower(filepath.Ext(filename))
	sniffed := http.DetectContentType(data[:min(len(data), 512)])
	if resourceType == "image" {
		switch extension {
		case ".jpg", ".jpeg":
			if sniffed != "image/jpeg" {
				return "", errors.New("File content does not match a JPEG image")
			}
			if _, err := jpeg.DecodeConfig(bytes.NewReader(data)); err != nil {
				return "", errors.New("JPEG image data is malformed")
			}
			return "jpg", nil
		case ".png":
			if sniffed != "image/png" {
				return "", errors.New("File content does not match a PNG image")
			}
			if _, err := png.DecodeConfig(bytes.NewReader(data)); err != nil {
				return "", errors.New("PNG image data is malformed")
			}
			return "png", nil
		default:
			return "", errors.New("Image format must be JPG, JPEG, or PNG")
		}
	}
	switch extension {
	case ".mp4", ".mov":
		if len(data) < 12 || string(data[4:8]) != "ftyp" {
			return "", errors.New("File content is not a valid MP4/MOV video")
		}
		return strings.TrimPrefix(extension, "."), nil
	case ".webm":
		if len(data) < 4 || !bytes.Equal(data[:4], []byte{0x1a, 0x45, 0xdf, 0xa3}) {
			return "", errors.New("File content is not a valid WebM video")
		}
		return "webm", nil
	default:
		return "", errors.New("Video format must be MP4, MOV, or WebM")
	}
}

func (h *Handler) uploadToCloudinary(ctx context.Context, data []byte, filename, resourceType, folder, publicID string) (uploadResult, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{"folder": folder, "overwrite": "true", "public_id": publicID, "timestamp": timestamp}
	signature := signParams(params, h.config.CloudinaryAPISecret)
	endpoint := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/%s/upload", url.PathEscape(h.config.CloudinaryCloudName), resourceType)
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	for key, value := range map[string]string{"api_key": h.config.CloudinaryAPIKey, "timestamp": timestamp, "folder": folder, "public_id": publicID, "overwrite": "true", "signature": signature} {
		if err := writer.WriteField(key, value); err != nil {
			return uploadResult{}, err
		}
	}
	part, err := writer.CreateFormFile("file", filepath.Base(filename))
	if err != nil {
		return uploadResult{}, err
	}
	if _, err = part.Write(data); err != nil {
		return uploadResult{}, err
	}
	if err = writer.Close(); err != nil {
		return uploadResult{}, err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, &body)
	if err != nil {
		return uploadResult{}, err
	}
	request.Header.Set("Content-Type", writer.FormDataContentType())
	response, err := h.httpClient.Do(request)
	if err != nil {
		return uploadResult{}, err
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		return uploadResult{}, err
	}
	var cloud cloudinaryResponse
	if err = json.Unmarshal(responseBody, &cloud); err != nil {
		return uploadResult{}, err
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 || cloud.Error != nil {
		return uploadResult{}, fmt.Errorf("cloudinary returned status %d", response.StatusCode)
	}
	parsed, err := url.Parse(cloud.SecureURL)
	if err != nil || parsed.Scheme != "https" || !strings.EqualFold(parsed.Host, "res.cloudinary.com") || cloud.PublicID == "" {
		return uploadResult{}, errors.New("cloudinary response did not contain a valid secure asset URL")
	}
	return uploadResult{URL: cloud.SecureURL, PublicID: cloud.PublicID, ResourceType: cloud.ResourceType, Format: cloud.Format, Bytes: cloud.Bytes}, nil
}

func signParams(params map[string]string, secret string) string {
	keys := make([]string, 0, len(params))
	for key := range params {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	var canonical strings.Builder
	for index, key := range keys {
		if index > 0 {
			canonical.WriteByte('&')
		}
		canonical.WriteString(key)
		canonical.WriteByte('=')
		canonical.WriteString(params[key])
	}
	canonical.WriteString(secret)
	digest := sha1.Sum([]byte(canonical.String()))
	return hex.EncodeToString(digest[:])
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{"success": false, "error": map[string]string{"code": code, "message": message}})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
