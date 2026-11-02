# Rikkei E-Commerce Backend

Backend REST API cho MVP Rikkei E-Commerce, viết bằng Go 1.24+, `net/http` và MySQL `database/sql`. Tài liệu này hướng dẫn DevOps chạy/vận hành BE và FE tích hợp các API **đang có**.

> BE hiện cung cấp auth/RBAC, catalog công khai, quản lý shop và duyệt shop, seller CRUD sản phẩm/biến thể/tồn kho ban đầu, sổ địa chỉ, theo dõi shop và một số API admin inventory. Giỏ hàng, voucher, checkout, thanh toán, đơn hàng và đánh giá vẫn chưa có API.

## Cấu trúc mã nguồn

Code được chia theo domain; từng package quản lý routes/handlers của domain đó. `internal/server` lắp các domain vào HTTP mux, `internal/httpx` chứa helper HTTP dùng chung, còn `internal/migrations` điều phối migration. `internal/auth` chỉ phụ trách đăng nhập, phiên/token, xác thực, phân quyền và bảo mật; shop, seller product, địa chỉ và catalog thuộc các package riêng.

```text
internal/
  address/     # Sổ địa chỉ và migration riêng
  auth/        # Xác thực, phiên, JWT/OTP, RBAC và security middleware
  catalog/     # Catalog, theo dõi shop và admin inventory
  httpx/       # Decode/response/validation HTTP dùng chung
  migrations/  # Điều phối migration theo domain
  seller/      # Seller product và variants
  server/      # Composition root đăng ký routes/middleware
  shop/        # Quản lý shop và duyệt shop
```

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
| `DATABASE_DSN` | Kết nối MySQL | Bắt buộc; schema phải tồn tại |
| `JWT_SECRET` | Ký JWT và HMAC OTP | Bắt buộc, tối thiểu 32 ký tự; production dùng secret ngẫu nhiên mạnh |
| `ACCESS_TOKEN_TTL` | Tuổi thọ access token | `15m`; 1 phút–1 giờ |
| `REFRESH_TOKEN_TTL` | Tuổi thọ refresh session | `168h` (7 ngày); tối thiểu 1 giờ |
| `OTP_TTL` | Tuổi thọ OTP | `10m`; 1–30 phút |
| `CORS_ALLOWED_ORIGINS` | Allowlist origin, phân cách dấu phẩy | Local `http://localhost:5173`; production chỉ origin HTTPS tường minh |
| `COOKIE_SECURE` | Chỉ gửi refresh cookie qua HTTPS | `false` local; production bắt buộc `true` |
| `AUTO_MIGRATE` | Áp dụng migration theo domain khi API khởi động | `true` development; production bắt buộc `false` |
| `SMTP_HOST`, `SMTP_PORT` | SMTP STARTTLS gửi OTP | Port mặc định `587`; production cần SMTP hoạt động |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP authentication nếu nhà cung cấp yêu cầu | Không commit credentials |
| `SMTP_FROM` | Email gửi OTP | Production bắt buộc email hợp lệ |

Không commit `.env`, DSN/password DB, SMTP credentials hoặc JWT secret. Dùng tài khoản DB có quyền tối thiểu; chỉ bước migration cần quyền DDL.

### Migration và production

`AUTO_MIGRATE=true` chạy migration của các domain khi API khởi động. Migration security nằm tại `internal/auth/migrations/001_security.sql`; migration address/shop bổ sung các cột/constraint cần thiết, và auth migration dọn refresh token/OTP hết hạn. Migration **không tạo database và không thay thế schema commerce** trong `database/scriptDb.sql`.

Production nên triển khai migration riêng bằng tài khoản có DDL, sau khi xác nhận schema và backup:

```powershell
$env:APP_ENV = "production"
$env:AUTO_MIGRATE = "false"
go run ./cmd/migrate
```

Chạy API production với `AUTO_MIGRATE=false`, HTTPS, `COOKIE_SECURE=true`, JWT secret riêng, CORS allowlist HTTPS chính xác và SMTP STARTTLS. Dùng reverse proxy/load balancer để kết thúc TLS và giới hạn truy cập mạng tới API/DB. Khi FE/API khác site, cần thiết kế cookie và CSRF protection phù hợp trước khi triển khai.

`GET /healthz` trả `200` khi API truy vấn được DB và `503` khi DB chưa sẵn sàng; đây là health check cơ bản, không thay thế monitoring/backup.

### Build và kiểm thử BE

Từ thư mục `backend`:

```powershell
go test ./...
go vet ./...
go build ./...
```

Smoke test tích hợp cần API đang chạy và database **local/test** đã được seed:

```powershell
$env:API_BASE_URL = 'http://localhost:18080' # đổi theo cổng host đang dùng
.\scripts\smoke-api.ps1
```

Smoke test tạo tài khoản ngẫu nhiên và kiểm tra catalog, tìm kiếm/filter, chi tiết sản phẩm/shop, follow/unfollow, auth, refresh replay, RBAC và password. Không trỏ script đến production/shared DB. OTP được ghi log chỉ ở development; không bật development mode với dữ liệu production.

Postman collection importable bao phủ các route BE hiện có, kèm local environment và hướng dẫn chạy bằng Collection Runner/Newman tại [`postman/`](../postman/README.md). Nạp lại seed trước mỗi lần chạy vì collection xóa mềm fixture kiểm thử inventory `960009`.

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
| `POST` | `/api/v1/shops` | CLIENT | Gửi hồ sơ mở shop; trạng thái ban đầu `PENDING` |
| `GET` | `/api/v1/me/shop` | Access token | Xem shop của tài khoản hiện tại |
| `PUT` | `/api/v1/me/shop` | Access token | Sửa hồ sơ shop của chủ shop |
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

