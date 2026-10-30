# API catalog và quản lý tồn kho

Các API dùng JSON envelope `{ "success": true, "data": ... }`. URL dưới đây được FE gọi qua proxy `http://localhost:5173`; khi gọi trực tiếp BE local, dùng `http://localhost:18080`.

## API công khai

### `GET /api/v1/categories`

Trả danh mục đang hoạt động. Danh mục tổng hợp **Tất cả** có `id: 0`.

### `GET /api/v1/products`

Tham số query:

| Tham số | Ví dụ | Mặc định/giới hạn |
|---|---|---|
| `q` | `iphone pro max` | Tìm theo từng từ trong tên sản phẩm; tối đa 100 ký tự. Kết quả được xếp theo tỷ lệ từ trong query khớp tên từ cao xuống thấp. Dùng MySQL FULLTEXT prefix matching; từ ngắn được xử lý riêng và có fallback tìm kiếm. `search` được hỗ trợ như alias cũ; không gửi cả hai. |
| `category_id` | `930001` | `0` nghĩa là tất cả; không nhận số âm |
| `brand_id` | `940001` | ID thương hiệu dương |
| `shop_id` | `920001` | ID shop dương |
| `min_price`, `max_price` | `100000`, `500000` | Giá không âm; giá nhỏ nhất không được lớn hơn giá lớn nhất |
| `min_rating` | `4.5` | Từ `0` đến `5` |
| `sort` | `best_selling` | `latest`; hỗ trợ `price_asc`, `price_desc`, `best_selling`, `latest` |
| `page` | `1` | Mặc định `1`, từ `1` đến `100000` |
| `limit` | `16` | Mặc định `100`, tối đa `100` |

Ví dụ: `GET /api/v1/products?q=iphone+pro+max&category_id=930005&page=1&limit=16`. Với sản phẩm tên `Apple iPhone 15 Pro Max 256GB`, từ `15` không làm mất kết quả: các token `iphone`, `pro`, `max` được so khớp độc lập, nên sản phẩm có đủ ba token xếp trên sản phẩm chỉ có hai token. Các kết quả có cùng tỷ lệ khớp tiếp tục dùng `sort` đã chọn để sắp xếp. Nếu FULLTEXT không tìm được sản phẩm nào theo tên, backend dùng tìm kiếm chứa token trên tên/mô tả/shop để giữ tương thích với các từ ngắn hoặc thuật ngữ không được FULLTEXT lập chỉ mục.

`data` có dạng `{ "products": [...], "total": 2, "page": 1, "limit": 16 }`. Chỉ sản phẩm đang hoạt động, chưa bị xóa, thuộc shop đang hoạt động và danh mục đang hoạt động được trả về. Mỗi sản phẩm có thông tin shop/category, giá, rating và tổng tồn kho biến thể đang hoạt động. Mọi query parameter không được hỗ trợ, giá trị lặp, sort không hợp lệ hoặc filter ngoài giới hạn trả `400`.

### `GET /api/v1/products/{id}`

Trả chi tiết sản phẩm đang được niêm yết, tối đa 100 ảnh và 100 biến thể đang hoạt động cùng SKU/giá/tồn kho/thuộc tính, kèm thông tin shop công khai. Sản phẩm ẩn, chưa duyệt, đã xóa hoặc thuộc shop/danh mục không hoạt động được coi như không tồn tại và trả `404`. Dữ liệu nội bộ như địa chỉ kho và lý do từ chối không được trả về.

Response `data` có dạng `{ "product": {...}, "images": [...], "variants": [...], "shop": {...} }`. Mỗi biến thể có `attributes`, là danh sách `{ "attribute_id", "name", "value_id", "value" }`.

### Shop công khai và theo dõi

| Method | Endpoint | Xác thực | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/shops/{id}` | Không | Hồ sơ công khai của shop đang hoạt động |
| `GET` | `/api/v1/shops/{id}/products` | Không | Sản phẩm của shop, hỗ trợ các filter/sort/page/limit như danh sách sản phẩm |
| `GET` | `/api/v1/shops/{id}/follow` | CLIENT | Trạng thái theo dõi của tài khoản hiện tại |
| `POST` | `/api/v1/shops/{id}/follow` | CLIENT | Theo dõi shop; thao tác lặp không tăng follower count lần nữa |
| `DELETE` | `/api/v1/shops/{id}/follow` | CLIENT | Bỏ theo dõi shop; thao tác lặp không làm giảm follower count |

Theo dõi/bỏ theo dõi cập nhật quan hệ và `follower_count` trong cùng transaction; không cho phép tự theo dõi shop của mình. Hồ sơ công khai không bao gồm địa chỉ kho, chủ shop, trạng thái duyệt nội bộ hay lý do từ chối.

## API quản trị tồn kho

Tất cả route dưới đây yêu cầu access token của user role `ADMIN`. Thiếu/sai phiên trả `401`; role khác trả `403`.

### `GET /api/v1/admin/products`

Tham số lọc: `search`, `category`, `stock_status` (`in_stock`, `low_stock`, `out_of_stock`), `vendor`, `sort_by` (`newest`, `stock_asc`, `stock_desc`, `price_desc`). Trả `{ "products": [...], "total": n }`.

### `GET /api/v1/admin/inventory-stats`

Trả số SKU, SKU mới trong tháng, sản phẩm hoạt động, tỷ lệ hoạt động, số SKU tồn thấp và hết hàng.

### `PATCH /api/v1/admin/products/{id}/status`

Body: `{ "is_active": true }`. Chỉ sản phẩm đã được duyệt (`ACTIVE`/`HIDDEN`) mới được bật/tắt ở route này. Sản phẩm `PENDING`/`REJECTED` trả `409`; thao tác này không thay thế quy trình duyệt sản phẩm.

### `DELETE /api/v1/admin/products/{id}`

Xóa mềm sản phẩm, không xóa vật lý dữ liệu liên quan.

### `POST /api/v1/admin/products/bulk`

Body: `{ "action": "deactivate", "product_ids": [960001, 960002] }`. `action` nhận `activate`, `deactivate`, `delete`; nhận từ 1 đến 100 ID dương. ID trùng được xử lý một lần. Bật/tắt hàng loạt chỉ áp dụng sản phẩm đã duyệt.

Request body phải có `Content-Type: application/json`, từ chối field lạ, JSON sai hoặc nhiều JSON value. Filter sai, parameter lạ/lặp hoặc vượt giới hạn trả `400`. Các lỗi trả envelope chuẩn với `errors[0].code` và `errors[0].message`.
