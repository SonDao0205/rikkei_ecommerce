# Rikkei E-Commerce Backend

Backend REST API cho MVP Rikkei E-Commerce, viết bằng Go 1.24+, `net/http` và MySQL `database/sql`. Tài liệu này hướng dẫn DevOps chạy/vận hành BE và FE tích hợp các API **đang có**.

> Backend implements auth/RBAC, catalog, shop management, seller products, addresses, cart, wishlist, categories, checkout creation with atomic inventory deduction & multi-shop splitting, and comprehensive order tracking/seller processing with return/refund workflows. Direct 3rd-party payment gateway callbacks (Momo/VNPAY) and automated AI shop integrations are planned for future phases.

## Cấu trúc mã nguồn

Code được chia thành ba vùng: `internal/domain` chứa nghiệp vụ, `internal/platform` chứa hạ tầng dùng chung, và `internal/app` lắp ứng dụng. Mỗi domain là một Go package và chia file theo layout/trách nhiệm như routes, handler, migration, model và test; các file cùng package vẫn dùng chung kiểu nội bộ để tránh export API chỉ phục vụ phân lớp. `internal/app/server` là composition root đăng ký routes/middleware; `internal/app/migrations` điều phối migration. Các helper HTTP, audit log và observability thuộc platform dùng chung. Domain auth riêng biệt với shop, seller product, địa chỉ, cart, wishlist và catalog.

```text
internal/
  app/
    migrations/ # Điều phối migration theo domain
    server/     # Composition root đăng ký routes/middleware
  domain/
    address/    # Sổ địa chỉ
    auth/       # Xác thực, phiên, JWT/OTP, RBAC và bảo mật
    cart/       # Giỏ hàng và biến thể
    checkout/   # Voucher validation and checkout quote
    catalog/    # Catalog công khai, danh mục và admin inventory
    seller/     # Seller product và variants
    shop/       # Mở shop và xét duyệt
    wishlist/   # Sản phẩm yêu thích
  platform/
    auditlog/       # Business audit trail
    httpx/          # Decode/response/validation HTTP
    observability/  # Structured log, request ID, recovery
```

Trong domain, routes/handlers và logic riêng domain nằm cạnh nhau theo package boundary của Go; chỉ đưa helper sang platform khi có nhiều domain dùng chung. Không tạo abstraction repository/service chỉ để đủ tên thư mục: tách lớp khi nghiệp vụ hoặc query có ranh giới ổn định và cần được kiểm thử/đổi độc lập.

Contract đầy đủ của catalog và inventory nằm tại [`docs/catalog-api.md`](../docs/catalog-api.md). Hướng dẫn Compose/seed local nằm tại [`docs/local-development.md`](../docs/local-development.md).

## 1. Hướng dẫn DevOps

### Yêu cầu và cổng

- Go 1.24+ nếu chạy BE trực tiếp trên máy.
- MySQL 8.x, schema `rikkei_ecommerce`.
- Compose root ở thư mục gốc `rikkei_ecommerce` có frontend, backend, MySQL, Redis và Cloudflare Tunnel tùy chọn. BE hiện không dùng Redis.
- BE lắng nghe `:8080` trong container; cổng host lấy từ `BACKEND_HOST_PORT` (mặc định `8080`, máy local có thể dùng `18080`).
- FE mặc định ở `http://localhost:5173`; MySQL bind loopback ở `localhost:3307`.

### Chạy local bằng Compose

Từ thư mục gốc `rikkei_ecommerce`:

```powershell
Copy-Item .env.example .env   # chỉ khi chưa có .env
# Đặt các mật khẩu local và JWT_SECRET riêng trong .env.
docker compose up --build -d
docker compose ps
Invoke-WebRequest http://localhost:5173/healthz
```

Compose nạp schema qua `database/scriptDb.sql` khi khởi tạo database rỗng. **Không chạy lại file này trên database đã có dữ liệu**: script có `DROP DATABASE IF EXISTS`. Để nạp fixtures local có thể chạy lại an toàn:

```powershell
.\database\seed-local.ps1
```

Seed chỉ dành cho local; các tài khoản và mật khẩu mẫu được ghi trong [`docs/local-development.md`](../docs/local-development.md). Không chạy seed ở staging/production hoặc database dùng chung.

### Chạy BE trực tiếp

Từ thư mục `rikkei_ecommerce/backend`:

```powershell
Copy-Item .env.example .env   # cấu hình DATABASE_DSN và JWT_SECRET trước
go run ./cmd/api
```

Nếu MySQL chạy trong Compose nhưng BE chạy trên host, DSN cần dùng host port `3307`, ví dụ:

```text
app:local-password@tcp(127.0.0.1:3307)/rikkei_ecommerce?parseTime=true&loc=UTC&charset=utf8mb4&collation=utf8mb4_unicode_ci
```

Không chạy hai backend cùng bind một host port. API gốc mặc định `http://localhost:8080`; nếu Compose được cấu hình `BACKEND_HOST_PORT=18080`, gọi trực tiếp `http://localhost:18080`. FE trong Compose đi qua Nginx same-origin ở `http://localhost:5173`, proxy `/api/` và `/healthz` đến BE.

### Cấu hình môi trường

`cmd/api` và `cmd/migrate` đọc `.env` tại **working directory hiện tại**; biến môi trường của hệ thống được ưu tiên.

| Biến | Mục đích | Mặc định / yêu cầu |
|---|---|---|
| `APP_ENV` | Chế độ chạy | `development`; production đặt `production` |
| `HTTP_ADDR` | Địa chỉ listen | `:8080` |
| `LOG_LEVEL` | Mức operational log | `info`; nhận `debug`, `info`, `warn`, `error` |
| `DATABASE_DSN` | Kết nối MySQL | Bắt buộc; schema phải tồn tại |
| `JWT_SECRET` | Ký JWT và HMAC OTP | Bắt buộc, tối thiểu 32 ký tự; production dùng secret ngẫu nhiên mạnh |
| `ACCESS_TOKEN_TTL` | Tuổi thọ access token | `15m`; 1 phút–1 giờ |
| `REFRESH_TOKEN_TTL` | Tuổi thọ refresh session | `168h` (7 ngày); tối thiểu 1 giờ |
| `OTP_TTL` | Tuổi thọ OTP | `10m`; 1–30 phút |
| `CORS_ALLOWED_ORIGINS` | Allowlist origin, phân cách dấu phẩy | Local `http://localhost:5173`; production chỉ origin HTTPS tường minh |
| `TRUSTED_PROXY_CIDRS` | CIDR của reverse proxy được phép cung cấp `X-Real-IP` | Compose local mặc định `172.22.0.3/32`; thay bằng đúng IP/CIDR proxy thực tế |
| `COOKIE_SECURE` | Chỉ gửi refresh cookie qua HTTPS | `false` local; production bắt buộc `true` |
| `AUTO_MIGRATE` | Áp dụng migration theo domain khi API khởi động | `true` development; production bắt buộc `false` |
| `SMTP_HOST`, `SMTP_PORT` | SMTP STARTTLS gửi OTP | Port mặc định `587`; production cần SMTP hoạt động |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP authentication nếu nhà cung cấp yêu cầu | Không commit credentials |
| `SMTP_FROM` | Email gửi OTP | Production bắt buộc email hợp lệ |

Không commit `.env`, DSN/password DB, SMTP credentials hoặc JWT secret. Dùng tài khoản DB có quyền tối thiểu; chỉ bước migration cần quyền DDL.

### Migration và production

`AUTO_MIGRATE=true` chạy migration của các domain khi API khởi động. Migration security nằm tại `internal/domain/auth/migrations/001_security.sql`; migration address/shop bổ sung các cột/constraint cần thiết, và auth migration dọn refresh token/OTP hết hạn. Migration **không tạo database và không thay thế schema commerce** trong `database/scriptDb.sql`.

Production nên triển khai migration riêng bằng tài khoản có DDL, sau khi xác nhận schema và backup:

```powershell
$env:APP_ENV = "production"
$env:AUTO_MIGRATE = "false"
go run ./cmd/migrate
```

Chạy API production với `AUTO_MIGRATE=false`, HTTPS, `COOKIE_SECURE=true`, JWT secret riêng, CORS allowlist HTTPS chính xác và SMTP STARTTLS. Nếu API nằm sau reverse proxy, khai báo `TRUSTED_PROXY_CIDRS` chỉ cho IP/CIDR của proxy thực tế; API chỉ tin `X-Real-IP` khi TCP peer thuộc danh sách này, các header forwarded từ client trực tiếp bị bỏ qua. Với Docker local, Compose mặc định dùng `172.22.0.3/32`; kiểm tra IP frontend bằng `docker inspect` sau khi tạo stack và cập nhật `.env` nếu khác. Không dùng CIDR rộng hơn mạng proxy cần thiết. Dùng reverse proxy/load balancer để kết thúc TLS và giới hạn truy cập mạng tới API/DB. Khi FE/API khác site, cần thiết kế cookie và CSRF protection phù hợp trước khi triển khai.

