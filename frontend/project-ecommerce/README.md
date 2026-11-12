# Rikkei E-Commerce Frontend

Frontend dùng React, TypeScript, Vite và Axios. Hướng dẫn API BE, endpoint được hỗ trợ và giới hạn hiện tại nằm trong [Backend README](../../backend/README.md#2-hướng-dẫn-fe-tích-hợp-api); test request bằng Postman/Newman được mô tả trong [Postman README](../../postman/README.md).

## Chạy local

Yêu cầu Node.js/npm. Từ thư mục `frontend/project-ecommerce`:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Vite chạy tại `http://localhost:5173`. `.env.local` mặc định dùng `VITE_BACKEND_HOST=http://localhost:8080`; nếu BE chạy ở port Compose `18080`, đổi thành `http://localhost:18080`. Vite proxy `/api` và `/healthz` đến backend này.

Không đặt secret hoặc credentials trong biến `VITE_*`: các giá trị này được đóng gói và công khai trong browser.

## Chạy bằng Docker Compose

Từ thư mục gốc repository, dùng `docker compose up --build -d`. Frontend truy cập tại `http://localhost:5173`; Nginx chuyển `/api/` và `/healthz` tới backend trong Compose. Giữ `VITE_API_BASE_URL` trống để dùng same-origin proxy.

## Kiểm tra

```powershell
npm run lint
npm run build
```

## Tích hợp API

- Dùng `src/shared/api/axiosClient.ts` cho request. Access token chỉ giữ trong memory; refresh token do backend cấp qua HttpOnly cookie và Axios gửi bằng `withCredentials`.
- API path bắt đầu bằng `/api/v1`. Với local Vite, dùng backend host trong `.env.local`; với Compose dùng same-origin.
- Cart and wishlist are connected to authenticated backend APIs: `/api/v1/cart/*` and `/api/v1/wishlist/*`. Cart and voucher endpoints require the CLIENT role; state is scoped to the signed-in account. Voucher discounts are no longer hard-coded in the FE.
- Voucher and checkout quote APIs are connected to the backend: `POST /api/v1/vouchers/validate`, `GET /api/v1/checkout/options`, and `POST /api/v1/checkout/quote`. The cart sends selected cart item IDs and voucher codes; the server rechecks ownership, active product/variant/shop/category state, stock, voucher scope/period/usage/minimum and active shipping/payment methods before calculating totals.
- In the cart, the checkout dialog loads saved addresses plus active shipping/payment methods. Calculate shipping and view quote refreshes a server-side quote using current DB prices and stock. The test-only `MOCK_CARD` payment method is filtered out because it has no gateway. Shipping `base_fee` is charged once per multi-shop quote; shop vouchers apply only to their shop, then the platform voucher applies, capped so discounts never exceed merchandise subtotal. The cart total before this step is only an estimate.
- Quotes do not place orders, reserve stock, or consume vouchers. Do not add a payment-success screen or clear the cart until a transactional order-creation/payment flow is implemented. A customer without a saved address should use `/profile/address` and retry.
- Backend trả `{ "success": true, "data": ... }` hoặc lỗi có HTTP status và `errors[].code`. Không dựa vào mock fallback để xác nhận BE đã tích hợp: một số API client cũ trả dữ liệu mock sau khi request thất bại.
- API admin shop `GET /api/v1/admin/shops` trả sáu trạng thái và `data.status_counts` trên toàn bộ shop; `data.total` chỉ đếm kết quả khớp filter/tìm kiếm. Dùng `status_counts` cho tab/thống kê, không suy ra số liệu toàn hệ thống từ trang hiện tại.
- Một tài khoản có thể có nhiều role. User response có `role` tương thích, `roles` dạng mảng và `shop_status` nếu có shop; FE dùng các trường này để điều khiển giao diện, quyền cuối cùng do BE xác nhận. Seller Center chỉ hiện khi shop `ACTIVE`, còn storefront và tài khoản mua hàng vẫn dùng được với role `CLIENT`.
- Mở shop hỗ trợ cả khách mới lẫn CLIENT đã có tài khoản: khách mới đăng ký public thành CLIENT, sau đó tạo/cập nhật DRAFT và gửi duyệt. `POST /api/v1/me/shop/submit` yêu cầu `agreements` đúng phiên bản `seller-onboarding-v1`; backend lưu chấp thuận và đưa hồ sơ sang `PENDING`. Chủ shop có thể sửa/nộp lại hồ sơ `NEEDS_INFO` hoặc `REJECTED`; admin duyệt mới cấp thêm `SELLER`. Hồ sơ KYC/ngân hàng và tải file CCCD hiện chưa được gửi/lưu vì backend chưa có API an toàn cho dữ liệu đó.
- Một số màn admin dashboard/shop/order đang gọi endpoint BE chưa triển khai. Xem bảng “Những route FE đang gọi nhưng BE chưa triển khai” trong Backend README trước khi kết nối các màn đó.

Chỉ gửi access token qua header `Authorization: Bearer ...`; không lưu access/refresh token trong `localStorage` hoặc `sessionStorage`.

## Cấu trúc mã nguồn

```text
src/
  app/                 App entry, routing, layouts và Redux store
  domains/
    auth/              API, pages, components, state, types
    admin/             API, pages, components, state, types
    shop/              API, pages, components, state, types
    customer/          hồ sơ, địa chỉ, đơn mua và các thành phần liên quan
    storefront/        trang chủ, catalog, chi tiết sản phẩm và API công khai
    order/             kiểu dùng chung cho dữ liệu đơn hàng
  shared/              API client, components dùng chung, styles, config, types, utils, assets
```

Thêm hoặc sửa nghiệp vụ trong domain tương ứng; chỉ đặt mã ở `shared` khi thực sự được nhiều domain dùng. `app` chỉ ghép ứng dụng (routes/layout/store), không chứa logic nghiệp vụ. Alias `@/` trỏ tới `src/` để import giữa domain không phụ thuộc vào độ sâu thư mục. HTML prototype cũ được giữ tại `docs/ui-prototypes`, ngoài nguồn build của ứng dụng.

### Checkout QA and remaining work

Verify with a CLIENT account that has a saved address and selected cart items. Exercise no-voucher quote, valid platform and shop voucher, invalid/expired/used voucher, a shop voucher for a shop absent from selected items, stale stock/product status, inactive payment/shipping method, and an address/cart item owned by another account. Errors should be displayed to the user; the cart and voucher usage must remain unchanged because quote/validation are read-only.

The quote is not order submission. Do not show a payment-success state, clear cart items, or promise stock reservation. The next FE integration depends on the backend order-creation and payment APIs, which must revalidate and transact the quote data.

## Order workflow API integration

The customer order history and seller order management pages are connected to the backend APIs. Customer list/detail/cancel/received use `/api/v1/orders`; seller list/detail/confirm/pack/ship/cancel use `/api/v1/seller/orders`. Seller authorization and shop ownership are enforced by the backend.

The UI groups persisted `CONFIRMED` and `PACKING` under a preparation tab, while preserving the real status as `workflowStatus`. A seller confirms a pending order, starts packing a confirmed order, then supplies carrier and tracking code to hand a packed order to shipping. The customer sees these states as one "shop is processing" section. The backend remains the source of truth; refresh the list after every successful transition and surface API errors without optimistic success messages.

Seller list filters map to `status=PREPARING`, `payment_method`, `courier`, and `date_range`. Bulk confirmation is available through the API adapter (`POST /api/v1/seller/orders/bulk-confirm`) for 1–50 selected order IDs; only expose it in a screen when selection, all-or-nothing failure feedback, and refresh behavior are implemented.

The seller dashboard's urgent-order list and its order actions use live APIs. Other dashboard summary/analytics values still come from the existing mock source and should not be treated as production metrics.

Validation from the frontend directory: `npm run lint` and `npm run build`. The current build completes; Vite/Rolldown reports a 2.2 MB minified JS bundle warning, which is a performance/code-splitting concern rather than an order API correctness failure.

## Media upload integration

Profile avatar, shop logo/banner, product cover/details, and product video upload through the shared `POST /api/v1/media` multipart client. The API secret remains in Go backend configuration. Use `.jpg`/`.jpeg` only for images (maximum 5 MiB); PNG and all other image formats are rejected. Product videos support MP4/MOV/WebM up to 20 MiB. Client checks improve feedback, while the backend verifies actual file content and enforces limits again. The backend currently permits 30 upload requests per account per minute per instance.

The global upload panel shows progress and failures and remains mounted across in-app route navigation. Profile avatar is previewed immediately, then saved to `/api/v1/auth/profile/avatar` after Cloudinary returns a URL. Product submission is blocked while media is still uploading and requires a successfully uploaded cover image, so temporary object URLs or a placeholder cannot be submitted. Upload failures in the product form are also shown as an actionable error. Product videos are sent as `video_url`; the backend migration persists that URL and product detail can render it. Browser reload/close interrupts a browser-owned upload; route navigation within the SPA does not.

Set Cloudinary configuration in the root `.env` for Docker Compose and `backend/.env` for direct API runs. Never define the API secret as a `VITE_*` variable; that would expose it in the built JavaScript. See [Backend README](../../backend/README.md#media-uploads-cloudinary) for endpoint contract and configuration details.
