# Kiểm thử API với Postman/Newman

Collection kiểm thử các API BE **đã triển khai**: health, auth/profile/password/refresh, catalog/search/filter, shop onboarding/approval, seller product/variant, address book, shop follow và admin inventory/users. Collection có cả tình huống dữ liệu sai và thiếu quyền.

Các API admin dashboard, admin orders và một số API admin shop trong FE chưa có ở BE; chúng không nằm trong collection và không được xem là đã tích hợp chỉ vì FE có mock fallback. Danh sách route cụ thể xem trong [Backend README](../backend/README.md#những-route-fe-đang-gọi-nhưng-be-chưa-triển-khai).

## Import vào Postman

Import các file:

- `rikkei-ecommerce.postman_collection.json`
- `local.postman_environment.json`

Chọn environment **Rikkei E-Commerce - Local**. `baseUrl` mặc định là `http://localhost:18080`; đổi thành `http://localhost:8080` nếu backend Compose dùng port mặc định. Environment có mật khẩu tài khoản seed local; không dùng lại ở môi trường khác.

## Chuẩn bị và chạy

Chỉ chạy trên database local/test dùng riêng. Collection tạo tài khoản và shop mới, tạo rồi soft-delete một seller product, tạo/xóa địa chỉ, đồng thời thay đổi/xóa mềm fixture admin inventory `960009`. Các tài khoản/shop sinh ra vẫn còn trong database sau khi chạy.

Từ root repository, khởi động Docker và nạp lại fixture seed trước khi chạy:

```powershell
docker compose up -d
.\database\seed-local.ps1
```

Trong Postman mở Collection Runner và chạy collection. Chạy lại seed trước mỗi lượt để phục hồi tài khoản/fixture `960009`. **Không chạy collection hoặc seed trên production, staging hay database dùng chung.**

Các request OTP thành công nằm trong folder **Manual Password Reset (requires OTP)**. Khi backend chạy `APP_ENV=development`, gửi yêu cầu khôi phục, lấy OTP từ log backend, nhập vào biến `resetOtp` trong environment rồi chạy riêng folder đó. Xóa giá trị OTP sau khi test; OTP không được trả trong API response.

## Chạy Newman

Yêu cầu Node.js/npm và Docker Desktop đang chạy:

```powershell
.\postman\run-local-tests.ps1
```

Helper chỉ chấp nhận URL loopback, kiểm tra backend health và `APP_ENV=development`, chạy collection chính rồi thử flow OTP thành công nếu tìm được OTP trong log. Helper xóa environment tạm khi kết thúc. Vẫn cần nạp seed local trước khi chạy.

Có thể chạy riêng collection bằng Newman:

```powershell
npx --yes newman run .\postman\rikkei-ecommerce.postman_collection.json `
  --environment .\postman\local.postman_environment.json `
  --reporters cli
```

Newman không phải dependency runtime của BE/FE.

Auth có rate limit đăng nhập 10 request/phút/IP. Nếu vừa chạy nhiều bộ test local và nhận `429`, chờ hết `Retry-After` rồi chạy lại collection; không tắt rate limit để làm test pass.
