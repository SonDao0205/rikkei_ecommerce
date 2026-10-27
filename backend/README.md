# Rikkei E-Commerce Backend

Backend Go cho MVP Rikkei E-Commerce. Hiá»‡n repository cung cáº¥p API xÃ¡c thá»±c vÃ  ná»n táº£ng phÃ¢n quyá»n. API sáº£n pháº©m, shop, giá» hÃ ng vÃ  Ä‘Æ¡n hÃ ng chÆ°a Ä‘Æ°á»£c triá»ƒn khai.

TÃ i liá»‡u chia thÃ nh hai pháº§n: **DevOps** chuáº©n bá»‹ cáº¥u hÃ¬nh, triá»ƒn khai vÃ  váº­n hÃ nh backend; **FE** tÃ­ch há»£p cÃ¡c API hiá»‡n cÃ³.

## 1. HÆ°á»›ng dáº«n DevOps

### ThÃ nh pháº§n vÃ  yÃªu cáº§u

- Go 1.24 trá»Ÿ lÃªn.
- MySQL 8.x. Database/schema `rikkei_ecommerce` pháº£i Ä‘Æ°á»£c táº¡o trÆ°á»›c khi cháº¡y migration.
- The root `docker-compose.yml` starts the frontend, backend, MySQL, Redis, and optional Cloudflare tunnel services.
- Backend máº·c Ä‘á»‹nh láº¯ng nghe `:8080`; cÃ³ thá»ƒ Ä‘á»•i báº±ng `HTTP_ADDR`.

### Cháº¡y local

Tá»« thÆ° má»¥c `project-ojt`, sao chÃ©p `.env.example` thÃ nh `.env`, Ä‘iá»n DSN vÃ  JWT secret riÃªng, sau Ä‘Ã³ cháº¡y backend:

```powershell
Copy-Item .env.example .env
docker compose up -d mysql
go run ./cmd/api
```

Náº¿u Ä‘Ã£ cÃ i MySQL trá»±c tiáº¿p trÃªn mÃ¡y, chá»‰ cáº§n táº¡o schema, cáº¥u hÃ¬nh `DATABASE_DSN` tÆ°Æ¡ng á»©ng vÃ  bá» qua lá»‡nh Docker. á»ž development, `AUTO_MIGRATE=true` sáº½ Ã¡p dá»¥ng migration khi API khá»Ÿi Ä‘á»™ng. Migration bá»• sung báº£ng auth/security vÃ  index, tÃ¡i sá»­ dá»¥ng `refresh_tokens`, dá»n token/OTP cÅ©; migration khÃ´ng táº¡o database vÃ  khÃ´ng táº¡o cÃ¡c báº£ng nghiá»‡p vá»¥ commerce.

### Cáº¥u hÃ¬nh mÃ´i trÆ°á»ng

`cmd/api` vÃ  `cmd/migrate` Ä‘á»c `.env` tá»« thÆ° má»¥c lÃ m viá»‡c hiá»‡n táº¡i; biáº¿n mÃ´i trÆ°á»ng cá»§a há»‡ thá»‘ng Ä‘Æ°á»£c Æ°u tiÃªn hÆ¡n `.env`.

