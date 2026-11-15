**Mã dự án:** PRJ-RKE-OJT-05  
**Tên dự án:** Rikkei E-Commerce (MVP)  
**Thời gian phát triển:** 2 tuần

## **1\. Tổng quan Dự án (Project Overview)**

### **1.1. Mục đích tài liệu**

Tài liệu này đặc tả các yêu cầu kỹ thuật và chức năng cho dự án thương mại điện tử tối thiểu khả thi (MVP). Được thiết kế riêng cho chu kỳ phát triển 1 tuần với đội ngũ 3 người, tài liệu định hướng rõ ràng phạm vi công nghệ, cấu trúc hệ thống, API, cũng như quy trình phối hợp DevOps.

### **1.2. Phân vai nhân sự**

* **Quy mô nhân sự:** 3 thành viên / 1 nhóm  
* **Member 1 (Team Lead / Devops):** Quản lý chung và điều phối tiến độ; thiết kế cơ sở dữ liệu, thiết lập Docker, Docker Compose, GitHub Actions (CI/CD), deploy; viết test case và kiểm thử E2E.  
* **Member 2 (Frontend Developers):**  
  * Dựng giao diện bằng ReactJS \+ Tailwind CSS, xử lý State (Zustand), tích hợp API và tối ưu UI/UX.  
