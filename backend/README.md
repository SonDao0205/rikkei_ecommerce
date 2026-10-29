# Rikkei E-Commerce Backend

Backend Go cho MVP Rikkei E-Commerce. BE hiện có API auth/RBAC, hồ sơ cơ bản, catalog đọc danh mục/sản phẩm và một số API admin inventory. Các nghiệp vụ shop, giỏ hàng, checkout và đơn hàng vẫn đang phát triển. Contract catalog/admin inventory xem tại [docs/catalog-api.md](../docs/catalog-api.md).

Tài liệu chia thành hai phần: **DevOps** chuẩn bị cấu hình, triển khai và vận hành backend; **FE** tích hợp các API hiện có.

## 1. Hướng dẫn DevOps

### Thành phần và yêu cầu

- Go 1.24 trở lên.
- MySQL 8.x. Database/schema `rikkei_ecommerce` phải được tạo trước khi chạy migration.
- The root `docker-compose.yml` starts the frontend, backend, MySQL, Redis, and optional Cloudflare tunnel services.
- Backend mặc định lắng nghe `:8080`; có thể đổi bằng `HTTP_ADDR`.

### Chạy local

Từ thư mục `project-ojt`, sao chép `.env.example` thành `.env`, điền DSN và JWT secret riêng, sau đó chạy backend:

```powershell
Copy-Item .env.example .env
docker compose up -d mysql
go run ./cmd/api
```

Nếu đã cài MySQL trực tiếp trên máy, chỉ cần tạo schema, cấu hình `DATABASE_DSN` tương ứng và bỏ qua lệnh Docker. Ở development, `AUTO_MIGRATE=true` sẽ áp dụng migration khi API khởi động. Migration bổ sung bảng auth/security và index, tái sử dụng `refresh_tokens`, dọn token/OTP cũ; migration không tạo database và không tạo các bảng nghiệp vụ commerce.

### Cấu hình môi trường

`cmd/api` và `cmd/migrate` đọc `.env` từ thư mục làm việc hiện tại; biến môi trường của hệ thống được ưu tiên hơn `.env`.

| Biến                       | Mục đích                                         | Mặc định / yêu cầu                                                             |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `APP_ENV`                    | Chế độ chạy                                   | `development`; production dùng `production`                                           |
| `HTTP_ADDR`                  | Địa chỉ HTTP                                     | `:8080`                                                                                |
| `DATABASE_DSN`               | Kết nối MySQL                                    | Bắt buộc; schema phải tồn tại                                                |
| `JWT_SECRET`                 | Ký JWT và HMAC OTP                                 | Bắt buộc, tối thiểu 32 ký tự; dùng secret ngẫu nhiên riêng             |
| `ACCESS_TOKEN_TTL`           | Tuổi thọ access token                             | `15m`; cho phép 1 phút đến 1 giờ                                                 |
| `REFRESH_TOKEN_TTL`          | Tuổi thọ phiên refresh                           | `168h` (7 ngày); tối thiểu 1 giờ                                                 |
| `OTP_TTL`                    | Tuổi thọ mã OTP                                  | `10m`; cho phép 1–30 phút                                                          |
| `CORS_ALLOWED_ORIGINS`       | Allowlist origin FE, phân cách bằng dấu phẩy | Local mẫu: `http://localhost:5173`; production chỉ dùng origin HTTPS tường minh |
| `COOKIE_SECURE`              | Chỉ gửi cookie qua HTTPS                         | `false` local; bắt buộc `true` production                                          |
| `AUTO_MIGRATE`               | Tự áp dụng migration khi API chạy             | `true` development; production bắt buộc `false`                                    |
| `SMTP_HOST`, `SMTP_PORT`     | Máy chủ gửi OTP qua STARTTLS                    | Host do hệ thống mail cung cấp; port mặc định `587`                         |
| `SMTP_USER`, `SMTP_PASSWORD` | Xác thực SMTP nếu nhà cung cấp yêu cầu    | Cấu hình theo nhà cung cấp; không commit secret                                 |
| `SMTP_FROM`                  | Địa chỉ gửi OTP                                | Bắt buộc trong production, phải là email hợp lệ                             |

Không đưa `.env`, DSN/password database, SMTP credential hay JWT secret vào Git, image Docker, log hoặc tài liệu dùng chung. Cấp quyền DB tối thiểu cần thiết cho API; chỉ tài khoản chạy migration cần quyền DDL.

