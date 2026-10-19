# ĐẶC TẢ YÊU CẦU DỰ ÁN (SRS) E-Commerce Marketplace

**Mã dự án:** PRJ-MARKETPLACE-01

**Tên dự án:** E-Commerce Marketplace (sàn thương mại điện tử nhiều shop)

**Quy mô nhóm:** 3 thành viên (Frontend, Backend, DevOps)

**Thời gian phát triển:** 2 tuần

## 1. Tổng quan dự án (Project Overview)

### 1.1. Mục đích tài liệu

Tài liệu này đặc tả yêu cầu chức năng và phi chức năng cho hệ thống thương mại điện tử dạng marketplace (nhiều shop cùng bán trên một sàn). Tài liệu định hướng phạm vi công nghệ, kiến trúc, quy trình phối hợp và phân công công việc cho nhóm 3 người.

Do toàn bộ chức năng của một marketplace khá lớn so với quy mô 3 người, mỗi yêu cầu được gắn **mức ưu tiên** để nhóm biết phần nào bắt buộc làm trước và phần nào mở rộng sau:

- **P1 (MVP):** Bắt buộc hoàn thành, hệ thống phải chạy được luồng mua bán từ đầu đến cuối.
- **P2 (Mở rộng):** Làm sau khi P1 ổn định.
- **P3 (Nâng cao):** Chỉ làm nếu còn thời gian.

### 1.2. Phân vai nhân sự

- **Member 1 (Frontend):** Dựng giao diện ReactJS + Tailwind CSS cho 3 phân hệ (Storefront, Seller, Admin), quản lý state, tích hợp API, tối ưu UI/UX và responsive.
- **Member 2 (Backend):** Xây dựng kiến trúc Spring Boot, thiết kế và phát triển toàn bộ REST API (Auth, Catalog, Cart, Order, Seller, Admin, Payment), bảo mật JWT và phân quyền.
- **Member 3 (DevOps / Database / Testing / Team Lead):** Quản lý chung và điều phối tiến độ; thiết kế cơ sở dữ liệu (ERD, migration, seed data); thiết lập Docker, Docker Compose, GitHub Actions (CI/CD), deploy; viết test case và kiểm thử E2E.

### 1.3. Các phân hệ của hệ thống

Hệ thống gồm 3 phân hệ chính và các chức năng nền tảng dùng chung:

- **Storefront (Customer):** Trang bán hàng dành cho khách mua.
- **Seller (Vendor):** Trang quản lý dành cho chủ shop.
- **Admin:** Trang quản trị toàn hệ thống.
- **Cross-cutting:** Upload ảnh, thông báo, tìm kiếm, cache/queue, chat real-time, quản lý tồn kho, tích hợp vận chuyển.

## 2. Phạm vi tính năng

### 2.1. Phân hệ Storefront (Customer)

- **Tài khoản & xác thực:** Đăng ký, đăng nhập (email/SĐT, Google/Facebook), quên mật khẩu; quản lý hồ sơ cá nhân và sổ địa chỉ giao hàng.
- **Duyệt & tìm sản phẩm:** Trang chủ (banner, danh mục nổi bật, flash sale, gợi ý); danh mục, tìm kiếm, lọc (giá, thương hiệu, đánh giá, shop), sắp xếp; chi tiết sản phẩm (ảnh, mô tả, biến thể size/màu, tồn kho, đánh giá); trang shop và theo dõi shop.
- **Mua hàng:** Giỏ hàng (gộp theo shop), wishlist, checkout (địa chỉ, vận chuyển, thanh toán), mã giảm giá của sàn và của shop, thanh toán COD/chuyển khoản/ví điện tử/thẻ.
- **Sau mua hàng:** Lịch sử và theo dõi đơn hàng, hủy đơn, yêu cầu đổi/trả/hoàn tiền, đánh giá và bình luận, thông báo (email, push, in-app), chat với shop.

### 2.2. Phân hệ Seller (Vendor)