BE có các route quản trị shop riêng được liệt kê ở bảng API phía trên (`approve`, `reject`, `lock`, `status`); chúng không thay thế ngữ nghĩa toggle-live, unlock, commission hoặc metrics của FE. Cart/checkout/payment/order cũng chưa nằm trong phạm vi BE hiện tại.

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

Không lưu access/refresh token trong `localStorage` hoặc `sessionStorage`. FE hiện có thể dùng `src/api/axiosClient.ts`, vốn giữ access token trong memory và tự deduplicate refresh request song song.

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

Các endpoint follow chỉ dành cho user role `CLIENT` đã đăng nhập:

- `GET /api/v1/shops/{id}/follow`: trả `following` và `follower_count`.
- `POST /api/v1/shops/{id}/follow`: theo dõi.
- `DELETE /api/v1/shops/{id}/follow`: bỏ theo dõi.

Gửi access token dạng Bearer. Gọi lặp là idempotent, follower count được cập nhật cùng transaction; user không thể theo dõi shop của chính mình. Seller/Admin không được dùng các route này.

### Mở và quản lý shop

- `POST /api/v1/shops` yêu cầu role `CLIENT`. Body gồm `name`, `description`, `logo_url`, `banner_url`, `phone`, `warehouse_address`; tên dài 2–150 ký tự, URL nếu có phải là HTTPS. Mỗi tài khoản và tên shop chỉ được dùng một lần.
- `GET /api/v1/me/shop` và `PUT /api/v1/me/shop` chỉ truy cập shop thuộc user hiện tại. Sửa hồ sơ đã bị từ chối sẽ gửi lại về trạng thái `PENDING`.
- `GET /api/v1/admin/shops` hỗ trợ `statusTab` (`all`, `pending`, `active`, `rejected`, `suspended`), `search`, `page`, `pageSize`; alias `status`/`limit` cũng được hỗ trợ. Các filter `category`, `commissionTier`, `rating` chỉ chấp nhận `all` vì schema hiện tại chưa lưu dữ liệu tương ứng.
- Admin duyệt qua `/approve` body `{ "notes": "..." }` (optional) hoặc `PATCH /status` body `{ "status": "ACTIVE", "notes": "..." }`; chỉ khi user còn `ACTIVE` mới duyệt được và role chuyển thành `SELLER`. Ghi chú duyệt được lưu; tài khoản `ADMIN` không bị hạ role. `/reject` nhận `{ "reason": "..." }`; `/lock` nhận `{ "reason": "..." }`. Lý do bắt buộc khi từ chối/khóa. API không có toggle-live độc lập, metrics hoặc hoa hồng.

### Seller products

Seller endpoints kiểm tra đồng thời role `SELLER`, trạng thái tài khoản, chủ sở hữu shop và shop `ACTIVE`; role đơn thuần không cho phép thao tác khi shop chưa duyệt/bị khóa.

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

- Protected API kiểm tra user status/role và trạng thái phiên trong DB; access JWT dùng HS256. Refresh token chỉ lưu dạng hash, xoay vòng và phát hiện replay.
- Rate limiter hiện nằm trong memory của một process; khi scale nhiều replica cần chuyển giới hạn sang gateway hoặc shared store.
- OTP delivery qua SMTP STARTTLS cần được kiểm thử trên môi trường tích hợp; không ghi OTP hoặc secret ra log ngoài development.
- Chưa có OAuth Google/Facebook, MFA, xác minh email/phone, quản lý thiết bị/session UI, cart/checkout/order/payment.
- Role `SELLER`/`ADMIN` phải được cấp bằng quy trình vận hành tin cậy; đăng ký public chỉ tạo `CLIENT`.
- Security migration không thay thế full commerce schema; migration hiện có bổ sung an toàn `addresses.address_type` và `shops.approval_notes` cho schema đã tồn tại. Kiểm tra schema/backup trước migration tại database đã có dữ liệu.

## 4. Cấu trúc BE

```text
cmd/api/                         Entry point HTTP và graceful shutdown
cmd/migrate/                     Chạy migration thủ công
internal/address/                Sổ địa chỉ và migration của domain
internal/auth/                   Auth/session, JWT, OTP, RBAC và security middleware
internal/auth/migrations/        Migration bảo mật được embed
internal/catalog/                Catalog, product/shop detail, follow, admin inventory
internal/httpx/                  JSON, response và validation dùng chung
internal/migrations/             Điều phối migration các domain
internal/seller/                 Seller products/variants
internal/server/                 Composition root đăng ký routes/middleware
internal/shop/                   Onboarding và quản trị shop
scripts/smoke-api.ps1             Smoke test API local
```

Mỗi domain tự đăng ký routes; `internal/server` lắp các domain vào HTTP mux, còn `internal/migrations` chạy migration theo thứ tự. `internal/auth` không sở hữu routes shop/seller/address. So với mẫu `proj-mau`, đây đã là cải thiện về ranh giới domain; tuy nhiên một số handler vẫn gộp xử lý HTTP, nghiệp vụ và SQL trong cùng file (đặc biệt auth/seller/shop). Khi domain tiếp tục mở rộng, nên tách các phần này thành handler/service/repository theo từng domain thay vì thêm logic vào handler lớn.

Catalog dùng MySQL parameterized queries, allowlist sort, giới hạn phân trang và validate query/body tại BE. Gửi thay đổi có kiểm thử liên quan và chạy `go test ./...`, `go vet ./...`, `go build ./...` trước khi merge.