### Build, migration và khởi chạy production

```powershell
go test ./...
go vet ./...
go build -o bin/api.exe ./cmd/api
```

Trước khi triển khai, thiết lập biến production trong môi trường bảo mật (hoặc file `.env` được bảo vệ), bảo đảm database đã có, rồi chạy migration bằng tài khoản được cấp quyền DDL:

```powershell
$env:APP_ENV = "production"
$env:AUTO_MIGRATE = "false"
go run ./cmd/migrate
```

Sau khi migration hoàn tất, chạy API với cấu hình production. Production bắt buộc HTTPS, `COOKIE_SECURE=true`, `AUTO_MIGRATE=false`, JWT secret mạnh, origin HTTPS chính xác trong CORS và SMTP có STARTTLS. Dùng reverse proxy/load balancer để kết thúc TLS và giới hạn truy cập mạng tới API/DB phù hợp với hạ tầng.

Health check cho service monitor/orchestrator: `GET /healthz`. HTTP `200` nghĩa là API truy vấn được database; `503` nghĩa là database chưa sẵn sàng. Endpoint này không thay thế monitoring tài nguyên, log, backup hoặc kiểm tra readiness của các hệ thống phụ thuộc khác.

### Vận hành và giới hạn hiện tại

- Mỗi request được bảo vệ sẽ kiểm tra trạng thái và role user trong DB, cùng trạng thái phiên. Access token dùng HS256; refresh token được lưu hash, xoay vòng và replay sẽ thu hồi phiên.
- Cookie refresh có `HttpOnly`, `SameSite=Strict`, `Secure` theo cấu hình và path `/api/v1/auth/refresh`. Khi FE và API khác site, cần thiết kế lại cookie và CSRF protection trước khi triển khai.
- Rate limiter hiện nằm trong bộ nhớ của một process. Khi scale nhiều replica, chuyển giới hạn sang gateway hoặc kho chia sẻ như Redis.
- OTP được log ở development để kiểm thử; không chạy development mode với dữ liệu production. OTP/email chưa được kiểm thử end-to-end với SMTP thật.
- Hiện chưa có OAuth, MFA, xác minh email, quản lý nhiều thiết bị, module commerce hoặc công cụ bootstrap admin. Cấp `SELLER`/`ADMIN` bằng quy trình vận hành tin cậy, không qua đăng ký public.
- Migration security không thay thế việc import schema commerce đầy đủ theo SRS. Kiểm tra schema hiện có trước khi áp dụng migration trên môi trường đang chạy.

### Kiểm thử và cấu trúc code

Các lệnh đã chạy thành công: `go test ./...`, `go vet ./...`, `go build ./...` và smoke test trên MySQL local. Unit test bao gồm validation mật khẩu/phone/role, JWT tamper/type/expiry, auth bắt buộc, CORS, JSON nghiêm ngặt, rate limit và tính duy nhất của JWT phát hành liên tiếp.

Smoke test API bao gồm health, đăng ký, login email/phone, refresh/replay, từ chối CLIENT ở route ADMIN, logout và thu hồi phiên. Script tạo user kiểm thử ngẫu nhiên trong database:

```powershell
./scripts/smoke-api.ps1
```

API phải đang chạy và `.env` phải trỏ tới database dùng cho kiểm thử. Có thể đặt `API_BASE_URL` để đổi địa chỉ backend.

```text
cmd/api/                         Entry point HTTP
cmd/migrate/                     Chạy migration thủ công
internal/auth/                   Auth, JWT, OTP, RBAC và middleware
internal/auth/migrations/        Migration MySQL được nhúng
internal/auth/app_test.go        Unit tests
scripts/smoke-api.ps1            API smoke test
docker-compose.yml               MySQL local
```

## 2. Hướng dẫn FE

### Base URL, JSON và lỗi

Đặt base URL theo môi trường FE; local mặc định:

```js
const API_BASE_URL = "http://localhost:8080";
```

Request có body phải dùng `Content-Type: application/json`. Response thành công có `success: true` và thường có `data`; lỗi có HTTP status, `message` và `errors`:

```json
{
  "success": false,
  "message": "Email/phone or password is incorrect",
  "errors": [
    {
      "code": "invalid_credentials",
      "message": "Email/phone or password is incorrect"
    }
  ]
}
```