- Đăng ký mở shop, chờ admin duyệt.
- Quản lý thông tin shop (logo, banner, mô tả, địa chỉ kho).
- Quản lý sản phẩm: thêm/sửa/xóa, biến thể (SKU), ảnh, giá, tồn kho.
- Quản lý đơn hàng: xác nhận, đóng gói, giao cho đơn vị vận chuyển, xử lý hủy/trả.
- Quản lý khuyến mãi, voucher riêng của shop.
- Trả lời chat và đánh giá của khách.
- Thống kê: doanh thu, đơn hàng, sản phẩm bán chạy.
- Đối soát và rút tiền (số dư, hoa hồng đã trừ, yêu cầu rút).

### 2.3. Phân hệ Admin

- Quản lý người dùng (khách hàng, seller), khóa/mở tài khoản.
- Phân quyền RBAC: super admin, nhân viên, CSKH.
- Duyệt shop và duyệt sản phẩm.
- Quản lý danh mục, thương hiệu, thuộc tính sản phẩm dùng chung.
- Quản lý đơn hàng toàn sàn, xử lý tranh chấp.
- Khuyến mãi toàn sàn: voucher, flash sale, banner, chiến dịch.
- Tài chính: cấu hình % hoa hồng, đối soát, duyệt yêu cầu rút tiền.
- Cấu hình vận chuyển và thanh toán.
- Quản lý nội dung: banner, trang tĩnh, FAQ, chính sách.
- Báo cáo và dashboard: doanh thu, GMV, số user, top shop/sản phẩm.
- Kiểm duyệt đánh giá, báo cáo vi phạm.
- Nhật ký hoạt động (audit log).

### 2.4. Chức năng nền tảng (Cross-cutting)

- Upload và lưu trữ ảnh (S3/Cloudinary).
- Gửi email/SMS/push notification.
- Tìm kiếm (full-text của DB, Elasticsearch khi hệ thống lớn).
- Cache (Redis), queue cho tác vụ nặng (gửi mail, xử lý đơn).
- Real-time chat (WebSocket).
- Quản lý tồn kho, chống oversell khi nhiều người mua đồng thời.
- Tích hợp vận chuyển (GHN, GHTK, Viettel Post).

## 3. Yêu cầu kỹ thuật bắt buộc

### 3.1. Tech Stack

- **Frontend:** ReactJS (Vite + Tailwind CSS), React Router, Zustand (hoặc Redux Toolkit), Axios + React Query.
- **Backend:** Spring Boot (Java), Spring Security + JWT, Spring Data JPA, Swagger/OpenAPI.
- **Database:** MySQL (quản lý migration bằng Flyway/Liquibase), Redis (cache).
- **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD), Nginx.
- **Lưu trữ ảnh:** Cloudinary hoặc S3 (hoặc lưu local trong giai đoạn đầu).

### 3.2. Cấu hình Docker và Docker Compose

Hệ thống dùng Docker để đồng bộ môi trường giữa các thành viên:

- **MySQL Service:** Khởi tạo database tự động với biến môi trường chuẩn, volume lưu dữ liệu.
- **Redis Service:** Phục vụ cache và giỏ hàng/session khi cần.
- **Backend Service:** Build từ `Dockerfile` (OpenJDK + Gradle hoặc Maven).
- **Frontend Service:** Build từ `Dockerfile` (multi-stage: Node.js build static files, phục vụ bằng Nginx).
- Biến môi trường và secrets quản lý qua file `.env` (không commit lên Git) và GitHub Secrets.

### 3.3. Quy trình Git và CI/CD (GitHub Actions)