`GET /healthz` trả `200` khi API truy vấn được DB và `503` khi DB chưa sẵn sàng; đây là health check cơ bản, không thay thế monitoring/backup.

### Logging và audit trail

Backend dùng structured logging qua `log/slog`: `development` ghi text, `production` ghi JSON; log đi ra stdout để Docker/runtime thu thập và quản lý retention. Xem log local bằng `docker compose logs -f --since=10m backend`. Mỗi HTTP request nhận `X-Request-ID` do backend tạo và trả lại trong response; access log chứa request ID, method, path (không gồm query string), status, thời lượng và user ID nếu đã xác thực. Dùng `X-Request-ID` để ghép response với log. Body, Authorization, cookie, query string và dữ liệu nhạy cảm không được ghi trong access log. Panic được ghi cùng stack trace và trả lỗi 500 chung, không lộ chi tiết nội bộ cho client.

`audit_logs` là business audit trail bền vững, khác với operational log. Hiện các thao tác tạo/nộp hồ sơ shop, admin đổi trạng thái shop, admin quản lý trạng thái danh mục, seller tạo/cập nhật/xóa sản phẩm và admin moderation sản phẩm được ghi cùng transaction với thay đổi nghiệp vụ; nếu ghi audit lỗi, transaction rollback. Event lưu actor, action, entity, trạng thái cũ/mới và request ID, không lưu token hay body nguyên bản. Có thể truy vấn gần đây bằng SQL:

```sql
SELECT created_at, user_id, action, entity_type, entity_id, request_id, old_value, new_value
FROM audit_logs
ORDER BY id DESC
LIMIT 100;
```

Migration thêm cột request ID cho database hiện hữu; chạy `go run ./cmd/migrate` theo quy trình production trước khi phát hành code mới. Chưa có màn hình/API admin tra cứu audit trail; hiện việc truy vấn dành cho vận hành database có quyền phù hợp.

### Build và kiểm thử BE

Từ thư mục `backend`:

```powershell
gofmt -l .
go test ./...
go vet ./...
go build ./cmd/api
```

`gofmt -l .` phải không in ra file nào; format file vừa sửa bằng `gofmt -w <file.go>`. Đây cũng là lệnh format gate đầu tiên của backend CI, nên lỗi tại bước này khiến unit tests/vet/build trên GitHub chưa được chạy.

Smoke test tích hợp cần API đang chạy và database **local/test** đã được seed:

```powershell
$env:API_BASE_URL = 'http://localhost:18080' # đổi theo cổng host đang dùng
.\scripts\smoke-api.ps1
```

Smoke test tạo tài khoản ngẫu nhiên và kiểm tra catalog, tìm kiếm/filter, chi tiết sản phẩm/shop, follow/unfollow, auth, refresh replay, RBAC và password. Không trỏ script đến production/shared DB. OTP được ghi log chỉ ở development; không bật development mode với dữ liệu production.

Postman collection importable kiểm thử các luồng API chính (không kiểm thử đầy đủ mọi route/nhánh), kèm local environment và hướng dẫn chạy bằng Collection Runner/Newman tại [`postman/`](../postman/README.md). Collection kiểm tra contract `status_counts` và input lỗi của admin shop; các thao tác ghi/xóa và fixture bị ảnh hưởng được liệt kê trong hướng dẫn Postman. Chỉ chạy trên database local/test riêng.

## 2. Hướng dẫn FE tích hợp API

### Base URL, request và response

- Qua FE/Compose, dùng same-origin `http://localhost:5173`; URL API vẫn bắt đầu bằng `/api/v1`.
- Gọi trực tiếp backend local: `http://localhost:8080` hoặc `http://localhost:18080` tùy `BACKEND_HOST_PORT`.
- Request có JSON body phải gửi `Content-Type: application/json`.
- Thành công dùng envelope `{ "success": true, "data": ... }`; lỗi có HTTP status và dạng `{ "success": false, "message": "...", "errors": [{ "code": "...", "message": "..." }] }`.
- Với cross-origin, origin phải nằm trong `CORS_ALLOWED_ORIGINS`; refresh cookie cần gửi credentials.
- FE có thể ẩn/hiện UI theo role để cải thiện trải nghiệm, nhưng **quyền luôn do BE kiểm tra**.

### API hiện có

| Method | Endpoint | Xác thực | Công dụng |
|---|---|---|---|
| `GET` | `/healthz` | Không | Health check DB |
| `POST` | `/api/v1/auth/register` | Không | Đăng ký tài khoản CLIENT |
| `POST` | `/api/v1/auth/login` | Không | Email/phone và password; cấp access token, đặt refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Refresh cookie | Xoay refresh token và cấp access token |
| `POST` | `/api/v1/auth/logout` | Access token | Thu hồi phiên hiện tại |
| `GET` | `/api/v1/auth/me` | Access token | Hồ sơ tài khoản hiện tại |
| `PUT` | `/api/v1/auth/profile` | Access token | Cập nhật tên và phone |
| `PUT` | `/api/v1/auth/password` | Access token | Đổi password, thu hồi refresh session |
| `POST` | `/api/v1/auth/forgot-password` | Không | Yêu cầu OTP qua email |
| `POST` | `/api/v1/auth/verify-reset-otp` | Không | Xác thực OTP |
| `POST` | `/api/v1/auth/reset-password` | OTP | Đặt password mới, thu hồi session |
| `GET` | `/api/v1/admin/users` | ADMIN | Danh sách tối đa 100 user |
| `GET` | `/api/v1/categories` | Không | Danh mục đang hoạt động |
| `GET` | `/api/v1/categories/{id}/attributes` | Không | Thuộc tính biến thể, bắt buộc/tùy chọn và các giá trị của danh mục |
| `PUT` | `/api/v1/admin/categories/{id}/attributes` | ADMIN | Thay thế cấu hình thuộc tính biến thể danh mục |
| `GET` | `/api/v1/products` | Không | Danh sách/tìm kiếm/lọc/sắp xếp sản phẩm |
| `GET` | `/api/v1/products/{id}` | Không | Chi tiết sản phẩm, ảnh, biến thể và shop công khai |
| `GET` | `/api/v1/shops/{id}` | Không | Hồ sơ shop đang hoạt động |
| `GET` | `/api/v1/shops/{id}/products` | Không | Sản phẩm công khai của shop |
| `GET` | `/api/v1/shops/{id}/follow` | CLIENT | Trạng thái follow của user hiện tại |
| `POST` | `/api/v1/shops` | CLIENT | Alias tương thích; tạo hồ sơ shop `DRAFT` |
| `POST` | `/api/v1/me/shop` | CLIENT | Tạo bản nháp shop `DRAFT` |
| `GET` | `/api/v1/me/shop` | CLIENT | Xem shop của tài khoản hiện tại |
| `PUT` | `/api/v1/me/shop` | CLIENT | Sửa hồ sơ shop của chủ shop; không tự gửi duyệt |
| `POST` | `/api/v1/me/shop/submit` | CLIENT | Gửi bản nháp/yêu cầu bổ sung để xét duyệt |
| `GET` | `/api/v1/admin/shops` | ADMIN | Lọc/danh sách shop |
| `PATCH` | `/api/v1/admin/shops/{id}/status` | ADMIN | Duyệt/từ chối/khóa shop |
| `PATCH` | `/api/v1/admin/shops/{id}/approve` | ADMIN | Duyệt shop, cấp role SELLER |
| `PATCH` | `/api/v1/admin/shops/{id}/reject` | ADMIN | Từ chối shop |
| `PATCH` | `/api/v1/admin/shops/{id}/lock` | ADMIN | Chuyển shop sang SUSPENDED |
| `GET` | `/api/v1/seller/products` | SELLER | Danh sách sản phẩm của shop ACTIVE |
| `POST` | `/api/v1/seller/products` | SELLER | Tạo sản phẩm, ảnh, SKU/biến thể và tồn kho |
| `GET` | `/api/v1/seller/products/{id}` | SELLER | Xem sản phẩm do shop sở hữu |
| `PUT` | `/api/v1/seller/products/{id}` | SELLER | Cập nhật và gửi lại sản phẩm để duyệt |
| `DELETE` | `/api/v1/seller/products/{id}` | SELLER | Xóa mềm sản phẩm, vô hiệu hóa biến thể |
| `GET` | `/api/v1/addresses` | Access token | Danh sách địa chỉ của tài khoản |
| `POST` | `/api/v1/addresses` | Access token | Thêm địa chỉ |
| `PUT` | `/api/v1/addresses/{id}` | Access token | Sửa địa chỉ thuộc tài khoản |
| `DELETE` | `/api/v1/addresses/{id}` | Access token | Xóa địa chỉ thuộc tài khoản |
| `PATCH` | `/api/v1/addresses/{id}/default` | Access token | Đặt địa chỉ mặc định |
| `GET` | `/api/v1/cart` | CLIENT | Đọc giỏ hàng của tài khoản hiện tại |
| `POST` | `/api/v1/cart/items` | CLIENT | Thêm biến thể; nếu đã có thì cộng số lượng |
| `PUT` | `/api/v1/cart/items/{id}` | CLIENT | Đặt số lượng tuyệt đối cho item |
| `DELETE` | `/api/v1/cart/items/{id}` | CLIENT | Xóa item thuộc giỏ của tài khoản hiện tại |
| `DELETE` | `/api/v1/cart/items` | CLIENT | Xóa toàn bộ item trong giỏ hiện tại |
| `GET` | `/api/v1/wishlist` | CLIENT | Danh sách sản phẩm yêu thích của tài khoản hiện tại |
| `POST` | `/api/v1/wishlist/products/{id}` | CLIENT | Thêm sản phẩm công khai vào wishlist (idempotent) |
| `DELETE` | `/api/v1/wishlist/products/{id}` | CLIENT | Bỏ sản phẩm khỏi wishlist |
| `POST` | `/api/v1/shops/{id}/follow` | CLIENT | Theo dõi shop |
| `DELETE` | `/api/v1/shops/{id}/follow` | CLIENT | Bỏ theo dõi shop |
| `GET` | `/api/v1/admin/products` | ADMIN | Danh sách/tìm kiếm/lọc/sort inventory |
| `GET` | `/api/v1/admin/inventory-stats` | ADMIN | Thống kê inventory |
| `PATCH` | `/api/v1/admin/products/{id}/status` | ADMIN | Bật/tắt sản phẩm đã duyệt |
| `DELETE` | `/api/v1/admin/products/{id}` | ADMIN | Xóa mềm sản phẩm |
| `POST` | `/api/v1/admin/products/bulk` | ADMIN | Activate/deactivate/delete tối đa 100 ID |