Origin của FE phải có trong `CORS_ALLOWED_ORIGINS`. Local mẫu là `http://localhost:5173`; origin được so khớp chính xác.

### Đăng ký

`POST /api/v1/auth/register` — không cần đăng nhập. Backend luôn tạo user role `CLIENT`; API public không nhận role.

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "full_name": "Nguyen Van A",
  "phone": "+84901234567"
}
```

Email được chuẩn hóa chữ thường; email và phone phải duy nhất. Phone gồm 9–15 chữ số, có thể bắt đầu bằng `+`. Mật khẩu dài 10–72 byte, có ít nhất một chữ cái và một chữ số. Thành công trả HTTP `201` và hồ sơ user trong `data`.

### Đăng nhập và access token

`POST /api/v1/auth/login` — không cần đăng nhập. `identifier` nhận email hoặc phone:

```json
{ "identifier": "customer@example.com", "password": "SecurePass123" }
```

Response thành công có `data.access_token`, `data.expires_in` (giây), `data.token_type` và `data.user`. Refresh token được đặt riêng trong cookie `HttpOnly`, không có trong JSON. FE giữ access token trong bộ nhớ ứng dụng và gửi:

```http
Authorization: Bearer <access_token>
```

Không lưu access/refresh token trong `localStorage`.

### Làm mới phiên

`POST /api/v1/auth/refresh` — không cần body hay Bearer token. Trình duyệt gửi cookie và FE cập nhật access token mới:

```js
const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
  method: "POST",
  credentials: "include",
});
const result = await response.json();
if (response.ok) {
  // Lưu result.data.access_token trong memory.
}
```

Refresh cookie có path `/api/v1/auth/refresh`, `HttpOnly`, `SameSite=Strict`; local HTTP dùng `COOKIE_SECURE=false`, production HTTPS dùng `true`. Request cross-origin cần `credentials: "include"`. Nếu refresh trả `401`, yêu cầu người dùng đăng nhập lại. Token refresh cũ bị dùng lại sẽ làm backend thu hồi phiên đó.

### Hồ sơ, đăng xuất và phân quyền

`GET /api/v1/auth/me` yêu cầu access token:

```js
const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

`POST /api/v1/auth/logout` cũng yêu cầu access token. Backend thu hồi phiên; FE nên xóa access token khỏi memory sau response thành công.

`GET /api/v1/admin/users` là route minh họa, chỉ role `ADMIN` được truy cập. Role trả về là `CLIENT`, `SELLER` hoặc `ADMIN`; FE có thể dùng role để hiển thị giao diện nhưng backend vẫn là nơi quyết định quyền truy cập.

### Quên và đặt lại mật khẩu

`POST /api/v1/auth/forgot-password` nhận email hoặc phone; OTP được gửi đến email gắn với tài khoản:

```json
{ "identifier": "customer@example.com" }
```

Response chung không tiết lộ tài khoản tồn tại hay không. Trong development, lấy OTP từ log backend; production gửi qua SMTP STARTTLS.

`POST /api/v1/auth/reset-password` nhận email, OTP 6 chữ số và mật khẩu mới:

```json
{
  "email": "customer@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass456"
}
```

OTP mặc định hết hạn sau 10 phút, tối đa 5 lần nhập sai, cooldown gửi lại 60 giây. Đặt lại mật khẩu thu hồi toàn bộ phiên; người dùng đăng nhập lại bằng mật khẩu mới.

### Danh sách API và status

| Method | Endpoint                       | Xác thực    | Mô tả                                            |
| ------ | ------------------------------ | -------------- | --------------------------------------------------- |
| `GET`  | `/healthz`                     | Không         | Kiểm tra kết nối DB                           |
| `POST` | `/api/v1/auth/register`        | Không         | Tạo tài khoản CLIENT                           |
| `POST` | `/api/v1/auth/login`           | Không         | Đăng nhập, trả access token và refresh cookie |
| `POST` | `/api/v1/auth/refresh`         | Refresh cookie | Xoay phiên, trả access token mới               |
| `POST` | `/api/v1/auth/logout`          | Bearer         | Thu hồi phiên hiện tại                       |
| `GET`  | `/api/v1/auth/me`              | Bearer         | Hồ sơ hiện tại                               |
| `POST` | `/api/v1/auth/forgot-password` | Không         | Yêu cầu OTP                                      |
| `POST` | `/api/v1/auth/reset-password`  | Không         | Đổi mật khẩu bằng OTP                       |
| `GET`  | `/api/v1/admin/users`          | ADMIN          | Tối đa 100 user, route minh họa RBAC            |