- **Nhánh:** `main` (Production), `dev` (Tích hợp), `feature/*` (từng tính năng). Mọi thay đổi vào `dev` và `main` đi qua Pull Request và có ít nhất 1 người review.
- **Khi tạo PR vào `dev`:** tự động chạy lint, unit test, build (Gradle/Maven build và Vite build).
- **Khi push lên `main`:** tự động build, chạy kiểm thử, đóng gói và đẩy Docker Image lên Registry, sau đó deploy lên server (SSH + docker compose).
- **Commit message:** theo quy ước thống nhất (ví dụ Conventional Commits) để có lịch sử hoạt động nhóm rõ ràng.

### 3.4. Quy ước API

- REST API có tiền tố `/api/v1`, dữ liệu JSON, response có cấu trúc thống nhất (`success`, `data`, `message`, `errors`).
- Phân trang bằng `page`, `size`, `sort`.
- Tài liệu API bằng Swagger/OpenAPI; **API contract được chốt trước** để FE và BE làm song song, FE dùng mock API khi BE chưa xong.
- Mã lỗi HTTP chuẩn (400, 401, 403, 404, 409, 500) và xử lý exception tập trung.

### 3.5. Thiết kế cơ sở dữ liệu sơ bộ

Các bảng chính (đặt tên snake_case): `users`, `roles`, `addresses`, `shops`, `categories`, `brands`, `products`, `product_variants` (SKU), `product_images`, `carts`, `cart_items`, `orders` (đơn tổng), `shop_orders` (đơn con theo shop), `order_items`, `payments`, `vouchers`, `reviews`, `wishlists`, `notifications`, `conversations`, `messages`, `withdrawals`, `audit_logs`.

Yêu cầu: khóa ngoại và index hợp lý, migration có version, có seed data cho môi trường dev/staging.

## 4. Yêu cầu chức năng (Functional Requirements)

Quy ước ưu tiên: **P1** MVP, **P2** mở rộng, **P3** nâng cao.

### 4.1. Phân hệ Storefront (Customer)

| ID    | Chức năng                  | Mô tả                                                                                                                                                                        | Ưu tiên |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| FR-01 | Đăng ký / Đăng nhập        | Đăng ký bằng email và mật khẩu; mật khẩu mã hóa BCrypt; đăng nhập thành công trả về JWT (access token, refresh token).                                                       | P1      |
| FR-02 | Quên mật khẩu              | Gửi email chứa liên kết/token đặt lại mật khẩu, token có thời hạn.                                                                                                           | P2      |
| FR-03 | Đăng nhập mạng xã hội      | Đăng nhập bằng Google/Facebook (OAuth2); đăng nhập bằng SĐT.                                                                                                                 | P3      |
| FR-04 | Hồ sơ cá nhân & sổ địa chỉ | Xem/cập nhật họ tên, email, SĐT, mật khẩu; thêm/sửa/xóa địa chỉ giao hàng, đặt địa chỉ mặc định.                                                                             | P1      |
| FR-05 | Trang chủ                  | Hiển thị banner, danh mục nổi bật, sản phẩm mới/bán chạy. Flash sale và gợi ý sản phẩm là P3.                                                                                | P2      |
| FR-06 | Danh mục, tìm kiếm, lọc    | Danh sách sản phẩm dạng lưới (ảnh, tên, giá, nút thêm vào giỏ); tìm theo từ khóa, lọc theo danh mục, phân trang. Lọc theo giá, thương hiệu, đánh giá, shop và sắp xếp là P2. | P1      |
| FR-07 | Chi tiết sản phẩm          | Hiển thị ảnh, mô tả, giá, biến thể (size/màu), tồn kho theo biến thể, đánh giá, thông tin shop.                                                                              | P1      |
| FR-08 | Trang shop                 | Xem thông tin và sản phẩm của một shop; theo dõi/bỏ theo dõi shop.                                                                                                           | P2      |
| FR-09 | Giỏ hàng                   | Thêm, sửa số lượng, xóa sản phẩm; hiển thị gộp theo shop; kiểm tra tồn kho khi thêm. Lưu ở Client (Zustand/LocalStorage) và đồng bộ lên server khi đã đăng nhập.             | P1      |
| FR-10 | Wishlist                   | Thêm/xóa sản phẩm yêu thích, xem danh sách.                                                                                                                                  | P2      |
| FR-11 | Checkout                   | Chọn địa chỉ, phương thức vận chuyển và thanh toán; hệ thống tách đơn theo shop, trừ tồn kho trong cùng một transaction và tạo đơn với trạng thái `PENDING`.                 | P1      |
| FR-12 | Voucher                    | Áp mã giảm giá của sàn và của shop; kiểm tra điều kiện, thời hạn, số lượt dùng.                                                                                              | P2      |
| FR-13 | Thanh toán                 | COD (P1); ví điện tử/thẻ qua VNPay, MoMo, Stripe ở môi trường sandbox (P2); chuyển khoản đối soát thủ công (P3).                                                             | P1      |
| FR-14 | Lịch sử & theo dõi đơn     | Xem danh sách đơn của cá nhân, chi tiết đơn và trạng thái từng bước.                                                                                                         | P1      |
| FR-15 | Hủy đơn, đổi/trả/hoàn tiền | Khách hủy đơn khi còn ở trạng thái cho phép (P2); yêu cầu đổi/trả/hoàn tiền (P3).                                                                                            | P2      |
| FR-16 | Đánh giá & bình luận       | Chỉ khách đã mua và nhận hàng mới được đánh giá (số sao, nội dung, ảnh).                                                                                                     | P2      |
| FR-17 | Thông báo                  | Thông báo email khi đặt hàng/đổi trạng thái (P2); push và in-app (P3).                                                                                                       | P2      |
| FR-18 | Chat với shop              | Khách nhắn tin real-time với shop qua WebSocket.                                                                                                                             | P3      |