| Biáº¿n                       | Má»¥c Ä‘Ã­ch                                         | Máº·c Ä‘á»‹nh / yÃªu cáº§u                                                             |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `APP_ENV`                    | Cháº¿ Ä‘á»™ cháº¡y                                   | `development`; production dÃ¹ng `production`                                           |
| `HTTP_ADDR`                  | Äá»‹a chá»‰ HTTP                                     | `:8080`                                                                                |
| `DATABASE_DSN`               | Káº¿t ná»‘i MySQL                                    | Báº¯t buá»™c; schema pháº£i tá»“n táº¡i                                                |
| `JWT_SECRET`                 | KÃ½ JWT vÃ  HMAC OTP                                 | Báº¯t buá»™c, tá»‘i thiá»ƒu 32 kÃ½ tá»±; dÃ¹ng secret ngáº«u nhiÃªn riÃªng             |
| `ACCESS_TOKEN_TTL`           | Tuá»•i thá» access token                             | `15m`; cho phÃ©p 1 phÃºt Ä‘áº¿n 1 giá»                                                 |
| `REFRESH_TOKEN_TTL`          | Tuá»•i thá» phiÃªn refresh                           | `168h` (7 ngÃ y); tá»‘i thiá»ƒu 1 giá»                                                 |
| `OTP_TTL`                    | Tuá»•i thá» mÃ£ OTP                                  | `10m`; cho phÃ©p 1â€“30 phÃºt                                                          |
| `CORS_ALLOWED_ORIGINS`       | Allowlist origin FE, phÃ¢n cÃ¡ch báº±ng dáº¥u pháº©y | Local máº«u: `http://localhost:5173`; production chá»‰ dÃ¹ng origin HTTPS tÆ°á»ng minh |
| `COOKIE_SECURE`              | Chá»‰ gá»­i cookie qua HTTPS                         | `false` local; báº¯t buá»™c `true` production                                          |
| `AUTO_MIGRATE`               | Tá»± Ã¡p dá»¥ng migration khi API cháº¡y             | `true` development; production báº¯t buá»™c `false`                                    |
| `SMTP_HOST`, `SMTP_PORT`     | MÃ¡y chá»§ gá»­i OTP qua STARTTLS                    | Host do há»‡ thá»‘ng mail cung cáº¥p; port máº·c Ä‘á»‹nh `587`                         |
| `SMTP_USER`, `SMTP_PASSWORD` | XÃ¡c thá»±c SMTP náº¿u nhÃ  cung cáº¥p yÃªu cáº§u    | Cáº¥u hÃ¬nh theo nhÃ  cung cáº¥p; khÃ´ng commit secret                                 |
| `SMTP_FROM`                  | Äá»‹a chá»‰ gá»­i OTP                                | Báº¯t buá»™c trong production, pháº£i lÃ  email há»£p lá»‡                             |

KhÃ´ng Ä‘Æ°a `.env`, DSN/password database, SMTP credential hay JWT secret vÃ o Git, image Docker, log hoáº·c tÃ i liá»‡u dÃ¹ng chung. Cáº¥p quyá»n DB tá»‘i thiá»ƒu cáº§n thiáº¿t cho API; chá»‰ tÃ i khoáº£n cháº¡y migration cáº§n quyá»n DDL.

### Build, migration vÃ  khá»Ÿi cháº¡y production

```powershell
go test ./...
go vet ./...
go build -o bin/api.exe ./cmd/api
```

TrÆ°á»›c khi triá»ƒn khai, thiáº¿t láº­p biáº¿n production trong mÃ´i trÆ°á»ng báº£o máº­t (hoáº·c file `.env` Ä‘Æ°á»£c báº£o vá»‡), báº£o Ä‘áº£m database Ä‘Ã£ cÃ³, rá»“i cháº¡y migration báº±ng tÃ i khoáº£n Ä‘Æ°á»£c cáº¥p quyá»n DDL:

```powershell
$env:APP_ENV = "production"
$env:AUTO_MIGRATE = "false"
go run ./cmd/migrate
```

Sau khi migration hoÃ n táº¥t, cháº¡y API vá»›i cáº¥u hÃ¬nh production. Production báº¯t buá»™c HTTPS, `COOKIE_SECURE=true`, `AUTO_MIGRATE=false`, JWT secret máº¡nh, origin HTTPS chÃ­nh xÃ¡c trong CORS vÃ  SMTP cÃ³ STARTTLS. DÃ¹ng reverse proxy/load balancer Ä‘á»ƒ káº¿t thÃºc TLS vÃ  giá»›i háº¡n truy cáº­p máº¡ng tá»›i API/DB phÃ¹ há»£p vá»›i háº¡ táº§ng.

Health check cho service monitor/orchestrator: `GET /healthz`. HTTP `200` nghÄ©a lÃ  API truy váº¥n Ä‘Æ°á»£c database; `503` nghÄ©a lÃ  database chÆ°a sáºµn sÃ ng. Endpoint nÃ y khÃ´ng thay tháº¿ monitoring tÃ i nguyÃªn, log, backup hoáº·c kiá»ƒm tra readiness cá»§a cÃ¡c há»‡ thá»‘ng phá»¥ thuá»™c khÃ¡c.

### Váº­n hÃ nh vÃ  giá»›i háº¡n hiá»‡n táº¡i