* **Member 3 (Backend Developers):**  
  * Khởi tạo và phát triển REST API \`/api/v1\` bằng Go; triển khai xác thực/RBAC, hồ sơ khách hàng, sản phẩm, shop, giỏ hàng, đơn hàng và API Admin. Viết test và cung cấp API contract cho FE.

### **1.3. Các phân hệ của hệ thống**

Hệ thống gồm 3 phân hệ chính và các chức năng nền tảng dùng chung:

* **Storefront (Client):** Trang bán hàng dành cho khách mua.  
* **Seller:** Trang quản lý dành cho chủ shop.  
* **Admin:** Trang quản trị toàn hệ thống.

## **2\. Phạm vi tính năng**

### **2.1. Phân hệ Storefront (Client)**

* **Tài khoản & xác thực:** Đăng ký, đăng nhập (email/SĐT, Google/Facebook), quên mật khẩu; quản lý hồ sơ cá nhân và sổ địa chỉ giao hàng.  
* **Duyệt & tìm sản phẩm:** Trang chủ (banner, danh mục nổi bật, flash sale, gợi ý); danh mục, tìm kiếm, lọc (giá, thương hiệu, đánh giá, shop), sắp xếp; chi tiết sản phẩm (ảnh, mô tả, biến thể size/màu, tồn kho); trang shop và theo dõi shop.  
* **Mua hàng:** Giỏ hàng (gộp theo shop), wishlist, checkout (địa chỉ, vận chuyển, thanh toán), mã giảm giá của sàn và của shop, thanh toán COD/chuyển khoản/ví điện tử/thẻ.  
* **Sau mua hàng:** Lịch sử và theo dõi đơn hàng, hủy đơn, yêu cầu đổi/trả/hoàn tiền, đánh giá, thông báo (email).

### **2.2. Phân hệ Seller (Vendor)**

* Đăng ký mở shop, chờ admin duyệt.  
* Quản lý thông tin shop (logo, banner, mô tả, địa chỉ kho).  
* Quản lý sản phẩm: thêm/sửa/xóa, biến thể (SKU), ảnh, giá, tồn kho.  
* Quản lý đơn hàng: xác nhận, đóng gói, giao cho đơn vị vận chuyển, xử lý hủy/trả.  
* Quản lý khuyến mãi, voucher riêng của shop.  
* Thống kê: doanh thu, đơn hàng, sản phẩm bán chạy.

### **2.3. Phân hệ Admin**

* Quản lý người dùng (khách hàng, seller), khóa/mở tài khoản.  
* Phân quyền RBAC: super admin, nhân viên, CSKH.  
* Duyệt shop và duyệt sản phẩm.  
* Quản lý danh mục, thương hiệu, thuộc tính sản phẩm dùng chung.  
* Quản lý đơn hàng toàn sàn.  
* Khuyến mãi toàn sàn: voucher, flash sale, banner, chiến dịch.  
* Cấu hình vận chuyển và thanh toán.  
* Báo cáo và dashboard: doanh thu, GMV, số user, top shop/sản phẩm.  
* Kiểm duyệt đánh giá, báo cáo vi phạm.  
* Nhật ký hoạt động (audit log).

### **2.4. Chức năng nền tảng (Cross-cutting)**

* Upload và lưu trữ ảnh (Cloudinary).  
* Gửi email/push notification.  
* Tìm kiếm (full-text của DB, Elasticsearch khi hệ thống lớn).  
* Cache (Redis), queue cho tác vụ nặng (gửi mail, xử lý đơn).  
* Quản lý tồn kho, chống oversell khi nhiều người mua đồng thời.

## **3\. Yêu cầu kỹ thuật bắt buộc**

### **3.1. Tech Stack**

* **Frontend:** ReactJS (Vite \+ Tailwind CSS), React Router, Redux Toolkit, Axios.  
* **Backend:** Go 1.24+, REST API với net/http, MySQL 8.4 với database/sql, JWT và bcrypt để xác thực, phân quyền và bảo vệ mật khẩu.  
* **Database:** MySQL (quản lý migration bằng Flyway), Redis (cache).  
* **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD), Nginx.  
* **Lưu trữ ảnh:** Cloudinary.

### **3.2. Cấu hình Docker và Docker Compose**

Hệ thống dùng Docker để đồng bộ môi trường giữa các thành viên:

* **MySQL Service:** Khởi tạo database tự động với biến môi trường chuẩn, volume lưu dữ liệu.  
* **Redis Service:** Phục vụ cache và giỏ hàng/session khi cần.  
* **Backend Service:** Build từ Dockerfile (multi-stage : stage 1 sử dụng golang:1.24-alpine để go mod download và build binary tĩnh ./cmd/api \- stage 2 chạy trên alpine:3.22 (non-root appuser, cổng 8080).  
* **Frontend Service:** Build từ Dockerfile (multi-stage: Node.js build static files, phục vụ bằng Nginx).  
* Biến môi trường và secrets quản lý qua file .env (không commit lên Git) và GitHub Secrets.

### **3.3. Quy trình Git và CI/CD (GitHub Actions)**

* **Nhánh:** main (Production), build (Tích hợp). Mọi thay đổi vào build và main đi qua Pull Request và có ít nhất 1 người review.  
* **Khi tạo PR vào build:** GitHub Actions tự chạy theo từng framework: Backend (Go) gồm gofmt → go vet ./... → go test ./... → go build ./cmd/api; Frontend (React) gồm npm ci → npm run lint → npm run build  
* **Khi push lên main:** tự động build, chạy kiểm thử, đóng gói và đẩy Docker Image lên Registry, sau đó deploy lên server (SSH \+ docker compose).  
* **Commit message:** theo quy ước thống nhất để có lịch sử hoạt động nhóm rõ ràng.

### **3.4. Quy ước API**

* REST API có tiền tố /api/v1, dữ liệu JSON, response có cấu trúc thống nhất (success, data, message, errors).  
* Phân trang bằng page, size, sort.  
* Tài liệu API bằng Swagger/OpenAPI; **API contract được chốt trước** để FE và BE làm song song, FE dùng mock API khi BE chưa xong.  
* Mã lỗi HTTP chuẩn (400, 401, 403, 404, 409, 500\) và xử lý exception tập trung.

## **4\. Yêu cầu chức năng (Functional Requirements)**

### **4.1. Phân hệ Storefront (Client)**

| ID | Chức năng | Mô tả |
| ----- | ----- | ----- |
| FR-01 | Đăng ký / Đăng nhập | Đăng ký bằng email và mật khẩu; mật khẩu mã hóa; đăng nhập thành công trả về JWT (access token, refresh token). |
| FR-02 | Quên mật khẩu | Nhập email hoặc số điện thoại đăng ký tài khoản và nhận về mã OTP xác nhận người dùng và đổi mật khẩu |
| FR-04 | Hồ sơ cá nhân & sổ địa chỉ | Xem/cập nhật họ tên, email, SĐT, mật khẩu; thêm/sửa/xóa địa chỉ giao hàng, đặt địa chỉ mặc định. |
| FR-05 | Trang chủ | Hiển thị banner, danh mục nổi bật, sản phẩm mới/bán chạy. Flash sale và gợi ý sản phẩm |
| FR-06 | Danh mục, tìm kiếm, lọc | Danh sách sản phẩm dạng lưới (ảnh, tên, giá, nút thêm vào giỏ); tìm theo từ khóa, lọc theo danh mục, phân trang. Lọc theo giá, thương hiệu, đánh giá, shop và sắp xếp.  |
| FR-07 | Chi tiết sản phẩm | Hiển thị ảnh, mô tả, giá, biến thể (size/màu), tồn kho theo biến thể, đánh giá, thông tin shop. |
| FR-08 | Trang shop | Xem thông tin và sản phẩm của một shop; theo dõi/bỏ theo dõi shop. |
| FR-09 | Giỏ hàng | Thêm, sửa số lượng, xóa sản phẩm; hiển thị gộp theo shop; kiểm tra tồn kho khi thêm. Lưu ở Client (Localstorage) và đồng bộ lên server khi đã đăng nhập. |
| FR-10 | Wishlist | Thêm/xóa sản phẩm yêu thích, xem danh sách. |
| FR-11 | Checkout | Chọn địa chỉ, phương thức vận chuyển và thanh toán; hệ thống tách đơn theo shop, trừ tồn kho trong cùng một transaction và tạo đơn với trạng thái PENDING. |
| FR-12 | Voucher | Áp mã giảm giá của sàn và của shop; kiểm tra điều kiện, thời hạn, số lượt dùng. |
| FR-13 | Thanh toán | COD ; ví điện tử/thẻ qua VNPay, MoMo; chuyển khoản đối soát thủ công. |
| FR-14 | Lịch sử & theo dõi đơn | Xem danh sách đơn của cá nhân, chi tiết đơn và trạng thái từng bước. |
| FR-15 | Hủy đơn, đổi/trả/hoàn tiền | Khách hủy đơn khi còn ở trạng thái cho phép; yêu cầu đổi/trả/hoàn tiền. |
| FR-16 | Đánh giá & bình luận | Chỉ khách đã mua và nhận hàng mới được đánh giá (nội dung, ảnh). |
| FR-17 | Thông báo | Thông báo email khi đặt hàng/đổi trạng thái; push notification. |

### **4.2. Phân hệ Seller (Vendor)**

| ID | Chức năng | Mô tả |
| ----- | ----- | ----- |
| FR-19 | Đăng ký mở shop | Người dùng gửi yêu cầu mở shop, trạng thái chờ duyệt; được duyệt mới có quyền SELLER. |
| FR-20 | Quản lý thông tin shop | Cập nhật tên, logo, banner, mô tả, địa chỉ kho. |
| FR-21 | Quản lý sản phẩm | CRUD sản phẩm với biến thể (SKU), ảnh, giá, tồn kho; chỉ thao tác trên sản phẩm của shop mình. |
| FR-22 | Quản lý đơn hàng của shop | Xem đơn con của shop, xác nhận, đóng gói, giao cho đơn vị vận chuyển, xử lý hủy/trả. |
| FR-23 | Voucher của shop | Tạo/sửa/tắt voucher riêng của shop. |
| FR-24 | Đánh giá | Trả lời phản hồi đánh giá của khách. |
| FR-25 | Thống kê | Biểu đồ doanh thu, số đơn, sản phẩm bán chạy theo khoảng thời gian. |

### **4.3. Phân hệ Admin**

| ID | Chức năng | Mô tả |
| ----- | ----- | ----- |
| FR-27 | Quản lý người dùng | Xem danh sách khách hàng và seller, khóa/mở tài khoản. |
| FR-28 | Phân quyền RBAC | Vai trò CLIENT, SELLER, ADMIN |
| FR-29 | Duyệt shop & sản phẩm | Duyệt hoặc từ chối yêu cầu mở shop; duyệt sản phẩm trước khi hiển thị . |
| FR-30 | Danh mục, thương hiệu, thuộc tính | CRUD danh mục , thương hiệu, thuộc tính dùng chung. |
| FR-31 | Quản lý đơn hàng toàn sàn | Xem toàn bộ đơn, cập nhật trạng thái; xử lý tranh chấp . |
| FR-32 | Khuyến mãi toàn sàn | Voucher sàn, flash sale. |
| FR-34 | Cấu hình vận chuyển & thanh toán | Bật/tắt phương thức, cấu hình phí vận chuyển. |
| FR-36 | Báo cáo & dashboard | Doanh thu, số user, top shop và top sản phẩm. |
| FR-37 | Kiểm duyệt nội dung | Xử lý đánh giá và báo cáo vi phạm. |
| FR-38 | Nhật ký hoạt động | Ghi audit log các thao tác quan trọng của admin/seller. |

### **4.4. Chức năng nền tảng (Cross-cutting)**

| ID | Chức năng | Mô tả |
| ----- | ----- | ----- |
| FR-39 | Upload & lưu trữ ảnh | Upload ảnh sản phẩm/shop/avatar, giới hạn định dạng và dung lượng, trả về URL. |
| FR-40 | Gửi email/SMS/push | Dịch vụ thông báo dùng chung, gửi bất đồng bộ. |
| FR-41 | Tìm kiếm nâng cao | Full-text search của DB; Elasticsearch khi dữ liệu lớn. |
| FR-42 | Cache & queue | Cache danh sách sản phẩm, danh mục bằng Redis; queue cho gửi mail, xử lý đơn. |
| FR-44 | Quản lý tồn kho, chống oversell | Trừ tồn kho trong transaction với khóa để không bán vượt số lượng khi nhiều người mua đồng thời; hoàn tồn kho khi hủy đơn. |
| FR-45 | Tích hợp vận chuyển | Tính phí ship cố định/mock |

### **4.5. Luồng trạng thái đơn hàng**

* Luồng chính: PENDING → CONFIRMED → PACKING → SHIPPING → COMPLETED.  
* Nhánh phụ: CANCELLED (khi còn PENDING/CONFIRMED), RETURNED (P3).  
* Mỗi đơn tổng (orders) gồm nhiều đơn con theo shop (shop\_orders); seller chỉ cập nhật đơn con của shop mình, admin xem và can thiệp toàn bộ.

## **5\. Yêu cầu phi chức năng (Non-Functional Requirements)**

### **5.1. Hiệu năng và khả năng chịu tải**

* **NFR-01 (Thời gian phản hồi API):** Các API danh sách sản phẩm, chi tiết sản phẩm và giỏ hàng phản hồi dưới **500ms** trong điều kiện mạng nội bộ hoặc cloud chuẩn.  
* **NFR-02 (Tải trang Frontend):** First Contentful Paint của ứng dụng ReactJS (Vite) dưới **2 giây**; áp dụng lazy load, phân trang, tối ưu ảnh.  
* **NFR-03 (Tải đồng thời):** Hệ thống chạy qua Docker chịu tối thiểu **50 request đồng thời** mà không sập hay tràn bộ nhớ.  
* **NFR-04 (Toàn vẹn tồn kho):** Khi nhiều người đặt cùng một sản phẩm, số lượng bán ra không vượt tồn kho (kiểm chứng bằng test đồng thời).

### **5.2. Bảo mật**

* **NFR-05 (Mã hóa mật khẩu):** Mật khẩu mã hóa một chiều trước khi lưu vào MySQL.  
* **NFR-06 (Xác thực và phân quyền):** API nhạy cảm (đặt hàng, quản lý shop, admin) bảo vệ bằng **JWT** có thời gian hết hạn rõ ràng; kiểm soát truy cập theo vai trò (CLIENT, SELLER, ADMIN) và theo quyền sở hữu dữ liệu (seller chỉ sửa dữ liệu của shop mình).  
* **NFR-07 (CORS):** Cấu hình CORS chặt chẽ, chỉ cho phép nguồn Frontend gọi API.  
* **NFR-08 (Dữ liệu đầu vào):** Validate toàn bộ input ở BE, chống SQL injection và XSS; không lưu secrets trong mã nguồn.

### **5.3. Bảo trì và phát triển**

* **NFR-09 (Container hóa):** 100% thành phần (Frontend, Backend, MySQL, Redis) đóng gói bằng **Docker** để đồng nhất môi trường local và production.  
* **NFR-10 (Tự động hóa CI/CD):** Mọi thay đổi vào nhánh chính phải qua quy trình build và test tự động bằng **GitHub Actions**.  
* **NFR-11 (Clean code và logging):** Đặt tên chuẩn ; Backend ghi log lỗi quan trọng.  
* **NFR-12 (Sao lưu dữ liệu):** Có cơ chế backup database định kỳ và quy trình restore đã được thử.

### **5.4. Trải nghiệm người dùng và tương thích**

* **NFR-13 (Responsive):** Giao diện Tailwind CSS tương thích Mobile, Tablet và Desktop.  
* **NFR-14 (Trình duyệt):** Hoạt động ổn định trên Chrome, Edge, Safari, Firefox bản hiện đại.

## **6\. Kiểm thử và tiêu chí nghiệm thu**

* **Các mức kiểm thử:** Unit test (BE, FE), integration test API, E2E cho luồng chính, kiểm thử phi chức năng (hiệu năng, bảo mật cơ bản, đồng thời).  
* **Luồng E2E bắt buộc :** đăng ký, đăng nhập, xem và tìm sản phẩm, thêm giỏ hàng, checkout COD, xem lịch sử đơn; seller tạo sản phẩm và xử lý đơn; admin duyệt shop và quản lý đơn.  
* **Tiêu chí đạt:** Các chức năng chạy đúng cả Frontend và Backend, không có lỗi nghiêm trọng; tỷ lệ test case đạt từ **80%** trở lên, có test case và test result cụ thể; CI/CD chạy thành công; lịch sử commit thể hiện đóng góp của cả 3 thành viên.

## **7\. Rủi ro và giải pháp**

| Rủi ro | Giải pháp |
| ----- | ----- |
| FE và BE chờ nhau | Chốt API contract sớm, FE dùng mock API, BE cung cấp Swagger. |
| Lỗi tồn kho khi đặt hàng đồng thời | Dùng transaction và khóa, có test đồng thời riêng. |
| Xung đột code khi merge | Quy ước nhánh, PR nhỏ, review chéo, merge vào `dev` thường xuyên. |