### Những route FE đang gọi nhưng BE chưa triển khai

FE hiện có API client cho dashboard/admin shop/order nhưng BE chưa có các endpoint dưới đây. Các module FE bắt lỗi và trả dữ liệu mock khi request thất bại, nên UI hiển thị được không đồng nghĩa dữ liệu đã được lưu ở BE. Không coi những phần này là tích hợp hoàn chỉnh cho tới khi BE có contract/API tương ứng và bỏ fallback mock trong môi trường tích hợp:

| Nhóm | Endpoint FE đang gọi nhưng BE chưa có |
|---|---|
| Admin dashboard | `GET /api/v1/admin/dashboard`, `GET /api/v1/admin/dashboard/export` |
| Admin shops | `GET /api/v1/admin/shops/metrics`, `PATCH /api/v1/admin/shops/{id}/toggle-live`, `PATCH /api/v1/admin/shops/{id}/unlock`, `PATCH /api/v1/admin/shops/{id}/commission`, `GET /api/v1/admin/shops/export` |
| Admin orders | `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/counts`, `GET /api/v1/admin/orders/{id}`, `PATCH /api/v1/admin/orders/{id}/confirm`, `PATCH /api/v1/admin/orders/{id}/cancel`, `PATCH /api/v1/admin/orders/{id}/courier`, `POST /api/v1/admin/orders/bulk-confirm`, `GET /api/v1/admin/orders/export` |

Cart and wishlist APIs are available. Voucher validation, delivery/payment options, checkout quote, and order creation/inventory deduction APIs are implemented.

API path/query phải theo đúng tên và giới hạn dưới đây. Contract catalog/admin inventory và ví dụ response đầy đủ: [`docs/catalog-api.md`](../docs/catalog-api.md).

### Auth: đăng ký và đăng nhập

