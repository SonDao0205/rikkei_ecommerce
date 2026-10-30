# Phát triển local

Checkout này chứa mã FE/BE tương ứng với nhánh `build` của nhóm. Các giá trị cấu hình local và secret cần để trong file `.env` đã được Git bỏ qua; không commit secret lên repository.

## Khởi chạy ứng dụng local

Mở PowerShell tại thư mục gốc repository:

```powershell
Copy-Item .env.example .env   # chỉ chạy nếu chưa có file .env
# Trước khi chạy, đặt JWT_SECRET và mật khẩu database riêng trong .env.
docker compose up --build -d
docker compose ps
```

Mở giao diện tại `http://localhost:5173`. Nginx của FE chuyển tiếp `/api/` và `/healthz` tới BE bên trong Docker. MySQL truy cập tại `localhost:3307`. Trên máy này, BE được mở ở `localhost:18080` vì cổng `8080` có thể đang được dự án local khác sử dụng.

Muốn dùng cổng BE mặc định `8080`, hãy xóa `BACKEND_HOST_PORT` khỏi `.env` hoặc đặt thành `8080`, sau khi xác nhận cổng đó đang trống.

## Nạp dữ liệu mẫu cho local

`database/scriptDb.sql` tạo schema gồm các bảng auth và commerce nhưng không seed dữ liệu. BE tự migration các bảng bảo mật còn thiếu khi `AUTO_MIGRATE=true`. Không chạy lại `scriptDb.sql` thủ công trên database đã có dữ liệu: file này có lệnh xóa và tạo lại database.

Khi các container đã chạy, nạp dữ liệu mẫu bằng PowerShell tại thư mục gốc repository:

```powershell
.\database\seed-local.ps1
```

Seed dùng các ID cố định khai báo trong file và có thể chạy lại; nó cập nhật lại các hàng mẫu đó, không xóa dữ liệu khác trong database. Tài khoản kiểm thử dùng chung mật khẩu `LocalTest123!`:

| Tài khoản | Email | Vai trò/trạng thái |
|---|---|---|
| Quản trị | `seed-admin@local.test` | admin, hoạt động |
| Người bán A | `seed-seller-a@local.test` | seller, shop hoạt động |
| Người mua | `seed-buyer@local.test` | client, hoạt động |
| Người bán B | `seed-seller-b@local.test` | seller, shop chờ duyệt |
| Người bán công nghệ | `seed-seller-tech@local.test` | seller, shop Tech World hoạt động |
| Tài khoản khóa | `seed-locked@local.test` | client, bị khóa để thử đăng nhập |
| Chưa xác minh email | `seed-unverified@local.test` | client, `email_verified=0` |

Seed tạo dữ liệu liên kết cho địa chỉ, shop, danh mục, thương hiệu, thuộc tính, sản phẩm/biến thể, kho, giỏ hàng, wishlist, voucher, phương thức giao hàng/thanh toán, đơn hàng, thanh toán, hoàn tiền, đánh giá, thông báo và audit log. Script không chèn vào `refresh_tokens`, `auth_refresh_history`, `password_reset_otps` vì đây là trạng thái phiên/OTP sống; không nên seed token giả.

Seed có các sản phẩm công nghệ `960004`–`960008` để kiểm tra xếp hạng tìm kiếm. Ví dụ gọi `GET /api/v1/products?q=iphone+pro+max`: sản phẩm có đủ ba từ trong tên được xếp trước sản phẩm chỉ khớp một phần. Seed local có thể chạy lại bằng lệnh ở trên.

FE hiện lấy danh mục và sản phẩm từ `GET /api/v1/categories` và `GET /api/v1/products`. Hồ sơ auth dùng `GET /api/v1/auth/me` và `PUT /api/v1/auth/profile`; đổi mật khẩu dùng `PUT /api/v1/auth/password`. Trang quản trị sản phẩm dùng `GET /api/v1/admin/products`, `GET /api/v1/admin/inventory-stats`, `PATCH /api/v1/admin/products/{id}/status`, `DELETE /api/v1/admin/products/{id}` và `POST /api/v1/admin/products/bulk`; các route quản trị yêu cầu role `ADMIN`. Giỏ hàng, tạo/sửa sản phẩm, checkout và các nghiệp vụ đơn hàng chưa có API để demo end-to-end.

Seed chỉ thay đổi dữ liệu DB local; các workflow CI/CD không theo dõi `database/**` hay `docs/**`. Các thay đổi code BE và FE vẫn kích hoạt workflow tương ứng khi push vào nhánh `build`.

Chỉ dùng các mật khẩu và tài khoản này với database local. Không chạy seed trên môi trường nhóm dùng chung hoặc production.

## Kiểm thử API auth

Chạy bộ smoke test trong PowerShell:

```powershell
$env:API_BASE_URL = 'http://localhost:18080'
./backend/scripts/smoke-api.ps1
```

Script tạo một tài khoản thử nghiệm có định danh ngẫu nhiên trong database local và kiểm tra đăng ký, đăng nhập bằng email/số điện thoại, xoay vòng và phát hiện dùng lại refresh token, từ chối quyền không đủ, đăng xuất, đổi mật khẩu và từ chối OTP sai định dạng. Script chỉ đổi mật khẩu tài khoản thử nghiệm do chính nó tạo.

Trong môi trường development, OTP đặt lại mật khẩu được ghi vào log của BE để có thể hoàn thành kiểm thử thủ công:

```powershell
docker compose logs -f backend
```

Chỉ dùng tài khoản local/kiểm thử với stack này. Khi triển khai production, cần secret riêng, HTTPS, `COOKIE_SECURE=true`, `AUTO_MIGRATE=false`, danh sách CORS chính xác dùng HTTPS và SMTP hỗ trợ STARTTLS.