### 4.2. Phân hệ Seller (Vendor)

| ID    | Chức năng                 | Mô tả                                                                                          | Ưu tiên |
| ----- | ------------------------- | ---------------------------------------------------------------------------------------------- | ------- |
| FR-19 | Đăng ký mở shop           | Người dùng gửi yêu cầu mở shop, trạng thái chờ duyệt; được duyệt mới có quyền SELLER.          | P1      |
| FR-20 | Quản lý thông tin shop    | Cập nhật tên, logo, banner, mô tả, địa chỉ kho.                                                | P2      |
| FR-21 | Quản lý sản phẩm          | CRUD sản phẩm với biến thể (SKU), ảnh, giá, tồn kho; chỉ thao tác trên sản phẩm của shop mình. | P1      |
| FR-22 | Quản lý đơn hàng của shop | Xem đơn con của shop, xác nhận, đóng gói, giao cho đơn vị vận chuyển, xử lý hủy/trả.           | P1      |
| FR-23 | Voucher của shop          | Tạo/sửa/tắt voucher riêng của shop.                                                            | P2      |
| FR-24 | Chat & đánh giá           | Trả lời chat và phản hồi đánh giá của khách.                                                   | P3      |
| FR-25 | Thống kê                  | Biểu đồ doanh thu, số đơn, sản phẩm bán chạy theo khoảng thời gian.                            | P2      |
| FR-26 | Đối soát & rút tiền       | Xem số dư, hoa hồng đã trừ, gửi yêu cầu rút tiền.                                              | P3      |

### 4.3. Phân hệ Admin

