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

## Checkout and Order creation coverage

Folder **Checkout and Voucher** bao phủ toàn bộ luồng tính phí, áp mã giảm giá và tạo đơn hàng thực tế:

1. **Kiểm tra quyền và input:**
   - Từ chối truy cập anonymous hoặc non-CLIENT (`401`, `403`).
   - Lấy danh sách phương thức vận chuyển và thanh toán đang kích hoạt (`GET /api/v1/checkout/options`).
   - Từ chối body thiếu trường bắt buộc (`400`), ID trùng lặp (`400`).
   - Từ chối địa chỉ không thuộc sở hữu của người dùng (`422 address_unavailable`).
   - Từ chối phương thức `MOCK_CARD` (`422 payment_method_unavailable`).
2. **Luồng End-to-End với tài khoản Buyer Seed (`seed-buyer@local.test`):**
   - Đăng nhập tài khoản buyer seed và lấy token `buyerToken`.
   - Đọc giỏ hàng và lấy ID sản phẩm trong giỏ `buyerCartItemId`.
   - Tính báo giá (`POST /api/v1/checkout/quote`) có áp voucher sàn `SEED-WELCOME`.
   - Tạo đơn hàng với phương thức **COD** (`POST /api/v1/checkout/orders`):
     - Xác nhận mã đơn cha `ORD...` và trạng thái `PENDING`.
     - Xác nhận đơn con theo shop (`shop_orders`) với phân bổ tiền hàng và voucher tương ứng.
     - Xác nhận bản ghi thanh toán `payments` có mã tham chiếu `COD-{order_code}`.
   - Xác nhận giỏ hàng tự động dọn dẹp các sản phẩm vừa mua.
   - Thêm sản phẩm mới và tạo đơn hàng với phương thức **BANK_TRANSFER (Chuyển khoản)**:
     - Xác nhận bản ghi thanh toán `payments` có `transaction_ref = {order_code}` dùng làm cú pháp chuyển khoản.
   - Thử đặt lại sản phẩm đã được mua/xóa khỏi giỏ để kiểm tra chốt chặn `422 cart_selection_changed`.

## Order Tracking and Seller Processing coverage

Folder **Order Tracking and Seller Processing** bao phủ 18 requests kiểm thử toàn diện luồng theo dõi đơn của khách và xử lý đơn của chủ shop:

1. **Khách hàng (`CLIENT`):**
   - Xem danh sách đơn hàng `GET /api/v1/orders` kèm cấu trúc phân trang và bộ đếm tab `counts`.
   - Lọc đơn hàng theo tab trạng thái `GET /api/v1/orders?tab=pending`.
   - Xem chi tiết đơn hàng `GET /api/v1/orders/{id}` kèm thông tin thanh toán, đơn con theo shop và lịch sử trạng thái `timeline`.
   - Hủy đơn hàng `POST /api/v1/orders/{id}/cancel` có phân biệt phản hồi hoàn tiền giữa COD (`NOT_APPLICABLE`) và Online/QR/Paid (`REFUND_PROCESSING` thông báo hoàn tiền trong 3 ngày làm việc).
   - Chặn hủy đơn đã hủy trước đó `422 order_already_cancelled` hoặc đơn đã chuyển sang vận chuyển `422 order_cannot_be_cancelled`.
   - Xác nhận nhận hàng thành công `POST /api/v1/orders/{id}/received`.
   - Gửi yêu cầu đổi/trả/hoàn tiền `POST /api/v1/orders/{id}/returns` khi đơn hàng hoàn thành (`COMPLETED`).
2. **Chủ gian hàng (`SELLER`):**
   - Xem danh sách đơn hàng thuộc shop `GET /api/v1/seller/orders` (đảm bảo cô lập dữ liệu theo `shop_id`).
   - Xem chi tiết đơn hàng con `GET /api/v1/seller/orders/{id}` kèm doanh thu thực nhận `seller_payout`.
   - Các bước chuyển trạng thái: Xác nhận đơn (`PATCH .../confirm`), Đóng gói (`PATCH .../pack`), Giao hàng (`PATCH .../ship` kèm đơn vị vận chuyển và mã vận đơn), Hoàn thành (`PATCH .../complete`).
   - Chủ shop hủy đơn `PATCH .../cancel` khi hết hàng kèm tự động hoàn trả tồn kho.
   - Quản lý đổi trả: Xem danh sách yêu cầu `GET /api/v1/seller/returns`, Duyệt trả hàng `PATCH .../approve` (hoàn tồn kho và hoàn tiền trong 3 ngày), Từ chối trả hàng `PATCH .../reject` kèm lý do giải thích.