- Má»—i request Ä‘Æ°á»£c báº£o vá»‡ sáº½ kiá»ƒm tra tráº¡ng thÃ¡i vÃ  role user trong DB, cÃ¹ng tráº¡ng thÃ¡i phiÃªn. Access token dÃ¹ng HS256; refresh token Ä‘Æ°á»£c lÆ°u hash, xoay vÃ²ng vÃ  replay sáº½ thu há»“i phiÃªn.
- Cookie refresh cÃ³ `HttpOnly`, `SameSite=Strict`, `Secure` theo cáº¥u hÃ¬nh vÃ  path `/api/v1/auth/refresh`. Khi FE vÃ  API khÃ¡c site, cáº§n thiáº¿t káº¿ láº¡i cookie vÃ  CSRF protection trÆ°á»›c khi triá»ƒn khai.
- Rate limiter hiá»‡n náº±m trong bá»™ nhá»› cá»§a má»™t process. Khi scale nhiá»u replica, chuyá»ƒn giá»›i háº¡n sang gateway hoáº·c kho chia sáº» nhÆ° Redis.
- OTP Ä‘Æ°á»£c log á»Ÿ development Ä‘á»ƒ kiá»ƒm thá»­; khÃ´ng cháº¡y development mode vá»›i dá»¯ liá»‡u production. OTP/email chÆ°a Ä‘Æ°á»£c kiá»ƒm thá»­ end-to-end vá»›i SMTP tháº­t.
- Hiá»‡n chÆ°a cÃ³ OAuth, MFA, xÃ¡c minh email, quáº£n lÃ½ nhiá»u thiáº¿t bá»‹, module commerce hoáº·c cÃ´ng cá»¥ bootstrap admin. Cáº¥p `SELLER`/`ADMIN` báº±ng quy trÃ¬nh váº­n hÃ nh tin cáº­y, khÃ´ng qua Ä‘Äƒng kÃ½ public.
- Migration security khÃ´ng thay tháº¿ viá»‡c import schema commerce Ä‘áº§y Ä‘á»§ theo SRS. Kiá»ƒm tra schema hiá»‡n cÃ³ trÆ°á»›c khi Ã¡p dá»¥ng migration trÃªn mÃ´i trÆ°á»ng Ä‘ang cháº¡y.

### Kiá»ƒm thá»­ vÃ  cáº¥u trÃºc code

CÃ¡c lá»‡nh Ä‘Ã£ cháº¡y thÃ nh cÃ´ng: `go test ./...`, `go vet ./...`, `go build ./...` vÃ  smoke test trÃªn MySQL local. Unit test bao gá»“m validation máº­t kháº©u/phone/role, JWT tamper/type/expiry, auth báº¯t buá»™c, CORS, JSON nghiÃªm ngáº·t, rate limit vÃ  tÃ­nh duy nháº¥t cá»§a JWT phÃ¡t hÃ nh liÃªn tiáº¿p.

Smoke test API bao gá»“m health, Ä‘Äƒng kÃ½, login email/phone, refresh/replay, tá»« chá»‘i CLIENT á»Ÿ route ADMIN, logout vÃ  thu há»“i phiÃªn. Script táº¡o user kiá»ƒm thá»­ ngáº«u nhiÃªn trong database:

```powershell
./scripts/smoke-api.ps1
```

API pháº£i Ä‘ang cháº¡y vÃ  `.env` pháº£i trá» tá»›i database dÃ¹ng cho kiá»ƒm thá»­. CÃ³ thá»ƒ Ä‘áº·t `API_BASE_URL` Ä‘á»ƒ Ä‘á»•i Ä‘á»‹a chá»‰ backend.

```text
cmd/api/                         Entry point HTTP
cmd/migrate/                     Cháº¡y migration thá»§ cÃ´ng
internal/auth/                   Auth, JWT, OTP, RBAC vÃ  middleware
internal/auth/migrations/        Migration MySQL Ä‘Æ°á»£c nhÃºng
internal/auth/app_test.go        Unit tests
scripts/smoke-api.ps1            API smoke test
docker-compose.yml               MySQL local
```

## 2. HÆ°á»›ng dáº«n FE

### Base URL, JSON vÃ  lá»—i

Äáº·t base URL theo mÃ´i trÆ°á»ng FE; local máº·c Ä‘á»‹nh:

```js
const API_BASE_URL = "http://localhost:8080";
```