| ID    | Chức năng                         | Mô tả                                                                               | Ưu tiên |
| ----- | --------------------------------- | ----------------------------------------------------------------------------------- | ------- |
| FR-27 | Quản lý người dùng                | Xem danh sách khách hàng và seller, khóa/mở tài khoản.                              | P1      |
| FR-28 | Phân quyền RBAC                   | Vai trò CUSTOMER, SELLER, ADMIN (P1); mở rộng nhân viên, CSKH, quyền chi tiết (P3). | P1      |
| FR-29 | Duyệt shop & sản phẩm             | Duyệt hoặc từ chối yêu cầu mở shop (P1); duyệt sản phẩm trước khi hiển thị (P2).    | P1      |
| FR-30 | Danh mục, thương hiệu, thuộc tính | CRUD danh mục (nhiều cấp), thương hiệu, thuộc tính dùng chung.                      | P1      |
| FR-31 | Quản lý đơn hàng toàn sàn         | Xem toàn bộ đơn, cập nhật trạng thái; xử lý tranh chấp (P3).                        | P1      |
| FR-32 | Khuyến mãi toàn sàn               | Voucher sàn, flash sale, banner, chiến dịch.                                        | P2      |
| FR-33 | Tài chính                         | Cấu hình % hoa hồng (P2); đối soát và duyệt rút tiền (P3).                          | P2      |
| FR-34 | Cấu hình vận chuyển & thanh toán  | Bật/tắt phương thức, cấu hình phí vận chuyển.                                       | P2      |
| FR-35 | Quản lý nội dung                  | Banner, trang tĩnh, FAQ, chính sách.                                                | P2      |
| FR-36 | Báo cáo & dashboard               | Doanh thu, GMV, số user, top shop và top sản phẩm.                                  | P2      |
| FR-37 | Kiểm duyệt nội dung               | Xử lý đánh giá và báo cáo vi phạm.                                                  | P3      |
| FR-38 | Nhật ký hoạt động                 | Ghi audit log các thao tác quan trọng của admin/seller.                             | P2      |

### 4.4. Chức năng nền tảng (Cross-cutting)

| ID    | Chức năng                       | Mô tả                                                                                                                                                    | Ưu tiên |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| FR-39 | Upload & lưu trữ ảnh            | Upload ảnh sản phẩm/shop/avatar, giới hạn định dạng và dung lượng, trả về URL.                                                                           | P1      |
| FR-40 | Gửi email/SMS/push              | Dịch vụ thông báo dùng chung, gửi bất đồng bộ.                                                                                                           | P2      |
| FR-41 | Tìm kiếm nâng cao               | Full-text search của DB (P2); Elasticsearch khi dữ liệu lớn (P3).                                                                                        | P3      |
| FR-42 | Cache & queue                   | Cache danh sách sản phẩm, danh mục bằng Redis; queue cho gửi mail, xử lý đơn.                                                                            | P2      |
| FR-43 | Real-time chat                  | Hạ tầng WebSocket/STOMP phục vụ chat và thông báo.                                                                                                       | P3      |
| FR-44 | Quản lý tồn kho, chống oversell | Trừ tồn kho trong transaction với khóa (optimistic/pessimistic lock) để không bán vượt số lượng khi nhiều người mua đồng thời; hoàn tồn kho khi hủy đơn. | P1      |
| FR-45 | Tích hợp vận chuyển             | Tính phí ship cố định/mock (P2); tích hợp GHN, GHTK, Viettel Post (P3).                                                                                  | P3      |

### 4.5. Luồng trạng thái đơn hàng

- Luồng chính: `PENDING` → `CONFIRMED` → `PACKING` → `SHIPPING` → `COMPLETED`.
- Nhánh phụ: `CANCELLED` (khi còn `PENDING`/`CONFIRMED`), `RETURNED` (P3).
- Mỗi đơn tổng (`orders`) gồm nhiều đơn con theo shop (`shop_orders`); seller chỉ cập nhật đơn con của shop mình, admin xem và can thiệp toàn bộ.

## 5. Yêu cầu phi chức năng (Non-Functional Requirements)

### 5.1. Hiệu năng và khả năng chịu tải

- **NFR-01 (Thời gian phản hồi API):** Các API danh sách sản phẩm, chi tiết sản phẩm và giỏ hàng phản hồi dưới **500ms** trong điều kiện mạng nội bộ hoặc cloud chuẩn.
- **NFR-02 (Tải trang Frontend):** First Contentful Paint của ứng dụng ReactJS (Vite) dưới **2 giây**; áp dụng lazy load, phân trang, tối ưu ảnh.
- **NFR-03 (Tải đồng thời):** Hệ thống chạy qua Docker chịu tối thiểu **50 request đồng thời** mà không sập hay tràn bộ nhớ.
- **NFR-04 (Toàn vẹn tồn kho):** Khi nhiều người đặt cùng một sản phẩm, số lượng bán ra không vượt tồn kho (kiểm chứng bằng test đồng thời).

