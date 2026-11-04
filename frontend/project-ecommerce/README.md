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

- Dùng `src/api/axiosClient.ts` cho request. Access token chỉ giữ trong memory; refresh token do backend cấp qua HttpOnly cookie và Axios gửi bằng `withCredentials`.
- API path bắt đầu bằng `/api/v1`. Với local Vite, dùng backend host trong `.env.local`; với Compose dùng same-origin.
- Backend trả `{ "success": true, "data": ... }` hoặc lỗi có HTTP status và `errors[].code`. Không dựa vào mock fallback để xác nhận BE đã tích hợp: một số API client cũ trả dữ liệu mock sau khi request thất bại.
- Một tài khoản có thể có nhiều role. User response có `role` tương thích, `roles` dạng mảng và `shop_status` nếu có shop; FE dùng các trường này để điều khiển giao diện, quyền cuối cùng do BE xác nhận. Seller Center chỉ hiện khi shop `ACTIVE`, còn storefront và tài khoản mua hàng vẫn dùng được với role `CLIENT`.
- Luồng mở shop yêu cầu đăng nhập, lưu bản nháp qua `POST/PUT /api/v1/me/shop` và gửi duyệt qua `POST /api/v1/me/shop/submit`. Seller tiếp tục truy cập storefront và khu vực tài khoản mua hàng. Form KYC/ngân hàng chưa gửi hoặc lưu dữ liệu vì BE chưa có API phù hợp.
- Một số màn admin dashboard/shop/order đang gọi endpoint BE chưa triển khai. Xem bảng “Những route FE đang gọi nhưng BE chưa triển khai” trong Backend README trước khi kết nối các màn đó.

Chỉ gửi access token qua header `Authorization: Bearer ...`; không lưu access/refresh token trong `localStorage` hoặc `sessionStorage`.
