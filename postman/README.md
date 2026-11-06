# Kiểm thử API với Postman/Newman

Collection kiểm thử có chọn lọc các luồng BE: health, xác thực, catalog, admin quản lý danh mục, mở shop (DRAFT, xác nhận điều khoản, xét duyệt, nộp lại và cấp SELLER), seller product, địa chỉ, cart/wishlist, follow shop và admin inventory. Bộ test kiểm tra input sai, phân quyền và contract `status_counts`; không bao phủ mọi route hay nhánh nghiệp vụ. Xem [Backend README](../backend/README.md#api-hiện-có) và [catalog API contract](../docs/catalog-api.md).

Folder **Cart and Wishlist** cần chạy sau folder **Authentication** trong cùng collection run vì nó dùng `clientToken` và tài khoản CLIENT mới được tạo ở folder đó. Flow kiểm tra anonymous access, cart rỗng, biến thể không tồn tại, thêm/cộng dồn/đặt số lượng, từ chối vượt stock/quantity không hợp lệ, xóa item/toàn giỏ, từ chối sản phẩm chưa duyệt trong wishlist và wishlist thêm lặp/đọc/xóa. Nó dùng sản phẩm/biến thể seed `960001`/`961001`; không dùng cart/wishlist của buyer seed vì các fixture đó đã có dữ liệu.

Các API admin dashboard, admin orders và một số API admin shop trong FE chưa có ở BE; chúng không nằm trong collection và không được xem là đã tích hợp chỉ vì FE có mock fallback. Danh sách route cụ thể xem trong [Backend README](../backend/README.md#những-route-fe-đang-gọi-nhưng-be-chưa-triển-khai).

## Shop onboarding coverage

Folder **Shop, Seller Products, and Addresses** now exercises the seller application lifecycle in order:

1. Register a disposable account and verify it starts with CLIENT role.
2. Create and read a DRAFT; verify submission without agreements is rejected.
3. Accept the current seller terms and submit to PENDING; repeat submission to verify idempotency.
4. Admin requests information (NEEDS_INFO); the owner reads the state, updates the profile and resubmits.
5. Admin rejects the application; the owner resubmits; admin approves and adds SELLER while preserving CLIENT.
6. Continue with seller APIs, then suspend and restore the shop. A final negative case verifies an ACTIVE shop cannot be rejected as if it were still under review.

This collection uses a disposable local/test database and leaves the generated account/shop and some mutations behind. It is an integration smoke flow, not proof of production readiness or exhaustive coverage. The flow is not executed automatically by documentation/build checks; use the guarded local Newman helper only after inspecting its destructive effects and refreshing the dedicated local seed. The step 3 KYC/banking form is intentionally informational until secure upload and sensitive-data persistence APIs are implemented.

## Admin category coverage

Folder **Admin Category Management** runs after **Authentication** and **Admin Inventory**: it uses `clientToken` created by Authentication and `adminToken` established by the admin inventory flow. It verifies that CLIENT cannot list or create categories; admin can list categories, create a root and child, update a category, and reactivate/deactivate categories; malformed input, duplicate slug, missing parent, hierarchy cycles, and deactivating a parent with an active child are rejected. It also confirms soft-deleted entries remain in the admin list and disappear from the public category list. Each run creates uniquely named category fixtures and leaves them inactive in the local/test database; refresh the dedicated local seed when you need a clean database. Do not run this mutating collection against a shared or production database.

## Import vào Postman

Import các file:

- `rikkei-ecommerce.postman_collection.json`
- `local.postman_environment.json`

Chọn environment **Rikkei E-Commerce - Local**. `baseUrl` mặc định là `http://localhost:18080`; đổi thành `http://localhost:8080` nếu backend Compose dùng port mặc định. Environment có mật khẩu tài khoản seed local; không dùng lại ở môi trường khác.

## Chuẩn bị và chạy

**Cảnh báo: chỉ chạy trên database local/test dùng riêng.** Không dùng trên production, staging hoặc database dùng chung. Collection:

- Đăng ký tài khoản client thử nghiệm; đổi mật khẩu rồi đăng xuất. Tài khoản không tự bị xóa.
- Tạo shop thử nghiệm, duyệt/khóa/khôi phục/từ chối shop; shop và tài khoản vẫn còn sau khi chạy.
- Tạo sản phẩm seller thử nghiệm rồi soft-delete; tạo địa chỉ rồi xóa địa chỉ đó.
- Thêm/xóa item trong cart và thêm/xóa wishlist trên tài khoản CLIENT thử nghiệm.
- Thay đổi trạng thái và cuối cùng soft-delete sản phẩm fixture admin `960009`.

Collection không tự dọn user/shop test đã tạo. Seed chỉ khôi phục các fixture có ID cố định, gồm `960001` và `960009`; seed không xóa tài khoản và shop phát sinh từ các lần chạy. Tránh chạy lặp không cần thiết nếu muốn database local gọn.

Từ root repository, khởi động Docker và nạp lại fixture seed trước khi chạy:

```powershell
docker compose up -d
.\database\seed-local.ps1
```

Trong Postman mở Collection Runner, chọn environment **Rikkei E-Commerce - Local** và chạy collection. Chạy lại seed trước mỗi lượt để phục hồi tài khoản seed và fixture `960009`. **Tuyệt đối không chạy collection hoặc seed trên production, staging hay database dùng chung.**

Các request OTP thành công nằm trong folder **Manual Password Reset (requires OTP)**. Khi backend chạy `APP_ENV=development`, gửi yêu cầu khôi phục, lấy OTP từ log backend, nhập vào biến `resetOtp` trong environment rồi chạy riêng folder đó. Xóa giá trị OTP sau khi test; OTP không được trả trong API response.

## Chạy Newman

Yêu cầu Node.js/npm và Docker Desktop đang chạy:

```powershell
.\postman\run-local-tests.ps1
```

Helper chỉ chấp nhận URL loopback, kiểm tra backend health và `APP_ENV=development`, chạy collection chính rồi thử flow OTP thành công nếu tìm được OTP trong log. Helper xóa environment tạm khi kết thúc, nhưng không dọn các tài khoản/shop test hoặc phục hồi fixture đã thay đổi. Vẫn cần nạp seed local trước khi chạy.

Có thể chạy riêng collection bằng Newman:

```powershell
npx --yes newman run .\postman\rikkei-ecommerce.postman_collection.json `
  --environment .\postman\local.postman_environment.json `
  --reporters cli
```

Newman không phải dependency runtime của BE/FE. Lệnh `npx --yes` có thể tải Newman nếu máy chưa có; helper Newman chỉ nên chạy trên database local/test dùng riêng.

Auth có rate limit đăng nhập 10 request/phút/IP. Nếu vừa chạy nhiều bộ test local và nhận `429`, chờ hết `Retry-After` rồi chạy lại collection; không tắt rate limit để làm test pass.


## Checkout quote checks

The collection includes a **Checkout and Voucher** folder for authenticated active shipping/payment options and invalid-request checks. The folder runs after Authentication and checks active option listing plus invalid inputs. A successful quote is not included because the disposable authentication user does not have a guaranteed owned address and cart fixture. Use `POST /api/v1/vouchers/validate` with `code`, `scope`, `cart_item_ids`, and `shop_id` for shop vouchers; use `POST /api/v1/checkout/quote` with address/method IDs and selected cart IDs for server totals. Quotes do not create orders or consume voucher uses.