### 5.2. Bảo mật

- **NFR-05 (Mã hóa mật khẩu):** Mật khẩu mã hóa một chiều bằng **BCrypt** trước khi lưu vào MySQL.
- **NFR-06 (Xác thực và phân quyền):** API nhạy cảm (đặt hàng, quản lý shop, admin) bảo vệ bằng **JWT** có thời gian hết hạn rõ ràng; kiểm soát truy cập theo vai trò (CUSTOMER, SELLER, ADMIN) và theo quyền sở hữu dữ liệu (seller chỉ sửa dữ liệu của shop mình).
- **NFR-07 (CORS):** Cấu hình CORS chặt chẽ, chỉ cho phép nguồn Frontend gọi API.
- **NFR-08 (Dữ liệu đầu vào):** Validate toàn bộ input ở BE, chống SQL injection (dùng JPA/prepared statement) và XSS; không lưu secrets trong mã nguồn.

### 5.3. Bảo trì và phát triển

- **NFR-09 (Container hóa):** 100% thành phần (Frontend, Backend, MySQL, Redis) đóng gói bằng **Docker** để đồng nhất môi trường local và production.
- **NFR-10 (Tự động hóa CI/CD):** Mọi thay đổi vào nhánh chính phải qua quy trình build và test tự động bằng **GitHub Actions**.
- **NFR-11 (Clean code và logging):** Đặt tên chuẩn (camelCase cho Java/JS, snake_case cho database); Backend dùng Logback/SLF4J ghi log lỗi quan trọng.
- **NFR-12 (Sao lưu dữ liệu):** Có cơ chế backup database định kỳ và quy trình restore đã được thử.

### 5.4. Trải nghiệm người dùng và tương thích

- **NFR-13 (Responsive):** Giao diện Tailwind CSS tương thích Mobile, Tablet và Desktop.
- **NFR-14 (Trình duyệt):** Hoạt động ổn định trên Chrome, Edge, Safari, Firefox bản hiện đại.

## 6. Phân công công việc theo thành viên

### 6.1. Member 1: Frontend (ReactJS)

- Khởi tạo project Vite, cấu trúc thư mục, ESLint/Prettier, thiết lập routing và state.
- Xây dựng component dùng chung (Header, ProductCard, Modal, Form, Pagination...).
- Storefront: đăng ký/đăng nhập, trang chủ, danh sách/tìm kiếm/lọc, chi tiết sản phẩm, giỏ hàng, checkout, lịch sử đơn, hồ sơ và sổ địa chỉ.
- Seller: đăng ký shop, quản lý sản phẩm/biến thể, quản lý đơn của shop, thống kê.
- Admin: quản lý người dùng, duyệt shop, danh mục, đơn hàng, dashboard.
- Xử lý loading, lỗi, validate form, responsive; route bảo vệ theo vai trò.
- Dùng mock API (MSW/JSON Server) khi BE chưa sẵn sàng; viết test component (Vitest, React Testing Library).

### 6.2. Member 2: Backend (Spring Boot)

- Khởi tạo project, cấu trúc layer (controller, service, repository, entity, DTO), profile dev/staging/prod, xử lý exception tập trung.
- Spring Security + JWT, phân quyền theo vai trò và quyền sở hữu.
- API theo module: auth, user, address, shop, category/brand, product/variant, cart, order/shop_order, payment, voucher, review, notification, admin.
- Nghiệp vụ lõi: tách đơn theo shop, trừ/hoàn tồn kho có khóa, tính giá/voucher/phí ship, chuyển trạng thái đơn hợp lệ.
- Tích hợp upload ảnh, email, cổng thanh toán sandbox, Redis cache.
- Swagger/OpenAPI, unit test và integration test (JUnit, Mockito).

