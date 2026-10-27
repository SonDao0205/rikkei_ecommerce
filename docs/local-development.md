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