## Bổ sung bảo mật và tích hợp FE

### Tổ chức auth/security

Route HTTP tập trung tại `internal/auth/routes.go`; handlers trong `app.go` và `security_handlers.go` kiểm tra request/response, còn SQL được thực hiện theo luồng handler hiện tại. `security_handlers.go` chứa đổi mật khẩu và xác minh OTP. Đây là ranh giới đầu tiên để tách tiếp service/repository khi mở rộng nghiệp vụ; tránh thêm route rải rác trong entrypoint.

### API quản lý mật khẩu

`POST /api/v1/auth/verify-reset-otp` xác minh OTP thực sự ở server. Body nhận `identifier` (email hoặc điện thoại) và `otp`; response không trả lại OTP hoặc email được tra cứu. Endpoint reset vẫn xác minh lại OTP trong transaction, vì vậy bước verify trên client không thay thế xác minh ở thao tác thay đổi mật khẩu.

`POST /api/v1/auth/reset-password` nhận `identifier`, `otp`, `new_password`; trường `email` cũ vẫn được nhận để tương thích client cũ. Email hoặc số điện thoại đều được hỗ trợ; OTP có hạn dùng, giới hạn lần thử và cooldown. Mật khẩu được hash bằng bcrypt và các refresh session được thu hồi.

`PUT /api/v1/auth/password` yêu cầu Bearer access token. Body gồm `current_password`, `new_password`, `confirm_password`. Backend xác minh mật khẩu hiện tại, áp chính sách mật khẩu, từ chối dùng lại mật khẩu cũ, đổi mật khẩu và thu hồi mọi refresh session trong cùng transaction. FE yêu cầu đăng nhập lại sau khi đổi.

| Method | Endpoint                        | Xác thực | Chức năng                                     |
| ------ | ------------------------------- | ----------- | ------------------------------------------------ |
| `POST` | `/api/v1/auth/verify-reset-otp` | Không      | Xác minh mã OTP ở BE, áp giới hạn thử |
| `POST` | `/api/v1/auth/reset-password`   | OTP         | Đặt lại mật khẩu và thu hồi phiên    |
| `PUT`  | `/api/v1/auth/password`         | Bearer      | Đổi mật khẩu từ phiên hiện tại      |

### Run the FE and BE stack with Compose

The root of this checkout contains `docker-compose.yml`. Create `.env` from the sample, replace local passwords, and set a unique JWT secret of at least 32 characters:

## Bổ sung bảo mật và tích hợp FE

### Tổ chức auth/security

Route HTTP tập trung tại `internal/auth/routes.go`; handlers trong `app.go` và `security_handlers.go` kiểm tra request/response, còn SQL được thực hiện theo luồng handler hiện tại. `security_handlers.go` chứa đổi mật khẩu và xác minh OTP. Đây là ranh giới đầu tiên để tách tiếp service/repository khi mở rộng nghiệp vụ; tránh thêm route rải rác trong entrypoint.

### API quản lý mật khẩu

`POST /api/v1/auth/verify-reset-otp` xác minh OTP thực sự ở server. Body nhận `identifier` (email hoặc điện thoại) và `otp`; response không trả lại OTP hoặc email được tra cứu. Endpoint reset vẫn xác minh lại OTP trong transaction, vì vậy bước verify trên client không thay thế xác minh ở thao tác thay đổi mật khẩu.

`POST /api/v1/auth/reset-password` nhận `identifier`, `otp`, `new_password`; trường `email` cũ vẫn được nhận để tương thích client cũ. Email hoặc số điện thoại đều được hỗ trợ; OTP có hạn dùng, giới hạn lần thử và cooldown. Mật khẩu được hash bằng bcrypt và các refresh session được thu hồi.

`PUT /api/v1/auth/password` yêu cầu Bearer access token. Body gồm `current_password`, `new_password`, `confirm_password`. Backend xác minh mật khẩu hiện tại, áp chính sách mật khẩu, từ chối dùng lại mật khẩu cũ, đổi mật khẩu và thu hồi mọi refresh session trong cùng transaction. FE yêu cầu đăng nhập lại sau khi đổi.