`POST /api/v1/auth/register` nhận:

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "full_name": "Nguyen Van A",
  "phone": "+84901234567"
}
```

Email được chuẩn hóa chữ thường; email và phone duy nhất. Phone có 9–15 chữ số, tùy chọn dấu `+`. Password dài 10–72 byte, phải có ít nhất một chữ cái và một chữ số. Public registration luôn tạo role `CLIENT`; không nhận role từ client.

`POST /api/v1/auth/login`:

```json
{ "identifier": "customer@example.com", "password": "SecurePass123" }
```

`identifier` có thể là email hoặc phone. Response trả `data.user`, `data.access_token`, `data.token_type` (`Bearer`) và `data.expires_in` (giây). Refresh token được đặt trong cookie `HttpOnly`, không trả trong JSON.

Giữ access token trong memory và gắn vào protected requests:

```http
Authorization: Bearer <access_token>
```

Không lưu access/refresh token trong `localStorage` hoặc `sessionStorage`. FE dùng `src/shared/api/axiosClient.ts`, vốn giữ access token trong memory và tự deduplicate refresh request song song.

### Refresh, logout và khôi phục phiên

Gửi `POST /api/v1/auth/refresh` không body, với cookie credentials:

```js
await axios.post("/api/v1/auth/refresh", undefined, {
  withCredentials: true,
});
```

Refresh cookie có `HttpOnly`, path `/api/v1/auth/refresh`, `SameSite=Strict`, `Secure` theo cấu hình. Refresh token được xoay vòng; dùng lại token cũ sẽ thu hồi phiên. Nếu refresh trả `401`, xóa access token trong memory và yêu cầu đăng nhập lại.

`POST /api/v1/auth/logout` cần access token; BE thu hồi phiên hiện tại và xóa refresh cookie. Sau thành công, FE xóa access token và trạng thái user ở client. Lúc khởi động lại ứng dụng, FE có thể gọi refresh để khôi phục phiên từ cookie.

### Hồ sơ và password

`GET /api/v1/auth/me` trả hồ sơ user hiện tại. Cập nhật bằng `PUT /api/v1/auth/profile`:

```json
{ "full_name": "Nguyen Van A", "phone": "+84901234567" }
```

Đổi password bằng `PUT /api/v1/auth/password`:

```json
{
  "current_password": "SecurePass123",
  "new_password": "NewSecurePass456",
  "confirm_password": "NewSecurePass456"
}
```

BE xác minh password hiện tại, yêu cầu password mới hợp lệ và khác password cũ, rồi thu hồi refresh sessions. FE nên yêu cầu đăng nhập lại sau khi đổi.

### Quên password và OTP

1. `POST /api/v1/auth/forgot-password` với `{ "identifier": "email-or-phone" }`. Response luôn chung để không tiết lộ tài khoản tồn tại; OTP gửi đến email của tài khoản. Development ghi OTP vào BE log.
2. `POST /api/v1/auth/verify-reset-otp` với `{ "identifier": "email-or-phone", "otp": "123456" }`. OTP gồm đúng 6 chữ số.
3. `POST /api/v1/auth/reset-password` với `{ "identifier": "email-or-phone", "otp": "123456", "new_password": "NewSecurePass456" }`. Field `email` cũ được hỗ trợ thay cho `identifier` để tương thích client cũ.

OTP mặc định hết hạn sau 10 phút, tối đa 5 lần nhập sai và giới hạn gửi lại 60 giây. Endpoint reset luôn xác minh OTP trong transaction; kết quả verify trước đó không thay thế lần xác minh này. Đặt lại password thu hồi mọi refresh session.

### Catalog: tìm kiếm, lọc và phân trang

`GET /api/v1/products` hỗ trợ:

| Query | Mô tả |
|---|---|
| `q` | Tìm theo token trong tên sản phẩm; tối đa 100 ký tự. Kết quả xếp theo tỷ lệ token khớp tên từ cao xuống thấp; alias `search` được hỗ trợ. |
| `category_id` | `0` hoặc không gửi để lấy mọi danh mục; ID không âm |
| `brand_id`, `shop_id` | ID dương |
| `min_price`, `max_price` | Giá không âm; min không được lớn hơn max |
| `min_rating` | Từ 0 đến 5 |
| `sort` | `latest` (mặc định), `best_selling`, `price_asc`, `price_desc` |
| `page` | Mặc định 1; từ 1 đến 100000 |
| `limit` | Mặc định 100; tối đa 100 |

Ví dụ:

```text
GET /api/v1/products?q=iphone+pro+max&category_id=930005&page=1&limit=20
```

Search tách từ khóa và dùng FULLTEXT prefix matching trên tên sản phẩm; vì vậy query `iphone pro max` tìm được `Apple iPhone 15 Pro Max 256GB` dù có thêm từ `15` ở giữa. Sản phẩm khớp nhiều token hơn được xếp trước; các kết quả bằng mức khớp được sắp theo `sort`. Từ ngắn có xử lý riêng; khi FULLTEXT không có sản phẩm phù hợp, fallback tìm token trong tên/mô tả/shop.

Response `data` gồm `products`, `total`, `page`, `limit`. Chỉ trả sản phẩm active, chưa xóa, thuộc shop active và danh mục active. Các query parameter lạ/lặp, sort không hỗ trợ, query lỗi định dạng hoặc filter ngoài giới hạn trả `400`.

`GET /api/v1/products/{id}` chỉ hiển thị sản phẩm công khai. `data` gồm `product`, `images`, `variants`, `shop`; tối đa 100 ảnh và 100 biến thể active. Mỗi biến thể gồm SKU, giá, tồn kho và danh sách thuộc tính. Sản phẩm chưa duyệt/ẩn/đã xóa hoặc shop/danh mục không active trả `404`. Hồ sơ công khai không bao gồm địa chỉ kho, chủ shop hoặc lý do từ chối.

`GET /api/v1/shops/{id}` lấy hồ sơ shop active. `GET /api/v1/shops/{id}/products` lấy danh sách sản phẩm shop và hỗ trợ các filter/sort/page/limit của catalog.

### Theo dõi shop

Các endpoint follow yêu cầu tài khoản đã đăng nhập có role `CLIENT`. Mọi tài khoản thường có role `CLIENT`; seller vẫn giữ role này nên vừa có thể bán vừa theo dõi shop khác.

- `GET /api/v1/shops/{id}/follow`: trả `following` và `follower_count`.
- `POST /api/v1/shops/{id}/follow`: theo dõi.
- `DELETE /api/v1/shops/{id}/follow`: bỏ theo dõi.

Gửi access token dạng Bearer. Gọi lặp là idempotent, follower count được cập nhật cùng transaction; user không thể theo dõi shop của chính mình.

### Quản lý danh mục (ADMIN)

Danh sách công khai `GET /api/v1/categories` chỉ trả danh mục đang hoạt động. Chỉ role `ADMIN` được dùng các API quản trị sau; chúng bao gồm cả danh mục inactive để admin có thể chỉnh sửa hoặc kích hoạt lại:

| Method | Endpoint | Tác dụng |
|---|---|---|
| `GET` | `/api/v1/admin/categories` | Liệt kê toàn bộ danh mục (admin lọc/tìm kiếm trên danh sách) |
| `POST` | `/api/v1/admin/categories` | Tạo danh mục |
| `PUT` | `/api/v1/admin/categories/{id}` | Cập nhật tên, slug, ảnh, thứ tự, parent và trạng thái |
| `PATCH` | `/api/v1/admin/categories/{id}/status` | Đổi `is_active` (`true`/`false`) |
| `DELETE` | `/api/v1/admin/categories/{id}` | Soft-delete bằng cách chuyển inactive; không xóa lịch sử liên kết sản phẩm |

Body tạo/cập nhật dùng `name` (2–120 ký tự), `slug` (chữ thường ASCII, số, dấu gạch nối; `all` dành riêng), `image_url` (HTTPS hoặc rỗng), `sort_order` (0–100000), `parent_id` (ID dương hoặc `null`) và `is_active` (boolean). Slug duy nhất; trùng slug trả `409 category_slug_in_use`. Parent phải tồn tại, không thể là chính danh mục hoặc hậu duệ; không thể kích hoạt danh mục bên dưới một ancestor inactive. Danh mục có con active không thể bị chuyển inactive cho đến khi các con được chuyển inactive trước. DELETE có thể gọi lặp an toàn. Không có hard-delete API.

Trang quản trị nằm tại `/admin/categories`, yêu cầu đăng nhập ADMIN. Seller/buyer không có route quản trị; backend tiếp tục chặn truy cập kể cả khi gọi API trực tiếp.

### Mở và quản lý shop

Điểm vào `/register-open-shop` không yêu cầu đăng nhập: khách mới có thể tạo tài khoản (API đăng ký chỉ cấp `CLIENT`) rồi tiếp tục khai báo shop. Người đã có `CLIENT` đăng nhập để tiếp tục hồ sơ; ràng buộc duy nhất theo chủ tài khoản ngăn tạo shop thứ hai. FE tải `GET /api/v1/me/shop` trước khi hiện form và yêu cầu thử lại nếu không lấy được trạng thái.
- Một tài khoản có thể giữ đồng thời `CLIENT` và `SELLER`. API đăng ký public chỉ tạo `CLIENT`; không nhận role từ body. `GET /api/v1/auth/me`, login và refresh trả trường `roles` dạng mảng, `shop_status` nếu có shop, đồng thời giữ `role` dạng chuỗi để tương thích client cũ.
- `POST /api/v1/me/shop` (và alias `POST /api/v1/shops`) tạo bản nháp `DRAFT`; body gồm `name`, `description`, `logo_url`, `banner_url`, `phone`, `warehouse_address`. Tên dài 2–150 ký tự, URL nếu có phải là HTTPS. Mỗi tài khoản và tên shop chỉ được dùng một lần.
- `PUT /api/v1/me/shop` chỉ cập nhật shop thuộc user hiện tại và không tự gửi duyệt. Bản nháp, hồ sơ bị từ chối/yêu cầu bổ sung và hồ sơ đang xét duyệt có thể chỉnh sửa; `POST /api/v1/me/shop/submit` chuyển `DRAFT`, `NEEDS_INFO` hoặc `REJECTED` về `PENDING`. Body nộp gồm `agreements` với `version: "seller-onboarding-v1"` và ba cờ `service_policy`, `authenticity`, `anti_counterfeit` đều phải là `true`. Backend lưu phiên bản, thời điểm, IP và User-Agent để audit; nộp lại khi hồ sơ `PENDING` là idempotent.
- Luồng admin: `PENDING → ACTIVE`, `PENDING → NEEDS_INFO/REJECTED`, `ACTIVE → SUSPENDED`; shop `SUSPENDED` có thể được khôi phục sang `ACTIVE`. Mỗi thao tác kiểm tra chuyển trạng thái và tài khoản chủ shop; duyệt shop cùng cấp `SELLER` trong một transaction. Từ chối/đình chỉ không xóa `CLIENT`.
- `GET /api/v1/admin/shops` hỗ trợ `statusTab` (`all`, `draft`, `pending`, `needs_info`, `active`, `rejected`, `suspended`), `search`, `page`, `pageSize`; alias `status`/`limit` cũng được hỗ trợ. Các filter `category`, `commissionTier`, `rating` chỉ chấp nhận `all` vì schema hiện tại chưa lưu dữ liệu tương ứng.
- Response có `data.shops`, `data.total`, `data.page`, `data.pageSize`, `data.limit` và `data.status_counts`. `total` là số shop khớp bộ lọc/tìm kiếm hiện tại; `status_counts` luôn đếm toàn bộ shop theo các trạng thái `DRAFT`, `PENDING`, `NEEDS_INFO`, `ACTIVE`, `REJECTED`, `SUSPENDED`, không phụ thuộc tab hay tìm kiếm. FE nên dùng `status_counts` cho tab/thống kê và xử lý đủ sáu trạng thái để shop ở trạng thái nháp hoặc cần bổ sung không làm hỏng toàn bộ danh sách.
- Admin duyệt qua `/approve` body `{ "notes": "..." }` (optional) hoặc `PATCH /status` body `{ "status": "ACTIVE", "notes": "..." }`; chỉ khi user còn `ACTIVE` và có `CLIENT` mới duyệt được. Role `SELLER` được thêm, không thay thế `CLIENT`/`ADMIN`. `/reject` nhận `{ "reason": "..." }`; `/lock` nhận `{ "reason": "..." }`; lý do bắt buộc khi từ chối/đình chỉ. API không có toggle-live độc lập, metrics hoặc hoa hồng.

### Seller products

Seller endpoints kiểm tra đồng thời role `SELLER`, trạng thái tài khoản, chủ sở hữu shop và shop `ACTIVE`; role đơn thuần không cho phép thao tác khi shop chưa duyệt/bị khóa. Shop bị đình chỉ vẫn giữ `CLIENT` và `SELLER`, nên người dùng tiếp tục mua sắm nhưng không thể dùng Seller API.

`POST /api/v1/seller/products` và `PUT /api/v1/seller/products/{id}` nhận cùng cấu trúc:

```json
{
  "name": "Phone Model",
  "description": "Product description",
  "category_id": 930001,
  "brand_id": 940001,
  "price": 199.99,
  "images": [
    { "url": "https://cdn.example.test/product.png", "is_primary": true }
  ],
  "variants": [
    {
      "sku": "PHONE-BLACK-128",
      "name": "Black / 128GB",
      "price": 199.99,
      "stock": 10,
      "image_url": "https://cdn.example.test/black.png",
      "attribute_value_ids": [1, 2]
    }
  ]
}
```

Mỗi sản phẩm cần 1–10 ảnh và 1–50 biến thể; mỗi biến thể có SKU duy nhất, giá tối đa hai chữ số thập phân, tồn kho không âm và tối đa 10 attribute value IDs. Danh mục/brand phải đang hoạt động. Giá trị biến thể phải thuộc thuộc tính được cấu hình cho danh mục; mỗi biến thể phải có đủ thuộc tính bắt buộc, chỉ chọn tối đa một value cho mỗi attribute, và mọi biến thể của cùng sản phẩm phải dùng cùng tập attribute với tổ hợp value duy nhất. Danh mục chưa cấu hình thuộc tính vẫn hỗ trợ sản phẩm không có attribute IDs. Lỗi validation trả `400` với các mã như `invalid_category_variant_attribute`, `missing_required_variant_attribute`, `duplicate_variant_attribute`, `inconsistent_variant_attributes`, `duplicate_variant_combination`.

FE tải cấu hình trước khi dựng form qua `GET /api/v1/categories/{id}/attributes`; response có `category_id` và `attributes[]` với `id`, `name`, `required`, `values[]` (`id`, `value`). ADMIN thay toàn bộ cấu hình bằng `PUT /api/v1/admin/categories/{id}/attributes`, body ví dụ:

```json
{
  "attributes": [
    { "attribute_id": 950001, "required": true, "sort_order": 1 },
    { "attribute_id": 950002, "required": true, "sort_order": 2 },
    { "attribute_id": 950005, "required": false, "sort_order": 3 }
  ]
}
```

Mỗi danh mục tối đa 10 thuộc tính; ID không được trùng, mọi attribute phải tồn tại và có ít nhất một value. Cấu hình áp dụng trực tiếp cho category ID, không tự kế thừa từ danh mục cha. Không thể gỡ attribute đang được biến thể sản phẩm hiện hữu dùng hoặc đặt thuộc tính bắt buộc nếu biến thể active hiện tại chưa có value tương ứng. Thay đổi cấu hình và seller ghi sản phẩm khóa cùng hàng danh mục, tránh seller ghi dựa trên cấu hình cũ. Seed local minh họa áo khoác cần màu/kích cỡ và máy tính cần CPU/RAM, dung lượng là tùy chọn.

Ảnh chỉ nhận URL HTTPS. Tạo/sửa sản phẩm đặt trạng thái `PENDING`; chỉnh tồn kho thêm `stock_movements` trong cùng transaction. Khi sửa biến thể hiện có, gửi `id` để giữ nguyên liên kết đơn hàng; biến thể bị bỏ sẽ chuyển `INACTIVE`. Xóa sản phẩm là soft-delete và disable biến thể, không xóa cứng dữ liệu đơn hàng.

Danh sách hỗ trợ `page`, `limit` (tối đa 100) và `status`. Response list có `products`, `total`, `page`, `limit`; chi tiết/tạo/sửa trả `data` là product kèm `images` và `variants`.

### Sổ địa chỉ

`GET /api/v1/addresses` trả mảng địa chỉ của user hiện tại. Create/update nhận `recipient_name`, `phone`, `province`, `district`, `ward`, `street_detail`, `address_type` (`HOME`, `OFFICE`, `OTHER`) và `is_default` (`true`/`false` hoặc `1`/`0` để tương thích FE). `address_type` mặc định `HOME`; tối đa 20 địa chỉ mỗi tài khoản. Tạo/cập nhật/xóa/đổi mặc định khóa hàng user và thực hiện trong transaction để tránh hai địa chỉ mặc định đồng thời. Nếu xóa/bỏ mặc định hiện tại, địa chỉ còn lại đầu tiên được chọn; nếu không còn địa chỉ thì không có default.

### Giỏ hàng và wishlist

Cart và wishlist yêu cầu đăng nhập với role `CLIENT`; seller vẫn giữ `CLIENT` nên cũng dùng được. Mọi truy vấn ghi đều giới hạn theo user lấy từ access token, không nhận `user_id` từ request.

- `GET /api/v1/cart` trả `items`, `line_count`, `item_count`, `available_item_count` và `subtotal`. Cart rỗng trả mảng `items` rỗng và các số đếm/tổng bằng 0.
- `POST /api/v1/cart/items` nhận `{ "variant_id": 961001, "quantity": 2 }`. Thêm mới trả `201`; thêm lại cùng biến thể cộng dồn và trả `200`. Biến thể phải active, sản phẩm chưa xóa và đang active, shop/category cũng active. Số lượng phải dương và tổng không được vượt tồn kho; lỗi tồn kho trả `409 insufficient_stock`.
- `PUT /api/v1/cart/items/{id}` nhận `{ "quantity": 2 }` và thay số lượng tuyệt đối (không cộng dồn). Biến thể không được đổi qua endpoint này; nếu sản phẩm không còn mua được hoặc số lượng vượt tồn kho, BE trả lỗi thay vì ghi dữ liệu sai. `DELETE /api/v1/cart/items/{id}` xóa đúng item thuộc cart của user; `DELETE /api/v1/cart/items` xóa cả giỏ. Cart được khóa theo user trong transaction để tuần tự hóa thao tác ghi cùng một cart.
- GET cart vẫn trả các item đã hết hàng/ngừng bán để người dùng nhận biết và tự xóa; mỗi item có `is_available` và `available_stock`. Chỉ item khả dụng được cộng vào subtotal. Số tiền dòng được nhân ở `DECIMAL(30,2)` để bao phủ mức giá schema và số lượng tồn kho kiểu `INT`.
- `GET /api/v1/wishlist` trả `items` và `total`, cùng trạng thái khả dụng/tồn kho hiện tại. Có thể lưu sản phẩm hết hàng; chỉ sản phẩm public (cùng shop/category active, chưa soft-delete) mới được thêm. `POST` lặp là idempotent; `DELETE` lặp vẫn thành công. Wishlist không khóa biến thể vì được lưu theo sản phẩm.
- Cart and wishlist APIs are implemented. Checkout quote APIs are documented below; they calculate current pricing but do not create orders. Postman covers authorization and invalid-request cases.

### Admin inventory

Các route `/api/v1/admin/*` yêu cầu role `ADMIN`; thiếu/hết hạn phiên trả `401`, role không đủ trả `403`.

- `GET /api/v1/admin/products`: filter `search`, `category`, `vendor`, `stock_status` (`in_stock`, `low_stock`, `out_of_stock`), sort `sort_by` (`newest`, `stock_asc`, `stock_desc`, `price_desc`). Hiện endpoint trả toàn bộ kết quả phù hợp, chưa có pagination.
- `GET /api/v1/admin/inventory-stats`: thống kê SKU/sản phẩm/tồn kho.
- `PATCH /api/v1/admin/products/{id}/status`: body `{ "is_active": true }`; chỉ sản phẩm đã duyệt ở trạng thái `ACTIVE`/`HIDDEN` mới được toggle.
- `DELETE /api/v1/admin/products/{id}`: xóa mềm.
- `POST /api/v1/admin/products/bulk`: body `{ "action": "deactivate", "product_ids": [960001, 960002] }`; action là `activate`, `deactivate`, `delete`; từ 1 đến 100 ID dương. ID trùng được tính một lần.

Body JSON bị giới hạn kích thước, field lạ, JSON sai/nhiều JSON values và content type khác `application/json` bị từ chối.

### Lỗi và phản hồi FE

| HTTP | Ý nghĩa thường gặp | Hành vi FE khuyến nghị |
|---|---|---|
| `400` | JSON/query/input không hợp lệ | Báo lỗi field/query; không lặp request nguyên trạng |
| `401` | Thiếu/sai/hết hạn access token hoặc phiên | Thử refresh một lần; nếu thất bại thì xóa phiên |
| `403` | Origin không được phép hoặc role không đủ | Báo không có quyền; không retry tự động |
| `404` | Tài nguyên không tồn tại/không công khai | Hiển thị not found |
| `409` | Tài khoản trùng, trạng thái không cho phép, follow shop của mình | Hiển thị xung đột và yêu cầu tải lại nếu phù hợp |
| `415` | Body không gửi `application/json` | Sửa request header |
| `429` | Rate limit | Tôn trọng `Retry-After`, chờ trước khi thử lại |
| `500`/`503` | Lỗi BE hoặc DB chưa sẵn sàng | Báo lỗi chung, không hiển thị chi tiết nội bộ |

## 3. Bảo mật và giới hạn hiện tại

- Protected API kiểm tra user status, tất cả role đang gán và trạng thái phiên trong DB; access JWT dùng HS256. Refresh token chỉ lưu dạng hash, xoay vòng và phát hiện replay.
- Rate limiter hiện nằm trong memory của một process; khi scale nhiều replica cần chuyển giới hạn sang gateway hoặc shared store.
- OTP delivery qua SMTP STARTTLS cần được kiểm thử trên môi trường tích hợp; không ghi OTP hoặc secret ra log ngoài development.
- OAuth Google/Facebook, MFA, email/phone verification, device/session UI, order creation, and payment processing are not implemented.
- Role `SELLER` được cấp khi admin duyệt shop; `ADMIN` chỉ cấp qua quy trình quản trị tin cậy. Migration `002_multi_role.sql` tạo `roles`/`user_roles` và backfill các role hiện có, luôn bổ sung `CLIENT` mà không xóa role legacy.
- Migration không xóa cột `users.role` trong giai đoạn tương thích; authorization sử dụng `user_roles`. Cột legacy được giữ để các client cũ không bị gãy.
- Security migration không thay thế full commerce schema; migration domain bổ sung role assignments, trạng thái shop `DRAFT`/`NEEDS_INFO`, `addresses.address_type` và `shops.approval_notes`. Kiểm tra schema/backup trước migration tại database đã có dữ liệu.

## 4. Cấu trúc BE

```text
cmd/                         Entry points api và migrate
internal/
  app/                        Composition root và migration orchestration
  domain/                     auth, address, catalog, shop, seller, cart, wishlist
    auth/                     routes, session/security/profile handlers, tokens, migrations
    catalog/                  public catalog, filters, admin category/inventory handlers
    shop/                     routes, onboarding/admin handlers, repository, validation, migrations
    seller/                   routes, product handlers, model, repository, validation
  platform/                   auditlog, httpx, observability dùng chung
scripts/                      Smoke test API local
```

Mỗi domain tự đăng ký routes; `internal/app/server` lắp các domain vào HTTP mux, còn `internal/app/migrations` chạy migration theo thứ tự. `internal/domain/auth` không sở hữu routes shop/seller/address. Seller và shop được tách handler, model, repository, validation, route và transport helper thành file trong cùng package. Các domain nhỏ tiếp tục dùng ít file hơn để tránh tạo lớp/thư mục rỗng chỉ vì quy ước.

Catalog dùng MySQL parameterized queries, allowlist sort, giới hạn phân trang và validate query/body tại BE. Gửi thay đổi có kiểm thử liên quan và chạy `go test ./...`, `go vet ./...`, `go build ./...` trước khi merge.


## Voucher validation and checkout quote

The checkout domain exposes these CLIENT-authenticated APIs:

- `GET /api/v1/checkout/options` returns active shipping and payment methods from the database.
- `POST /api/v1/vouchers/validate` checks a voucher against selected cart lines, scope/shop, active period, minimum subtotal, global usage limit, and per-user usage limit. Body: `{"code":"SEED-WELCOME","scope":"PLATFORM","cart_item_ids":[123]}`; shop vouchers also require `shop_id`.
- `POST /api/v1/checkout/quote` accepts `address_id`, `shipping_method_id`, `payment_method_id`, `cart_item_ids`, optional `platform_voucher`, and optional `shop_vouchers` keyed by shop ID. It re-reads current prices, stock and product availability, verifies address ownership and active methods, then returns the line items and total.

Shipping `base_fee` is currently charged once per checkout quote, including multi-shop carts, in line with the order-level `orders.shipping_fee` field. Shop vouchers apply only to selected lines from their shop. The platform discount is applied after shop discounts, and combined discounts cannot exceed the merchandise subtotal. Amounts use the schema precision of two decimal places.

Payment method `MOCK_CARD` is intentionally excluded from customer checkout because it is a local test fixture without a payment gateway. The quote endpoint uses integer cents internally and rejects totals beyond `DECIMAL(15,2)` capacity.

Successful response data includes `address`, `shipping_method`, `payment_method`, selected `items`, `subtotal`, `shipping_fee`, `shop_vouchers`, `shop_discount`, `platform_voucher`, `platform_discount`, and `total`. Invalid input returns `400`; unauthenticated or wrong-role callers return `401`/`403`; stale addresses/methods/cart items or invalid vouchers return `422`; database failures return a generic `500` while details are logged server-side. Common error codes include `address_unavailable`, `shipping_method_unavailable`, `payment_method_unavailable`, `cart_item_unavailable`, `cart_selection_changed`, `voucher_invalid`, `voucher_unavailable`, `voucher_minimum_not_met`, `voucher_shop_mismatch`, and `cart_total_exceeded`.

A quote is advisory: it does not create an order, reserve stock, or consume a voucher. The order-creation endpoint `POST /api/v1/checkout/orders` executes inside a single database transaction, atomically locking and updating stock and voucher usage, creating parent and sub-orders per shop, recording payment, and clearing purchased cart items.

Example quote body:

```json
{
  "address_id": 12,
  "shipping_method_id": 980001,
  "payment_method_id": 980101,
  "cart_item_ids": [45, 46],
  "platform_voucher": "SEED-WELCOME",
  "shop_vouchers": {"920001": "SEED-MAY10"}
}
```

### Order creation: `POST /api/v1/checkout/orders`

Tạo đơn hàng từ giỏ hàng được bảo vệ bởi role `CLIENT`, thực thi toàn bộ trong một transaction cơ sở dữ liệu duy nhất:

- **Input:**
  - `address_id` (ID địa chỉ nhận hàng của chính người dùng).
  - `shipping_method_id` (phương thức vận chuyển đang hoạt động).
  - `payment_method_id` (`COD` hoặc `BANK_TRANSFER`; phương thức `MOCK_CARD` bị từ chối).
  - `cart_item_ids` (mảng 1–100 ID dòng giỏ hàng thuộc về người dùng, không trùng lặp).
  - `platform_voucher` (tùy chọn: mã voucher toàn sàn).
  - `shop_vouchers` (tùy chọn: map mã voucher theo shop ID `{"920001": "SEED-MAY10"}`).
  - `note` (tùy chọn: tối đa 500 ký tự).
- **Cơ chế chống bán vượt tồn kho (Oversell Prevention) và chống Deadlock:**
  1. Tập hợp tất cả `variant_id` liên quan và sắp xếp tăng dần theo ID trước khi khóa hàng (`ORDER BY v.id ASC FOR UPDATE`) để tránh deadlock khi nhiều người mua đồng thời.
  2. Kiểm tra trạng thái khả dụng và số lượng tồn kho `v.stock >= requested_quantity`.
  3. Trừ tồn kho nguyên tử bằng câu lệnh SQL `UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`. Nếu không có dòng nào bị ảnh hưởng (`RowsAffected == 0`), transaction tự động rollback ngay lập tức và trả về `422 cart_item_unavailable`.
  4. Ràng buộc toàn vẹn MySQL `CONSTRAINT chk_variants_stock CHECK (stock >= 0)` bảo vệ tuyệt đối ở tầng engine.
- **Tách đơn theo Shop (Multi-Shop Splitting):**
  - Tạo 1 đơn hàng cha trong bảng `orders` (tính tổng tiền hàng, phí vận chuyển chung, voucher sàn, voucher shop, tổng thanh toán).
  - Tạo $N$ đơn hàng con trong bảng `shop_orders` theo từng shop:
    - Trạng thái khởi tạo: `PENDING`.
    - Phân bổ tỷ lệ phí ship và voucher sàn theo giá trị đơn của từng shop, đảm bảo tổng các đơn con khớp chính xác 100% với đơn cha.
    - Snapshot tỷ lệ hoa hồng (`commission_rate = 0`, `commission_amount = 0`).
  - Lưu chi tiết sản phẩm vào `order_items` gắn với từng `shop_orders`.
  - Ghi log lịch sử trạng thái ban đầu vào `order_status_history` (`PENDING`).
- **Thanh toán COD & Chuyển khoản (Bank Transfer):**
  - Khởi tạo bản ghi trong bảng `payments` với trạng thái `PENDING`.
  - Phương thức `COD`: `transaction_ref = "COD-" + order_code`.
  - Phương thức `BANK_TRANSFER`: `transaction_ref = order_code` (được dùng làm nội dung chuyển khoản để đối soát).
- **Voucher & Giỏ hàng:**
  - Khóa voucher `FOR UPDATE`, kiểm tra hạn dùng, điều kiện tối thiểu và giới hạn `usage_limit`, `usage_per_user`.
  - Tăng số lượt dùng nguyên tử `used_count = used_count + 1`.
  - Lưu lịch sử dùng vào `voucher_usages`.
  - Xóa chính xác các sản phẩm đã mua khỏi bảng `cart_items`.
- **Response `201 Created`:** Trả về thông tin đầy đủ đơn hàng cha, phương thức thanh toán, hướng dẫn thanh toán `payment`, và danh sách các đơn con `shop_orders`.

## Checkout implementation and team follow-up

Before validating a successful quote locally, start the API and seed a disposable local/test database (`database/seed.local.sql`). The seed includes `STANDARD`/`EXPRESS`, `COD`/`BANK_TRANSFER`, `SEED-WELCOME` (platform), and `SEED-MAY10` (shop 920001). Use a CLIENT access token, an address owned by that account, and cart item IDs returned by that same account's `GET /api/v1/cart`; do not substitute IDs from another user. `MOCK_CARD` is intentionally omitted from returned payment choices.

Manual/API QA matrix:

- Quote one available item with no voucher and compare the price, selected shipping `base_fee` (charged once), and total.
- Apply a valid platform voucher and a valid shop voucher; confirm the shop code only applies to its own selected shop and combined discounts do not exceed merchandise subtotal.
- Try unknown, wrong-scope, wrong-shop, expired, exhausted, per-user-used, minimum-not-met vouchers; each must fail without changing cart, inventory, or voucher usage.
- Try another user's address/cart ID, duplicate/non-positive IDs, an unavailable product/variant/category/shop, insufficient stock, and inactive or `MOCK_CARD` methods. These must fail with a client error and no mutation.
- Change the price after loading the cart, then quote again; the returned amount must use the new DB price. Deactivate the product/method or reduce stock below cart quantity; the quote must return a client error instead of trusting FE state.

The Postman collection verifies auth, option response shapes, order checkout, order tracking, and seller order management.

---

## 5. Theo dõi và xử lý đơn hàng (Order Tracking and Seller Processing)

Hệ thống cung cấp đầy đủ các API phục vụ luồng theo dõi đơn hàng của Khách hàng (`CLIENT`) và luồng xử lý đơn hàng của Chủ gian hàng (`SELLER`):

### 5.1. Dành cho Khách hàng (`CLIENT`)

1. **Lịch sử đơn hàng (`GET /api/v1/orders`):**
   - Hỗ trợ phân trang: `page` (mặc định 1), `limit` (mặc định 10, tối đa 50).
   - Lọc theo trạng thái/tab: `tab` (`all`, `pending`, `confirmed`, `packing`, `shipping`, `completed`, `cancelled`, `returned`).
   - Tìm kiếm theo mã đơn hàng: `search`.
   - Trả về danh sách đơn cha, chi tiết các đơn con theo shop (`shop_orders`), danh sách sản phẩm, trạng thái thanh toán, và tổng số lượng đơn hàng theo từng tab trạng thái (`counts`) để FE hiển thị badge trực quan.

2. **Chi tiết đơn hàng (`GET /api/v1/orders/{id}`):**
   - Hỗ trợ tra cứu theo ID (`id`) hoặc Mã đơn hàng (`order_code`).
   - Kiểm tra chặt chẽ quyền sở hữu (`user_id = auth.CurrentUser.ID`).
   - Trả về đầy đủ: thông tin người nhận, địa chỉ giao hàng, chi tiết tài chính (tiền hàng, phí ship, voucher sàn/shop), thông tin thanh toán (`payments`), lịch sử timeline trạng thái chi tiết theo thời gian từ `order_status_history`, và thông tin hoàn tiền (`refund_info`) nếu có.

3. **Hủy đơn hàng (`POST /api/v1/orders/{id}/cancel`):**
   - Body: `{"reason": "Lý do hủy đơn", "shop_order_id": 123 (tùy chọn nếu hủy đơn shop cụ thể)}`.
   - **Quy tắc trạng thái:** Khách chỉ được hủy khi đơn ở trạng thái `PENDING` hoặc `CONFIRMED`. Nếu đơn đã chuyển sang `PACKING`, `SHIPPING`, `COMPLETED` hoặc `RETURNED`, hệ thống trả về lỗi `422 order_cannot_be_cancelled` để tránh hủy khi hàng đã gửi đi.
   - **Bảo toàn tồn kho:** Hoàn trả số lượng tồn kho nguyên tử (`product_variants.stock += quantity`) và giảm số lượng đã bán (`products.sold_count = GREATEST(sold_count - quantity, 0)`) trong cùng 1 transaction DB.
   - **Chính sách hoàn tiền:**
     - Đơn thanh toán khi nhận hàng (`COD`): Không phát sinh hoàn tiền (`refund_status: "NOT_APPLICABLE"`). Thông báo: *"Đơn hàng thanh toán khi nhận hàng (COD) đã được hủy thành công. Không phát sinh hoàn tiền."*
     - Đơn thanh toán chuyển khoản / QR / đã thanh toán (`payments.status = 'PAID'` hoặc phương thức online): Tự động cập nhật `payments.status = 'REFUNDED'`, thiết lập `refund_status: "REFUND_PROCESSING"`. Thông báo: *"Đã hủy đơn hàng thành công. Yêu cầu hoàn tiền đã được ghi nhận và tiền sẽ được hoàn lại vào tài khoản của quý khách trong vòng 3 ngày làm việc."*

4. **Xác nhận nhận hàng thành công (`POST /api/v1/orders/{id}/received`):**
   - Cho phép khách hàng chủ động xác nhận đã nhận được kiện hàng khi đơn đang ở trạng thái `SHIPPING`.
   - Chuyển trạng thái đơn con sang `COMPLETED`, ghi log lịch sử `order_status_history`, và tự động cập nhật thanh toán COD sang `PAID`.

5. **Yêu cầu đổi/trả/hoàn tiền (`POST /api/v1/orders/{id}/returns`):**
   - Body: `{"shop_order_id": 123, "type": "RETURN", "reason": "Lý do đổi trả...", "refund_amount": 500000}`.
   - **Điều kiện:** Đơn con phải ở trạng thái `COMPLETED` (đã nhận hàng thành công). Chặn tạo trùng lặp nếu đang có yêu cầu chờ xử lý.
   - Lưu vào bảng `return_requests` với trạng thái `REQUESTED` để chờ chủ shop tiếp nhận và giải quyết.

---

### 5.2. Dành cho Chủ gian hàng (`SELLER`)

1. **Nguyên tắc cô lập dữ liệu tuyệt đối:**
   - Hệ thống xác định `shop_id` của chủ gian hàng đang đăng nhập từ token `SELLER`.
   - **Mọi truy vấn và cập nhật đều bị khóa chặt bởi điều kiện `WHERE shop_id = current_seller_shop_id`**. Chủ shop hoàn toàn không thể xem hoặc sửa đổi đơn của shop khác.

2. **Danh sách đơn hàng của Shop (`GET /api/v1/seller/orders`):**
   - Lọc theo `status`, tìm kiếm theo mã đơn, tên/sđt khách hàng hoặc mã vận đơn `tracking_code`.
   - Tự động tính toán số tiền thực nhận của gian hàng: `seller_payout = total_amount - commission_amount`.
   - Trả về danh sách đơn con kèm `counts` theo từng tab.

3. **Chi tiết đơn hàng gian hàng (`GET /api/v1/seller/orders/{id}`):**
   - Hiển thị đầy đủ thông tin khách hàng, sản phẩm, doanh thu/hoa hồng, thông tin giao vận và lịch sử timeline trạng thái.

4. **Cập nhật tiến trình đơn hàng tuần tự:**
   - `PATCH /api/v1/seller/orders/{id}/confirm`: Chuyển `PENDING` $\to$ `CONFIRMED`.
   - `PATCH /api/v1/seller/orders/{id}/pack`: Chuyển `CONFIRMED` $\to$ `PACKING`.
   - `PATCH /api/v1/seller/orders/{id}/ship`: Chuyển `PACKING` $\to$ `SHIPPING`. Yêu cầu body `carrier` (đơn vị vận chuyển) và `tracking_code` (mã vận đơn).
   - `PATCH /api/v1/seller/orders/{id}/complete`: Chuyển `SHIPPING` $\to$ `COMPLETED` (giao thành công). Cập nhật thanh toán COD thành `PAID`.
   - `PATCH /api/v1/seller/orders/{id}/cancel`: Chủ shop hủy đơn khi hết hàng. Tự động hoàn lại tồn kho cho shop và xử lý hoàn tiền online nếu có.

5. **Xử lý yêu cầu đổi trả (`return_requests`):**
   - `GET /api/v1/seller/returns`: Danh sách các yêu cầu đổi trả từ khách hàng đối với sản phẩm của shop.
   - `PATCH /api/v1/seller/returns/{id}/approve`: Chủ shop chấp thuận yêu cầu đổi trả. Hệ thống tự động chuyển đơn sang `RETURNED`, hoàn lại tồn kho cho biến thể sản phẩm, cập nhật hoàn tiền và thông báo hoàn tiền trong 3 ngày làm việc.
   - `PATCH /api/v1/seller/returns/{id}/reject`: Chủ shop từ chối yêu cầu đổi trả kèm lý do giải thích cho khách hàng (bắt buộc nhập `note`).

## Order workflow: customer and seller

The database keeps the operational states `PENDING`, `CONFIRMED`, `PACKING`, `SHIPPING`, `COMPLETED`, `CANCELLED`, and `RETURNED`. The API does not rewrite a persisted status just to fit a screen tab.

- Customer list `GET /api/v1/orders?tab=packing` groups `CONFIRMED` and `PACKING` as the customer-facing "shop is processing" tab. `counts.preparing` mirrors this grouped count; `counts.packing` is retained for compatibility. Individual order/detail records still expose their actual status.
- Seller list `GET /api/v1/seller/orders?status=PREPARING` groups `CONFIRMED` and `PACKING`, and `counts.preparing` is their sum. Exact filters such as `CONFIRMED` and `PACKING` still select one state.
- Seller filters also accept `payment_method`, `courier`, and `date_range=all|today|7days|30days`. Invalid values are rejected with HTTP 400.
- Seller workflow is strictly `PENDING -> CONFIRMED -> PACKING -> SHIPPING -> COMPLETED`. Confirm, pack, ship, complete, and cancel handlers validate state in a transaction and scope the order to the authenticated seller's shop. `ship` requires non-empty `carrier` and `tracking_code`.
- Seller bulk confirm: `POST /api/v1/seller/orders/bulk-confirm`, JSON `{ "shop_order_ids": [123, 124] }`. The request accepts 1–50 distinct positive IDs. All orders must belong to the seller and be `PENDING`; otherwise the transaction makes no changes. IDs are locked in sorted order to reduce deadlock risk.

The customer and seller order pages use the live APIs. The UI retains the raw status as `workflowStatus` while mapping `CONFIRMED` and `PACKING` to the shared preparation tab. From `CONFIRMED`, the seller starts packing; from `PACKING`, the seller enters carrier/tracking details and hands the parcel to shipping. Dashboard order actions use the same API transitions. Dashboard analytics outside its urgent-order list are still mock data.

Run `go test ./...`, `go vet ./...`, and from `frontend/project-ecommerce`, `npm run lint` and `npm run build`. For database-backed verification, start the local MySQL service and API, then use the Postman "Order Tracking and Seller Processing" folder with disposable buyer/seller fixtures. Do not reuse live orders for state-changing requests.

## Media uploads (Cloudinary)

Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the local environment. For Docker Compose, set them in the repository-root `.env`; for running the Go API directly, set them in `backend/.env`. Templates are in both `.env.example` files. The API secret must stay in the backend environment and must never use a `VITE_` prefix. `.env` files are ignored by Git. The upload API returns `503 media_storage_unavailable` when these settings are missing; production startup requires them.

`POST /api/v1/media` accepts authenticated `multipart/form-data` fields `purpose` and `file`. Supported purposes are `avatar`, `shop-image`, `product-image`, and `product-video`. Image requests accept only `.jpg`/`.jpeg` files whose bytes decode as JPEG, up to 5 MiB. PNG, WebP, GIF, SVG, renamed non-JPEG files, and larger images are rejected. Product videos accept MP4/MOV/WebM up to 20 MiB. The handler checks file extension and content signature, caps the HTTP body, limits concurrent Cloudinary transfers, and sends only validated files to Cloudinary. Each account is limited to 30 upload requests per minute per backend instance; excess requests return `429 upload_rate_limited` and `Retry-After: 60`. Image purposes are available to CLIENT/SELLER roles; product media requires SELLER. The Cloudinary secret and signature are never sent to the browser.

Success returns HTTP 201 with `data.url`, `data.public_id`, `data.resource_type`, `data.format`, and `data.bytes`. Common errors include `400 invalid_multipart_upload`, `400 invalid_upload_purpose`, `403 upload_forbidden`, `413 file_size_exceeded`, `415 unsupported_media_type`, `502 media_storage_failed`, and `503 media_storage_unavailable`.

Avatar workflow: upload media, then save the returned URL using `PUT /api/v1/auth/profile/avatar` with `{ "avatar_url": "https://res.cloudinary.com/..." }`. `DELETE /api/v1/auth/profile/avatar` removes the stored avatar. `GET /api/v1/auth/me` and profile responses now include `avatar_url`. The upload itself does not update the user's profile until the URL save call succeeds.

Product create/update accepts optional `video_url` in addition to the existing `images` array. The seller migration adds `products.video_url` idempotently; the public product-detail response returns that URL so the storefront can play the video. Ensure the migration is run before deploying with `AUTO_MIGRATE=false` (`go run ./cmd/migrate` from `backend`). Existing product image URLs remain in `product_images` and continue to be validated by the seller API.

The FE uses JPEG-only file pickers and validates type/size before sending; the backend repeats validation and is authoritative. Uploads run independently of React route components and show progress/status in the global upload panel, so in-app navigation does not abort a transfer. Reloading or closing the browser still ends an in-flight browser request; start that upload again if it did not complete.

## Admin APIs and scope

All `/api/v1/admin/*` endpoints require a valid access token and the `ADMIN` role; authorization is enforced in route middleware, not by the UI.

- Users: `GET /api/v1/admin/users` lists up to 100 newest accounts with roles and shop status; `GET /api/v1/admin/users/{id}` returns one record. `POST /api/v1/admin/users` creates a CLIENT account using `full_name`, `email`, `phone`, `password` and optional `roles`/`status`; passwords follow the normal 10+ character policy. `PUT /api/v1/admin/users/{id}` edits profile, roles and status. `PATCH /api/v1/admin/users/{id}/status` accepts `{ "status": "LOCKED", "reason": "..." }` or `{ "status": "ACTIVE" }`. Locking revokes refresh sessions, saves the reason, suspends any active shop owned by the account and writes audit events. Unlocking does not automatically reactivate the shop; an admin must review and explicitly reactivate it. Admin accounts/current admin cannot be edited or locked. ADMIN role assignment is intentionally prohibited through this CRUD; SELLER is granted by shop approval and must remain paired with an active shop. A reset-password admin endpoint is not exposed; users use the account recovery flow.
- Shop review: `GET /api/v1/admin/shops`, `PATCH /api/v1/admin/shops/{id}/approve`, `/reject`, `/lock`, and `/status` provide review and lifecycle management. Approval adds the `SELLER` role transactionally.
- Product moderation and inventory: `GET /api/v1/admin/products`, `PATCH /api/v1/admin/products/{id}/status`, `DELETE /api/v1/admin/products/{id}`, `POST /api/v1/admin/products/bulk`, and inventory statistics are available. Approve a pending product with `{ "status": "ACTIVE" }`; reject one with `{ "status": "REJECTED", "reason": "..." }`; toggle an approved product with `{ "is_active": false }` or `{ "status": "HIDDEN" }`. Approval is rejected if the owner/shop or category is inactive. A rejected product must be resubmitted by its seller before another review. Product status changes are audited.
- Categories: `/api/v1/admin/categories` supports list/create/update/status/deactivate; `PUT /api/v1/admin/categories/{id}/attributes` atomically configures category variant attributes and rejects changes that would invalidate existing products.
- Brands: `GET/POST /api/v1/admin/brands`, `PUT /api/v1/admin/brands/{id}`, and `PATCH /api/v1/admin/brands/{id}/status` provide administration; public active brands are available at `GET /api/v1/brands`.
- Attributes: `GET/POST /api/v1/admin/attributes`, `PUT /api/v1/admin/attributes/{id}`, `POST /api/v1/admin/attributes/{id}/values`, `DELETE /api/v1/admin/attributes/{id}/values/{valueId}`, and `DELETE /api/v1/admin/attributes/{id}` are available. Deleting values/attributes used by product variants returns `409` rather than breaking variant data.
- Orders: `GET /api/v1/admin/orders?status=PENDING&search=...&page=1&limit=20` provides a paginated global view; status filters match shop orders in that lifecycle state. `GET /api/v1/admin/orders/{id-or-order-code}` returns parent order, child shop orders/items and buyer details. Admin APIs are read-only by design: order state is advanced by the buyer/seller workflows, preserving stock restoration, payment and audit invariants.

Database-backed admin integration tests should use disposable data and an ADMIN fixture. Unit tests cover admin validation and state filters; ensure `go test ./...` and `go vet ./...` pass before merging.