Request cÃ³ body pháº£i dÃ¹ng `Content-Type: application/json`. Response thÃ nh cÃ´ng cÃ³ `success: true` vÃ  thÆ°á»ng cÃ³ `data`; lá»—i cÃ³ HTTP status, `message` vÃ  `errors`:

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

Origin cá»§a FE pháº£i cÃ³ trong `CORS_ALLOWED_ORIGINS`. Local máº«u lÃ  `http://localhost:5173`; origin Ä‘Æ°á»£c so khá»›p chÃ­nh xÃ¡c.

### ÄÄƒng kÃ½

`POST /api/v1/auth/register` â€” khÃ´ng cáº§n Ä‘Äƒng nháº­p. Backend luÃ´n táº¡o user role `CLIENT`; API public khÃ´ng nháº­n role.

```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "full_name": "Nguyen Van A",
  "phone": "+84901234567"
}
```

Email Ä‘Æ°á»£c chuáº©n hÃ³a chá»¯ thÆ°á»ng; email vÃ  phone pháº£i duy nháº¥t. Phone gá»“m 9â€“15 chá»¯ sá»‘, cÃ³ thá»ƒ báº¯t Ä‘áº§u báº±ng `+`. Máº­t kháº©u dÃ i 10â€“72 byte, cÃ³ Ã­t nháº¥t má»™t chá»¯ cÃ¡i vÃ  má»™t chá»¯ sá»‘. ThÃ nh cÃ´ng tráº£ HTTP `201` vÃ  há»“ sÆ¡ user trong `data`.

### ÄÄƒng nháº­p vÃ  access token

`POST /api/v1/auth/login` â€” khÃ´ng cáº§n Ä‘Äƒng nháº­p. `identifier` nháº­n email hoáº·c phone:

```json
{ "identifier": "customer@example.com", "password": "SecurePass123" }
```

Response thÃ nh cÃ´ng cÃ³ `data.access_token`, `data.expires_in` (giÃ¢y), `data.token_type` vÃ  `data.user`. Refresh token Ä‘Æ°á»£c Ä‘áº·t riÃªng trong cookie `HttpOnly`, khÃ´ng cÃ³ trong JSON. FE giá»¯ access token trong bá»™ nhá»› á»©ng dá»¥ng vÃ  gá»­i:

```http
Authorization: Bearer <access_token>
```

KhÃ´ng lÆ°u access/refresh token trong `localStorage`.

### LÃ m má»›i phiÃªn

`POST /api/v1/auth/refresh` â€” khÃ´ng cáº§n body hay Bearer token. TrÃ¬nh duyá»‡t gá»­i cookie vÃ  FE cáº­p nháº­t access token má»›i:

```js
const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
  method: "POST",
  credentials: "include",
});
const result = await response.json();
if (response.ok) {
  // LÆ°u result.data.access_token trong memory.
}
```

Refresh cookie cÃ³ path `/api/v1/auth/refresh`, `HttpOnly`, `SameSite=Strict`; local HTTP dÃ¹ng `COOKIE_SECURE=false`, production HTTPS dÃ¹ng `true`. Request cross-origin cáº§n `credentials: "include"`. Náº¿u refresh tráº£ `401`, yÃªu cáº§u ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p láº¡i. Token refresh cÅ© bá»‹ dÃ¹ng láº¡i sáº½ lÃ m backend thu há»“i phiÃªn Ä‘Ã³.

### Há»“ sÆ¡, Ä‘Äƒng xuáº¥t vÃ  phÃ¢n quyá»n

`GET /api/v1/auth/me` yÃªu cáº§u access token:

