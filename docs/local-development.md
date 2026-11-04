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

`database/scriptDb.sql` tạo schema gồm các bảng auth và commerce nhưng không seed dữ liệu. BE tự chạy migration bảo mật và bổ sung `addresses.address_type`, `shops.approval_notes` còn thiếu khi `AUTO_MIGRATE=true`; khi triển khai thủ công, chạy `go run ./cmd/migrate` trước khi nâng BE. Không chạy lại `scriptDb.sql` thủ công trên database đã có dữ liệu: file này có lệnh xóa và tạo lại database.

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
| Người đăng ký shop B | `seed-seller-b@local.test` | client, shop chờ duyệt; chưa có role seller |
| Người bán công nghệ | `seed-seller-tech@local.test` | seller, shop Tech An Việt hoạt động |
| Tài khoản khóa | `seed-locked@local.test` | client, bị khóa để thử đăng nhập |
| Chưa xác minh email | `seed-unverified@local.test` | client, `email_verified=0` |

Seed tạo dữ liệu liên kết cho địa chỉ, shop, danh mục, thương hiệu, thuộc tính, sản phẩm/biến thể, kho, giỏ hàng, wishlist, voucher, phương thức giao hàng/thanh toán, đơn hàng, thanh toán, hoàn tiền, đánh giá, thông báo và audit log. Script không chèn vào `refresh_tokens`, `auth_refresh_history`, `password_reset_otps` vì đây là trạng thái phiên/OTP sống; không nên seed token giả.

Seed có 36 sản phẩm thuộc 12 danh mục và 10 thương hiệu, gồm thời trang, đồ gia dụng, cà phê, điện thoại và máy tính. Mỗi sản phẩm có ảnh và ít nhất một biến thể còn hàng; áo khoác có thuộc tính màu/kích cỡ, laptop có CPU/RAM và tùy chọn dung lượng lưu trữ. Có hai sản phẩm chờ duyệt để thử trạng thái seller; cửa hàng chờ duyệt không xuất hiện trong catalog công khai. Đơn hàng `SEED-ORDER-001` gồm sản phẩm từ hai shop đang hoạt động, có tổng tiền, phí, voucher, thanh toán, tồn kho và đánh giá liên kết nhất quán.

Các tên/description thương mại được dùng trên catalog; tài khoản bị khóa/chưa xác minh, shop pending và sản phẩm `960009` là fixture chuyên biệt để thử auth, duyệt shop và Postman. Giữ nguyên ID `960009` vì collection Postman dùng nó để kiểm thử tồn kho.

FE storefront gọi trực tiếp BE để tải danh mục, danh sách/tìm kiếm/chi tiết sản phẩm và shop công khai; auth, hồ sơ và sổ địa chỉ cũng dùng API BE. Adapter FE không tự tạo giá giảm, phần trăm Flash Sale, đánh giá 5 sao hay nhãn shop đã xác minh khi BE không trả các dữ liệu đó. Có thể kiểm tra nhanh qua FE tại `http://localhost:5173`, hoặc gọi `GET /api/v1/categories`, `GET /api/v1/products?limit=36`, `GET /api/v1/products?q=iphone+pro+max` và `GET /api/v1/products/960004`. Sản phẩm iPhone 15 Pro Max phải đứng trên sản phẩm phụ kiện khi tìm kiếm theo ba từ.

**Giới hạn tích hợp:** dashboard admin và quản lý đơn hàng hiện vẫn có dữ liệu mock phía FE vì BE chưa có API tương ứng. Trang quản lý shop cũng có một số thao tác/số liệu chưa được BE hỗ trợ. Không dùng các màn này để xác nhận dữ liệu đơn hàng/dashboard đã đồng bộ với DB; các API shop admin hiện có gồm danh sách, duyệt, từ chối và khóa shop.

Collection kiểm thử Postman bao phủ tất cả các route backend hiện tại, gồm cả fixture inventory riêng `960009`, được hướng dẫn tại [`postman/README.md`](../postman/README.md). Nạp lại seed sau mỗi lần chạy collection để khôi phục fixture này trước lượt test tiếp theo.

FE hiện lấy danh mục và sản phẩm từ `GET /api/v1/categories` và `GET /api/v1/products`. Hồ sơ auth dùng `GET /api/v1/auth/me` và `PUT /api/v1/auth/profile`; đổi mật khẩu dùng `PUT /api/v1/auth/password`. Shop onboarding, duyệt shop, seller product CRUD và address book có API; seller API chỉ hoạt động khi shop ACTIVE. Trang quản trị inventory dùng `/api/v1/admin/products` và các route liên quan, yêu cầu role `ADMIN`. Giỏ hàng, checkout và các nghiệp vụ đơn hàng chưa có API để demo end-to-end.

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