### 6.3. Member 3: DevOps, Database, Testing, Team Lead

- **Lead:** Chia sprint/backlog, theo dõi tiến độ, chốt phạm vi và API contract cùng FE/BE, review PR, kiểm soát lịch sử Git.
- **Database:** Thiết kế ERD, tạo schema, index, migration (Flyway/Liquibase), seed data, tối ưu query, backup/restore.
- **DevOps:** Dockerfile cho FE/BE, `docker-compose` toàn hệ thống, quản lý biến môi trường/secrets, GitHub Actions (lint, test, build, push image, deploy), dựng server (VPS/cloud), Nginx reverse proxy, domain, SSL, healthcheck, log và monitoring cơ bản.
- **Testing:** Viết test plan, test case, kiểm thử E2E (Playwright/Cypress hoặc thủ công), kiểm thử tải cơ bản (k6/JMeter), báo cáo kết quả test.

## 7. Kiểm thử và tiêu chí nghiệm thu

- **Các mức kiểm thử:** Unit test (BE, FE), integration test API, E2E cho luồng chính, kiểm thử phi chức năng (hiệu năng, bảo mật cơ bản, đồng thời).
- **Luồng E2E bắt buộc (P1):** đăng ký, đăng nhập, xem và tìm sản phẩm, thêm giỏ hàng, checkout COD, xem lịch sử đơn; seller tạo sản phẩm và xử lý đơn; admin duyệt shop và quản lý đơn.
- **Tiêu chí đạt:** Các chức năng P1 chạy đúng cả Frontend và Backend, không có lỗi nghiêm trọng; tỷ lệ test case đạt từ **80%** trở lên, có test case và test result cụ thể; CI/CD chạy thành công; lịch sử commit thể hiện đóng góp của cả 3 thành viên.

## 8. Lộ trình triển khai theo giai đoạn

| Giai đoạn          | Mục tiêu                           | Nội dung chính                                                                                                                                                           |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Nền tảng và MVP | Luồng mua bán chạy được end-to-end | Chốt phạm vi, ERD, API contract, docker-compose, CI cơ bản; tất cả yêu cầu P1 (auth, catalog, giỏ hàng, checkout COD, đơn hàng, seller và admin cơ bản, chống oversell). |
| 2. Mở rộng         | Hoàn thiện trải nghiệm marketplace | Yêu cầu P2: voucher, thanh toán sandbox, đánh giá, wishlist, thông báo email, thống kê, dashboard, cache Redis, audit log, CD lên server.                                |
| 3. Nâng cao        | Tính năng khó và tối ưu            | Yêu cầu P3: chat real-time, đổi/trả/hoàn tiền, đối soát rút tiền, tích hợp vận chuyển, đăng nhập mạng xã hội, Elasticsearch, flash sale.                                 |

## 9. Rủi ro và giải pháp

| Rủi ro                                               | Giải pháp                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Phạm vi marketplace lớn so với nhóm 3 người          | Bám theo mức ưu tiên P1/P2/P3, chỉ chuyển giai đoạn khi giai đoạn trước ổn định.                    |
| FE và BE chờ nhau                                    | Chốt API contract sớm, FE dùng mock API, BE cung cấp Swagger.                                       |
| Member 3 gánh nhiều vai trò (lead, DB, DevOps, test) | Hoàn thành hạ tầng (Docker, CI, ERD) ngay giai đoạn đầu; FE/BE tự viết unit test cho phần của mình. |
| Lỗi tồn kho khi đặt hàng đồng thời                   | Dùng transaction và khóa, có test đồng thời riêng.                                                  |
| Xung đột code khi merge                              | Quy ước nhánh, PR nhỏ, review chéo, merge vào `dev` thường xuyên.                                   |
