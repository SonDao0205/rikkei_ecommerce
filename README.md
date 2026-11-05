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
  domain/    auth, address, cart, catalog, seller, shop, wishlist
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

FE ở `http://localhost:5173`; API thường ở `http://localhost:8080` hoặc `http://localhost:18080`; MySQL host port `3307`. Compose khởi tạo schema khi volume DB rỗng. **Không chạy `database/scriptDb.sql` trên DB đã có dữ liệu vì file này tạo lại database.** Seed chỉ dùng cho local/test:

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

Backend đã có auth/RBAC, catalog và quản trị danh mục, onboarding/duyệt shop, seller product CRUD, địa chỉ, cart, wishlist và một số API admin inventory. Checkout, payment, order lifecycle và review chưa có backend API hoàn chỉnh. Một số trang admin FE còn mock fallback; không coi dữ liệu hiển thị từ mock là dữ liệu đã lưu. Chi tiết route đã có/chưa có nằm trong [Backend README](backend/README.md).