```js
const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

`POST /api/v1/auth/logout` cÅ©ng yÃªu cáº§u access token. Backend thu há»“i phiÃªn; FE nÃªn xÃ³a access token khá»i memory sau response thÃ nh cÃ´ng.

`GET /api/v1/admin/users` lÃ  route minh há»a, chá»‰ role `ADMIN` Ä‘Æ°á»£c truy cáº­p. Role tráº£ vá» lÃ  `CLIENT`, `SELLER` hoáº·c `ADMIN`; FE cÃ³ thá»ƒ dÃ¹ng role Ä‘á»ƒ hiá»ƒn thá»‹ giao diá»‡n nhÆ°ng backend váº«n lÃ  nÆ¡i quyáº¿t Ä‘á»‹nh quyá»n truy cáº­p.

### QuÃªn vÃ  Ä‘áº·t láº¡i máº­t kháº©u

`POST /api/v1/auth/forgot-password` nháº­n email hoáº·c phone; OTP Ä‘Æ°á»£c gá»­i Ä‘áº¿n email gáº¯n vá»›i tÃ i khoáº£n:

```json
{ "identifier": "customer@example.com" }
```

Response chung khÃ´ng tiáº¿t lá»™ tÃ i khoáº£n tá»“n táº¡i hay khÃ´ng. Trong development, láº¥y OTP tá»« log backend; production gá»­i qua SMTP STARTTLS.

`POST /api/v1/auth/reset-password` nháº­n email, OTP 6 chá»¯ sá»‘ vÃ  máº­t kháº©u má»›i:

```json
{
  "email": "customer@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass456"
}
```

OTP máº·c Ä‘á»‹nh háº¿t háº¡n sau 10 phÃºt, tá»‘i Ä‘a 5 láº§n nháº­p sai, cooldown gá»­i láº¡i 60 giÃ¢y. Äáº·t láº¡i máº­t kháº©u thu há»“i toÃ n bá»™ phiÃªn; ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p láº¡i báº±ng máº­t kháº©u má»›i.

### Danh sÃ¡ch API vÃ  status

| Method | Endpoint                       | XÃ¡c thá»±c    | MÃ´ táº£                                            |
| ------ | ------------------------------ | -------------- | --------------------------------------------------- |
| `GET`  | `/healthz`                     | KhÃ´ng         | Kiá»ƒm tra káº¿t ná»‘i DB                           |
| `POST` | `/api/v1/auth/register`        | KhÃ´ng         | Táº¡o tÃ i khoáº£n CLIENT                           |
| `POST` | `/api/v1/auth/login`           | KhÃ´ng         | ÄÄƒng nháº­p, tráº£ access token vÃ  refresh cookie |
| `POST` | `/api/v1/auth/refresh`         | Refresh cookie | Xoay phiÃªn, tráº£ access token má»›i               |
| `POST` | `/api/v1/auth/logout`          | Bearer         | Thu há»“i phiÃªn hiá»‡n táº¡i                       |
| `GET`  | `/api/v1/auth/me`              | Bearer         | Há»“ sÆ¡ hiá»‡n táº¡i                               |
| `POST` | `/api/v1/auth/forgot-password` | KhÃ´ng         | YÃªu cáº§u OTP                                      |
| `POST` | `/api/v1/auth/reset-password`  | KhÃ´ng         | Äá»•i máº­t kháº©u báº±ng OTP                       |
| `GET`  | `/api/v1/admin/users`          | ADMIN          | Tá»‘i Ä‘a 100 user, route minh há»a RBAC            |

## Bá»• sung báº£o máº­t vÃ  tÃ­ch há»£p FE

### Tá»• chá»©c auth/security

Route HTTP táº­p trung táº¡i `internal/auth/routes.go`; handlers trong `app.go` vÃ  `security_handlers.go` kiá»ƒm tra request/response, cÃ²n SQL Ä‘Æ°á»£c thá»±c hiá»‡n theo luá»“ng handler hiá»‡n táº¡i. `security_handlers.go` chá»©a Ä‘á»•i máº­t kháº©u vÃ  xÃ¡c minh OTP. ÄÃ¢y lÃ  ranh giá»›i Ä‘áº§u tiÃªn Ä‘á»ƒ tÃ¡ch tiáº¿p service/repository khi má»Ÿ rá»™ng nghiá»‡p vá»¥; trÃ¡nh thÃªm route ráº£i rÃ¡c trong entrypoint.

### API quáº£n lÃ½ máº­t kháº©u

`POST /api/v1/auth/verify-reset-otp` xÃ¡c minh OTP thá»±c sá»± á»Ÿ server. Body nháº­n `identifier` (email hoáº·c Ä‘iá»‡n thoáº¡i) vÃ  `otp`; response khÃ´ng tráº£ láº¡i OTP hoáº·c email Ä‘Æ°á»£c tra cá»©u. Endpoint reset váº«n xÃ¡c minh láº¡i OTP trong transaction, vÃ¬ váº­y bÆ°á»›c verify trÃªn client khÃ´ng thay tháº¿ xÃ¡c minh á»Ÿ thao tÃ¡c thay Ä‘á»•i máº­t kháº©u.

`POST /api/v1/auth/reset-password` nháº­n `identifier`, `otp`, `new_password`; trÆ°á»ng `email` cÅ© váº«n Ä‘Æ°á»£c nháº­n Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch client cÅ©. Email hoáº·c sá»‘ Ä‘iá»‡n thoáº¡i Ä‘á»u Ä‘Æ°á»£c há»— trá»£; OTP cÃ³ háº¡n dÃ¹ng, giá»›i háº¡n láº§n thá»­ vÃ  cooldown. Máº­t kháº©u Ä‘Æ°á»£c hash báº±ng bcrypt vÃ  cÃ¡c refresh session Ä‘Æ°á»£c thu há»“i.

`PUT /api/v1/auth/password` yÃªu cáº§u Bearer access token. Body gá»“m `current_password`, `new_password`, `confirm_password`. Backend xÃ¡c minh máº­t kháº©u hiá»‡n táº¡i, Ã¡p chÃ­nh sÃ¡ch máº­t kháº©u, tá»« chá»‘i dÃ¹ng láº¡i máº­t kháº©u cÅ©, Ä‘á»•i máº­t kháº©u vÃ  thu há»“i má»i refresh session trong cÃ¹ng transaction. FE yÃªu cáº§u Ä‘Äƒng nháº­p láº¡i sau khi Ä‘á»•i.

| Method | Endpoint                        | XÃ¡c thá»±c | Chá»©c nÄƒng                                     |
| ------ | ------------------------------- | ----------- | ------------------------------------------------ |
| `POST` | `/api/v1/auth/verify-reset-otp` | KhÃ´ng      | XÃ¡c minh mÃ£ OTP á»Ÿ BE, Ã¡p giá»›i háº¡n thá»­ |
| `POST` | `/api/v1/auth/reset-password`   | OTP         | Äáº·t láº¡i máº­t kháº©u vÃ  thu há»“i phiÃªn    |
| `PUT`  | `/api/v1/auth/password`         | Bearer      | Äá»•i máº­t kháº©u tá»« phiÃªn hiá»‡n táº¡i      |

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

### CÃ i dependency vÃ  kiá»ƒm tra

Go modules khai bÃ¡o táº¡i `go.mod`/`go.sum`; táº£i vÃ  kiá»ƒm tra báº±ng:

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

Frontend dÃ¹ng lockfile; cÃ i Ä‘Ãºng phiÃªn báº£n báº±ng `npm ci`, sau Ä‘Ã³ `npm run lint` vÃ  `npm run build` táº¡i `frontend/project-ecommerce`. Khi stack Ä‘ang cháº¡y, `./backend/scripts/smoke-api.ps1` kiá»ƒm tra health, register/login, refresh replay, RBAC vÃ  logout. Smoke script cÃ³ thá»ƒ táº¡o tÃ i khoáº£n thá»­ trong DB local.

CÃ¡c status FE thÆ°á»ng cáº§n xá»­ lÃ½: `400` dá»¯ liá»‡u khÃ´ng há»£p lá»‡, `401` xÃ¡c thá»±c sai/háº¿t háº¡n, `403` origin hoáº·c role bá»‹ tá»« chá»‘i, `409` email/phone Ä‘Ã£ Ä‘Æ°á»£c dÃ¹ng, `415` Content-Type khÃ´ng Ä‘Ãºng, `429` vÆ°á»£t rate limit, `503` DB chÆ°a sáºµn sÃ ng. Body JSON tá»‘i Ä‘a 1 MiB; JSON lá»—i, field láº¡ hoáº·c nhiá»u JSON value bá»‹ tá»« chá»‘i.
Frontend dùng lockfile; cài đúng phiên bản bằng `npm ci`, sau đó `npm run lint` và `npm run build` tại `frontend/project-ecommerce`. Khi stack đang chạy, `./backend/scripts/smoke-api.ps1` kiểm tra health, register/login, refresh replay, RBAC và logout. Smoke script có thể tạo tài khoản thử trong DB local.

Các status FE thường cần xử lý: `400` dữ liệu không hợp lệ, `401` xác thực sai/hết hạn, `403` origin hoặc role bị từ chối, `409` email/phone đã được dùng, `415` Content-Type không đúng, `429` vượt rate limit, `503` DB chưa sẵn sàng. Body JSON tối đa 1 MiB; JSON lỗi, field lạ hoặc nhiều JSON value bị từ chối.