Nạp lại seed local (`.\database\seed-local.ps1`) trước khi chạy để đảm bảo fixture giỏ hàng và voucher của `seed-buyer@local.test` luôn sẵn sàng.

### Order workflow verification checklist

Use disposable local accounts/data. These checks change order state; do not replay them against shared or production orders.

1. As CLIENT, request `GET /api/v1/orders?tab=packing`; verify both `CONFIRMED` and `PACKING` appear and the returned record keeps its exact status. Check `counts.preparing` equals their grouped total.
2. As SELLER, request `GET /api/v1/seller/orders?status=PREPARING`; verify both statuses appear only for the authenticated seller's shop. Check exact filters `CONFIRMED` and `PACKING`, pagination, search, `payment_method`, `courier`, and all supported `date_range` values. Invalid filters should return HTTP 400.
3. Confirm a `PENDING` order, then pack it, then ship it with carrier and tracking code, then complete it. Check status history/timeline after each action.
4. Attempt pack from `PENDING`, ship from `CONFIRMED`, ship without carrier/tracking, and repeat a successful transition. Verify these are rejected and status/history do not change.
5. Attempt every seller operation with an order from another shop. Verify it cannot be read or mutated.
6. Bulk confirm 1 and multiple pending orders. Verify empty, duplicate, over-50, invalid, foreign-shop, or non-pending selections fail atomically (no selected order is changed).
7. As CLIENT, cancel a cancellable order and confirm receipt of a shipped order. Verify unauthorized or invalid-state requests are rejected.

Automated checks for this change: `go test ./...`, `go vet ./...`, frontend `npm run lint`, and frontend `npm run build`. Record database-backed Postman results separately because those require a running local MySQL/API and disposable fixtures.

## Upload image and product media

The media API is `POST /api/v1/media` (`Authorization: Bearer ...`, multipart fields `purpose` and `file`). It accepts JPG/JPEG/PNG images up to 5 MiB and MP4/MOV/WebM product videos up to 20 MiB. Verify valid image content, reject mismatched extensions and oversized files, check unauthenticated access and purpose-specific roles, malformed multipart, and Cloudinary unavailable responses. `purpose=review-image` is CLIENT-only. Then save a returned avatar URL with `PUT /api/v1/auth/profile/avatar` and check `GET /api/v1/auth/me`; use `DELETE /api/v1/auth/profile/avatar` to remove it. Product create/update should persist `video_url` and product detail should return it.

Uploads continue while navigating between SPA routes and report progress in the global upload panel. A browser reload/close interrupts an in-flight transfer. Use local test files and a local Cloudinary account; do not commit `.env` files or Postman secrets.

## Checkout retry/idempotency

Every `POST /api/v1/checkout/orders` request in the collection sends Postman's `{{$guid}}` dynamic value as `Idempotency-Key`. The API requires a key (16–128 allowed ASCII characters) and scopes it to the authenticated user. Replaying the same request with the same key returns the original `201` response; reusing the key with a changed body returns `409`. For an explicit replay check, copy the same key and body into a second request; do not let the dynamic GUID resolve to a new value between the two calls.

Cart add and media upload requests use a Postman dynamic `{{$guid}}` idempotency key. If manually replaying one request to verify deduplication, reuse the exact key and body. The key is required for successful cart-add and upload flows.

## Promotions, reviews, and audit

The `Promotions, Reviews, and Audit` folder covers public campaign reads, buyer voucher claims/review eligibility, seller voucher and review endpoints, and admin voucher/banner/flash-sale/review/audit reads. Provide `clientToken`, `sellerToken`, and `adminToken`; replace `voucherId` and `reviewOrderItemId` with records returned by the corresponding GET requests. Mutating requests create persistent data, so run them only against a disposable local database. For full validation, also test duplicate claims/reviews, inactive or expired vouchers, invalid campaign price/time ranges, cancelling an order with a flash-sale item, cross-shop seller access, hiding a review without a reason, and restoring a hidden review.
