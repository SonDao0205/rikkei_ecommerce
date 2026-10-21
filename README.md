# Rikkei E-Commerce Backend

Backend Go cho MVP Rikkei E-Commerce. Hiện tại repository cung cấp API xác thực và nền tảng phân quyền để frontend tích hợp; các nghiệp vụ sản phẩm, giỏ hàng và đơn hàng chưa có trong phạm vi API hiện tại.

## Chạy backend local

Yêu cầu Go 1.24+ và MySQL. Tạo database `rikkei_ecommerce`, cấu hình file `.env` theo `.env.example`, rồi chạy từ thư mục `project-ojt`:

```powershell
go test ./...
go run ./cmd/api
```

Mặc định API chạy tại `http://localhost:8080`. Khi `AUTO_MIGRATE=true`, backend tự tạo/cập nhật các bảng phục vụ auth. Đặt `CORS_ALLOWED_ORIGINS` đúng origin của frontend; giá trị mẫu là `http://localhost:5173`.

Không commit `.env`. Trong production cần `APP_ENV=production`, `COOKIE_SECURE=true`, HTTPS, JWT secret riêng đủ mạnh, SMTP dùng STARTTLS và `AUTO_MIGRATE=false`; chạy `go run ./cmd/migrate` trước khi triển khai API.

## Tích hợp từ frontend

Đặt base URL trong frontend, ví dụ:

```js
const API_BASE_URL = "http://localhost:8080";
```

Các request có JSON body phải đặt `Content-Type: application/json`. API response là JSON UTF-8. Thành công trả `success: true`; lỗi trả HTTP status phù hợp cùng `message` và `errors`:

```json
{
  "success": false,
  "message": "Email/phone or password is incorrect",
  "errors": [
    { "code": "invalid_credentials", "message": "Email/phone or password is incorrect" }
  ]
}
```

### Đăng ký

`POST /api/v1/auth/register` — không cần đăng nhập. Đăng ký luôn tạo role `CLIENT`; client không thể tự chọn role.

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "full_name": "Nguyen Van A",
  "phone": "+84901234567"
}
```

Email được chuẩn hóa chữ thường. Email và phone phải duy nhất. Phone gồm 9–15 chữ số, có thể bắt đầu bằng `+`. Mật khẩu dài 10–72 byte và phải có ít nhất một chữ cái cùng một chữ số. Thành công trả HTTP `201` và `data` là hồ sơ user.

### Đăng nhập

`POST /api/v1/auth/login` — không cần đăng nhập. Có thể gửi email hoặc số điện thoại trong `identifier`:

```json
{ "identifier": "customer@example.com", "password": "SecurePass123" }
```

Hoặc gửi số điện thoại:

```json
{ "identifier": "+84901234567", "password": "SecurePass123" }
```

Thành công trả `data.access_token`, `data.expires_in` (giây) và `data.user`; đồng thời server đặt refresh token trong cookie `HttpOnly`. FE chỉ giữ access token trong bộ nhớ ứng dụng và gửi nó trong header:

```http
Authorization: Bearer <access_token>
```

Không lưu access token hoặc refresh token trong `localStorage`. Refresh token không có trong JSON response.

### Refresh phiên

`POST /api/v1/auth/refresh` — không gửi body và không cần Bearer token. Trình duyệt phải gửi cookie:

```js
const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
  method: "POST",
  credentials: "include",
});
const result = await response.json();
// Cập nhật access token trong memory bằng result.data.access_token
```

Cookie được giới hạn path `/api/v1/auth/refresh`, có `HttpOnly`, `SameSite=Strict`, thời hạn phiên tối đa 7 ngày. Refresh thành công xoay cookie và trả access token mới. Nếu nhận `401`, hãy yêu cầu người dùng đăng nhập lại. Nếu refresh token cũ bị dùng lại, backend thu hồi phiên tương ứng.

Để request cross-origin chạy được, origin FE phải khớp chính xác `CORS_ALLOWED_ORIGINS` và request refresh phải dùng `credentials: "include"`. Mặc định local là frontend `http://localhost:5173` và backend `http://localhost:8080`. Với frontend/backend khác site, cookie `SameSite=Strict` sẽ không phù hợp; cần thiết kế lại cookie và CSRF protection trước khi triển khai.

### Lấy hồ sơ hiện tại

`GET /api/v1/auth/me` — yêu cầu Bearer access token. Thành công trả hồ sơ trong `data`:

