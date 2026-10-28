# API catalog và quản lý tồn kho

Các API dùng JSON envelope `{ "success": true, "data": ... }`. URL dưới đây được FE gọi qua proxy `http://localhost:5173`; khi gọi trực tiếp BE local, dùng `http://localhost:18080`.

## API công khai

### `GET /api/v1/categories`

Trả danh mục đang hoạt động. Danh mục tổng hợp **Tất cả** có `id: 0`.

### `GET /api/v1/products`

Tham số query:

| Tham số | Ví dụ | Mặc định/giới hạn |
|---|---|---|
| `category_id` | `930001` | `0` nghĩa là tất cả; không nhận số âm |
| `sort` | `best_selling` | `latest`; hỗ trợ `price_asc`, `price_desc`, `best_selling`, `latest` |
| `page` | `1` | Mặc định `1`, từ `1` đến `100000` |
| `limit` | `16` | Mặc định `100`, tối đa `100` |

Ví dụ: `GET /api/v1/products?category_id=0&sort=best_selling&page=1&limit=16`.

`data` có dạng `{ "products": [...], "total": 2 }`. Chỉ sản phẩm đang hoạt động, chưa bị xóa và thuộc shop đang hoạt động được trả về. Mỗi sản phẩm có thông tin shop/category, giá, rating và tổng tồn kho biến thể đang hoạt động.

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

Request body từ chối field lạ, JSON sai hoặc nhiều JSON value. Filter sai trả `400`. Các lỗi trả envelope chuẩn với `errors[0].code` và `errors[0].message`.
