# Rikkei E-Commerce

Nền tảng thương mại điện tử gồm REST API Go, React/TypeScript frontend và MySQL. Tài liệu này là điểm bắt đầu cho thành viên mới; chi tiết chạy stack, API, seed và test nằm trong các README chuyên trách bên dưới.

## Tài liệu chính

- [Phát triển local, cấu hình và dữ liệu seed](docs/local-development.md)
- [Backend: kiến trúc domain, API, migration, logging và test](backend/README.md)
- [Frontend: kiến trúc app/domain/shared, chạy và build](frontend/project-ecommerce/README.md)
- [Postman/Newman: phạm vi test API và tác động dữ liệu](postman/README.md)
- [Catalog API contract](docs/catalog-api.md)

## Thành phần và kiến trúc

```text
backend/internal/
  app/       composition root, server và migration orchestration
  domain/    auth, address, cart, catalog, checkout, seller, shop, wishlist
  platform/  auditlog, HTTP helpers và observability dùng chung

frontend/project-ecommerce/src/
  app/       app entry, routing, layout và store
  domains/   auth, admin, shop, customer, storefront, order
  shared/    API client, UI dùng chung, styles, config, types và utils
```

Giữ logic nghiệp vụ trong domain sở hữu nó. Chỉ chuyển mã sang `platform`/`shared` khi có ít nhất hai consumer thực sự dùng chung. Backend domain là các Go package riêng, các layout như routes/handler/model/repository/validation được tách thành file trong package; không tạo tầng trừu tượng rỗng. Frontend dùng alias `@/` trỏ đến `src/`.

## Chạy nhanh trên máy phát triển

Yêu cầu Docker Compose, Go 1.24+, Node.js 22+ và npm. Ở root repo:

```powershell
Copy-Item .env.example .env   # chỉ khi chưa có .env
# Đổi mật khẩu local và JWT_SECRET trong .env; không dùng secret production.
docker compose up --build -d
docker compose ps
```

FE ở `http://localhost:5173`; API thường ở `http://localhost:8080` hoặc `http://localhost:18080`; MySQL host port `3307`. Compose khởi tạo schema khi volume DB rỗng. `database/scriptDb.sql` không xóa database, nhưng chỉ dùng để bootstrap DB mới/rỗng vì chạy lại sẽ gặp bảng đã tồn tại. Seed chỉ dùng cho local/test, xác nhận đúng môi trường/database và yêu cầu nhập `SEED LOCAL`:

```powershell
.\database\seed-local.ps1
```

Hướng dẫn seed, fixture test và credentials local nằm trong [local development guide](docs/local-development.md). Không chạy seed hoặc collection Postman trên DB nhóm dùng chung, staging hay production.

## Kiểm tra trước khi mở Pull Request

Từ `backend`:

```powershell
gofmt -l .                 # phải không in ra file nào
go test ./...
go vet ./...
go build ./cmd/api
```

`go build ./cmd/api` tạo executable `backend/api` (hoặc `api.exe` trên Windows); các file này đã được Git ignore.

Từ `frontend/project-ecommerce`:

```powershell
npm ci                     # lần đầu hoặc sau thay đổi package-lock.json
npm run lint
npm run build
```

Backend CI chạy gofmt check, unit tests, vet và build. Frontend CI chạy lint và build. Pull request không publish image; workflow publish chạy sau push theo điều kiện trong `.github/workflows/`. Xem GitHub Actions nếu local pass nhưng required check vẫn lỗi.

## Quy trình làm việc nhóm

1. Đồng bộ nhánh đích trước khi tạo feature branch; không commit trực tiếp lên `main`/`build`.
2. Tạo branch theo phạm vi, ví dụ `feat/shop-onboarding`, `fix/catalog-category` hoặc `docs/development-guide`.
3. Thay đổi API thì cập nhật handler/route, quyền, contract README và Postman cùng lúc. Thay đổi schema thì thêm migration an toàn cho DB đang có dữ liệu; không chỉ sửa seed.
4. Chạy đúng các lệnh kiểm tra ở trên. Nếu thay đổi endpoint hoặc nghiệp vụ, chạy thêm Postman/Newman trên DB local riêng; ghi rõ các test chưa chạy trong PR.
5. Commit các file thuộc task, push branch và mở PR vào nhánh nhóm yêu cầu. Nêu hành vi thay đổi, API/schema ảnh hưởng, lệnh test và ghi chú rollout/migration.
6. Không force-push branch dùng chung, không đưa `.env`, token, mật khẩu, file log hoặc build artifact vào commit.

## Trạng thái phạm vi sản phẩm

Backend currently supports auth/RBAC, catalog/categories, shop onboarding, seller products, addresses, cart, wishlist, platform/shop vouchers, banners, flash sales, verified-purchase reviews, seller replies, moderation, audit logs, checkout quotes, and order creation (multi-shop splitting, atomic stock reservation, COD and bank transfer). See [promotion/review API and workflow notes](backend/README.md#promotions-reviews-and-audit-log) for authorization and lifecycle details.

### Order status workflow (customer and seller)

Order status transitions are persisted as `PENDING -> CONFIRMED -> PACKING -> SHIPPING -> COMPLETED`, with controlled cancellation/return paths. The customer-facing processing tab groups `CONFIRMED` and `PACKING`; the seller's preparation tab uses `status=PREPARING` for those same persisted states. Details still show the exact status. Seller endpoints enforce shop ownership and valid transitions. `ship` requires carrier and tracking code. `POST /api/v1/seller/orders/bulk-confirm` validates 1–50 distinct IDs and confirms all selected pending orders atomically.

See [Backend README](backend/README.md#order-workflow-customer-and-seller) for API/filter contracts and [Frontend README](frontend/project-ecommerce/README.md#order-workflow-api-integration) for UI integration and current mock-data boundaries.

### Media uploads

Avatar, shop branding, product images, and product video files use the authenticated Cloudinary upload API. Configure Cloudinary values in ignored local `.env` files only; the API secret is backend-only. JPG/JPEG/PNG images are capped at 5 MiB and product videos at 20 MiB. See [Backend media API documentation](backend/README.md#media-uploads-cloudinary) and [Frontend integration](frontend/project-ecommerce/README.md#media-upload-integration).

Checkout order creation now requires an `Idempotency-Key`. The FE retains the same key for retries of an unchanged checkout request, and the BE atomically stores the order response with inventory, voucher, payment, and cart changes. Reusing the key with changed input is rejected. Postman order creation requests use a dynamic GUID; reuse that exact key manually to verify replay behavior.

Cart add (`POST /api/v1/cart/items`) and media upload (`POST /api/v1/media`) now require `Idempotency-Key` as well. The cart retries reuse a pending session key; media retries reuse a key derived from the file contents and purpose. The API persists request fingerprints and rejects reuse with changed input. CORS permits this header for configured FE origins.