| Method | Endpoint                        | Xác thực | Chức năng                             |
| ------ | ------------------------------- | -------- | ------------------------------------- |
| `POST` | `/api/v1/auth/verify-reset-otp` | Không    | Xác minh mã OTP ở BE, áp giới hạn thử |
| `POST` | `/api/v1/auth/reset-password`   | OTP      | Đặt lại mật khẩu và thu hồi phiên     |
| `PUT`  | `/api/v1/auth/password`         | Bearer   | Đổi mật khẩu từ phiên hiện tại        |

### Chạy stack FE/BE bằng Compose

Repo `project-ojt/fe/rikkei_ecommerce` là compose root vì chứa cả source FE và backend mà compose build. Tạo `.env` từ `.env.example`, đổi các mật khẩu local mẫu và đặt JWT secret ngẫu nhiên ít nhất 32 ký tự, sau đó chạy:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
Invoke-WebRequest http://localhost:5173/healthz
$env:API_BASE_URL = 'http://localhost:8080'
./backend/scripts/smoke-api.ps1
```

The FE is served at `http://localhost:5173`; Nginx proxies `/api/` and `/healthz` to the backend over the Compose network. The API and MySQL ports are bound to loopback at `8080` and `3307`. Cloudflare Tunnel starts only with the `tunnel` profile and a configured `TUNNEL_TOKEN`. In development, the OTP appears in backend logs for testing. Production sends OTP by SMTP with STARTTLS.

### Cài dependency và kiểm tra

Go modules khai báo tại `go.mod`/`go.sum`; tải và kiểm tra bằng:

````

FE được serve tại `http://localhost:5173`; Nginx proxy `/api/` và `/healthz` qua service `backend`, dùng same-origin cookie. API port `8080` và MySQL port `3307` chỉ bind loopback để kiểm tra local. Compose không cần Redis vì backend hiện không dùng Redis. `.env` là cấu hình local không commit.

Để dùng backend riêng ở `project-ojt/be`, đặt `DATABASE_DSN` theo MySQL chạy trên host (mặc định compose local dùng port `3306` ở repo BE riêng) và chạy `go run ./cmd/api`. Không chạy đồng thời hai backend trên cùng host port `8080`. FE Compose build backend từ repo FE; đồng bộ thay đổi backend riêng sang `fe/rikkei_ecommerce/backend` trước khi build/push FE repo.

### Cài dependency và kiểm tra

Go modules khai báo tại `go.mod`/`go.sum`; tải và kiểm tra bằng:

```powershell
go mod download
go test ./...
go vet ./...
go build ./cmd/api
````

Frontend dùng lockfile; cài đúng phiên bản bằng `npm ci`, sau đó `npm run lint` và `npm run build` tại `frontend/project-ecommerce`. Khi stack đang chạy, `./backend/scripts/smoke-api.ps1` kiểm tra health, register/login, refresh replay, RBAC và logout. Smoke script có thể tạo tài khoản thử trong DB local.

Các status FE thường cần xử lý: `400` dữ liệu không hợp lệ, `401` xác thực sai/hết hạn, `403` origin hoặc role bị từ chối, `409` email/phone đã được dùng, `415` Content-Type không đúng, `429` vượt rate limit, `503` DB chưa sẵn sàng. Body JSON tối đa 1 MiB; JSON lỗi, field lạ hoặc nhiều JSON value bị từ chối.
Frontend dùng lockfile; cài đúng phiên bản bằng `npm ci`, sau đó `npm run lint` và `npm run build` tại `frontend/project-ecommerce`. Khi stack đang chạy, `./backend/scripts/smoke-api.ps1` kiểm tra health, register/login, refresh replay, RBAC và logout. Smoke script có thể tạo tài khoản thử trong DB local.

Các status FE thường cần xử lý: `400` dữ liệu không hợp lệ, `401` xác thực sai/hết hạn, `403` origin hoặc role bị từ chối, `409` email/phone đã được dùng, `415` Content-Type không đúng, `429` vượt rate limit, `503` DB chưa sẵn sàng. Body JSON tối đa 1 MiB; JSON lỗi, field lạ hoặc nhiều JSON value bị từ chối.