```js
const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

### Đăng xuất

`POST /api/v1/auth/logout` — yêu cầu Bearer access token. Thu hồi phiên hiện tại và xóa refresh cookie. FE nên xóa access token trong bộ nhớ sau khi request hoàn tất.

### Quên mật khẩu và đặt lại

`POST /api/v1/auth/forgot-password` nhận email hoặc phone; OTP được gửi đến email của tài khoản:

```json
{ "identifier": "customer@example.com" }
```

Response thành công có cùng nội dung dù tài khoản tồn tại hay không để tránh dò tài khoản. Ở `APP_ENV=development`, OTP được ghi ở log backend để kiểm tra local. Ở production, backend gửi email qua SMTP STARTTLS.

`POST /api/v1/auth/reset-password` nhận email, OTP 6 chữ số và mật khẩu mới:

```json
{
  "email": "customer@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass456"
}
```

OTP hết hạn theo `OTP_TTL` (mặc định 10 phút), bị khóa sau 5 lần nhập sai và có cooldown gửi lại 60 giây. Đặt lại mật khẩu thu hồi các phiên hiện có; người dùng cần đăng nhập lại.

## Danh sách endpoint

| Method | Endpoint | Xác thực | Kết quả |
|---|---|---|---|
| `GET` | `/healthz` | Không | Kiểm tra kết nối database |
| `POST` | `/api/v1/auth/register` | Không | Tạo tài khoản CLIENT |
| `POST` | `/api/v1/auth/login` | Không | Access token và refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Refresh cookie | Xoay phiên và cấp access token mới |
| `POST` | `/api/v1/auth/logout` | Bearer | Thu hồi phiên hiện tại |
| `GET` | `/api/v1/auth/me` | Bearer | Hồ sơ user hiện tại |
| `POST` | `/api/v1/auth/forgot-password` | Không | Yêu cầu OTP đặt lại mật khẩu |
| `POST` | `/api/v1/auth/reset-password` | Không | Đặt mật khẩu mới bằng OTP |
| `GET` | `/api/v1/admin/users` | ADMIN | Danh sách tối đa 100 user, API minh họa RBAC |

Role trong response/JWT là `CLIENT`, `SELLER` hoặc `ADMIN`. Role trong database dùng chữ thường. Việc cấp role đặc quyền phải do quy trình vận hành tin cậy thực hiện; endpoint đăng ký public không nhận role.

Các status FE thường cần xử lý: `400` dữ liệu không hợp lệ, `401` thiếu/sai/hết hạn xác thực, `403` origin hoặc role không được phép, `409` email/phone đã dùng, `415` content type không đúng, `429` vượt giới hạn request, `503` database không sẵn sàng. Mọi request body JSON bị giới hạn 1 MiB; JSON sai định dạng, có field lạ hoặc có nhiều JSON value bị từ chối.

## Bảo mật và giới hạn

- Mật khẩu được hash bằng bcrypt cost 12. JWT dùng HS256, có `jti` duy nhất, thời hạn, issuer, audience, subject và loại access/refresh riêng.
- Middleware kiểm tra trạng thái tài khoản, role hiện tại từ DB và phiên chưa bị thu hồi cho mỗi request được bảo vệ.
- Refresh token chỉ lưu dạng SHA-256 hash trong database; phát hiện replay sẽ thu hồi phiên.
- CORS dùng allowlist; có security headers, giới hạn request cho auth/OTP và response lỗi không trả chi tiết SQL.
- Rate limiter hiện lưu trong bộ nhớ của một process. Khi chạy nhiều replica, cần rate limit tập trung ở gateway hoặc Redis.
- Các route sản phẩm, shop, giỏ hàng, đơn hàng, OAuth, xác minh email, MFA và quản lý nhiều thiết bị chưa được triển khai.

## Kiểm thử

Đã chạy thành công `go test ./...`, `go vet ./...`, `go build ./...` và smoke test trên MySQL local. Smoke test bao gồm health, đăng ký, login email/phone, refresh/replay, chặn CLIENT khỏi route ADMIN, logout và thu hồi phiên. Unit test bao gồm validation mật khẩu/phone/role, JWT tamper/type/expiry, auth bắt buộc, CORS, JSON nghiêm ngặt và rate limit.

Luồng gửi email/OTP chưa được kiểm thử end-to-end với SMTP thật; cần kiểm tra cấu hình SMTP trước khi bật chức năng này cho người dùng. Smoke test tạo các user ngẫu nhiên trong database:

```powershell
./scripts/smoke-api.ps1
```

Có thể đổi địa chỉ backend bằng biến môi trường `API_BASE_URL`. Script cần API đang chạy và `.env` trỏ tới database dùng cho kiểm thử.

## Cấu trúc chính

```text
cmd/api/                         Entry point HTTP
cmd/migrate/                     Chạy migration thủ công
internal/auth/                   Auth, JWT, OTP, RBAC và middleware
internal/auth/migrations/        Migration MySQL được nhúng
internal/auth/app_test.go        Unit tests
scripts/smoke-api.ps1            API smoke test
```
