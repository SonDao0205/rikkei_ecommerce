import type {
  CatalogQueryParams,
  AdminProductQueryParams,
  ProductItem,
  Category,
  ProductSortOption,
  AdminProductSortOption,
  AdminStockStatus,
} from "@/shared/types";

/**
 * Mapping giữa nhãn sắp xếp trên giao diện và query value chuẩn của Backend Go
 */
export const SORT_OPTION_MAP: Record<string, ProductSortOption> = {
  "Price: Low → High": "price_asc",
  "Price: High → Low": "price_desc",
  "Best Selling": "best_selling",
  "Latest Arrivals": "latest",
  price_asc: "price_asc",
  price_desc: "price_desc",
  best_selling: "best_selling",
  latest: "latest",
};

/**
 * Làm sạch và chuẩn hóa tham số tìm kiếm/lọc sản phẩm Storefront.
 * Backend Go sẽ trả lỗi 400 nếu nhận các query parameter lạ, rỗng hoặc sai kiểu.
 */
export const cleanCatalogQueryParams = (
  params?: CatalogQueryParams,
  options?: { allowShopId?: boolean }
): Record<string, string | number> => {
  if (!params) return {};

  const cleaned: Record<string, string | number> = {};

  // 1. Tìm kiếm (q hoặc search, ưu tiên q, giới hạn tối đa 100 ký tự)
  const queryText = (params.q ?? params.search ?? "").trim();
  if (queryText.length > 0) {
    cleaned.q = queryText.slice(0, 100);
  }

  // 2. Danh mục (0 = Tất cả, số nguyên không âm)
  if (typeof params.category_id === "number" && params.category_id >= 0) {
    cleaned.category_id = params.category_id;
  }

  // 3. Thương hiệu (ID số nguyên dương)
  if (typeof params.brand_id === "number" && params.brand_id > 0) {
    cleaned.brand_id = params.brand_id;
  }

  // 4. Shop ID (nếu được phép truyền trong catalog chung)
  if (options?.allowShopId && typeof params.shop_id === "number" && params.shop_id > 0) {
    cleaned.shop_id = params.shop_id;
  }

  // 5. Giá min & max
  if (typeof params.min_price === "number" && params.min_price >= 0) {
    cleaned.min_price = params.min_price;
  }
  if (typeof params.max_price === "number" && params.max_price >= 0) {
    if (typeof cleaned.min_price === "number" && params.max_price >= cleaned.min_price) {
      cleaned.max_price = params.max_price;
    } else if (cleaned.min_price === undefined) {
      cleaned.max_price = params.max_price;
    }
  }

  // 6. Đánh giá tối thiểu (0 đến 5)
  if (
    typeof params.min_rating === "number" &&
    params.min_rating >= 0 &&
    params.min_rating <= 5
  ) {
    cleaned.min_rating = params.min_rating;
  }

  // 7. Sắp xếp (Chỉ truyền nếu nằm trong danh sách hỗ trợ)
  if (params.sort) {
    const mappedSort = SORT_OPTION_MAP[params.sort] || params.sort;
    if (["latest", "best_selling", "price_asc", "price_desc"].includes(mappedSort)) {
      cleaned.sort = mappedSort;
    }
  }

  // 8. Phân trang
  if (typeof params.page === "number" && params.page >= 1) {
    cleaned.page = Math.floor(params.page);
  }
  if (typeof params.limit === "number" && params.limit >= 1) {
    cleaned.limit = Math.min(Math.floor(params.limit), 100);
  }

  return cleaned;
};

/**
 * Làm sạch và chuẩn hóa tham số lọc cho Admin Inventory Management.
 * Backend Go cho phép: search, category, stock_status, vendor, sort_by
 */
export const cleanAdminProductQueryParams = (
  params?: AdminProductQueryParams
): Record<string, string> => {
  if (!params) return {};

  const cleaned: Record<string, string> = {};

  if (params.search && params.search.trim() !== "") {
    cleaned.search = params.search.trim().slice(0, 100);
  }

  if (params.category && params.category.trim() !== "") {
    cleaned.category = params.category.trim().slice(0, 100);
  }

  const validStockStatuses: AdminStockStatus[] = [
    "in_stock",
    "low_stock",
    "out_of_stock",
  ];
  if (params.stock_status && validStockStatuses.includes(params.stock_status)) {
    cleaned.stock_status = params.stock_status;
  }

  if (params.vendor && params.vendor.trim() !== "") {
    cleaned.vendor = params.vendor.trim().slice(0, 100);
  }

  const validSortBys: AdminProductSortOption[] = [
    "newest",
    "stock_asc",
    "stock_desc",
    "price_desc",
  ];
  if (params.sort_by && validSortBys.includes(params.sort_by)) {
    cleaned.sort_by = params.sort_by;
  }

  return cleaned;
};

export interface BackendProductRaw {
  id: number;
  shop_id: number;
  category_id: number;
  brand_id?: number | null;
  name?: string;
  slug?: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price?: number | string;
  sold_count?: number;
  rating_avg?: number;
  rating_count?: number;
  status?: string;
  reject_reason?: string | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  stock?: number;
  shop_name?: string;
  shop_badge?: string;
  discount_percent?: number;
  original_price?: number;
  is_flash_sale?: boolean | number;
}

export interface BackendCategoryRaw {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  image_url?: string | null;
  sort_order?: number;
  is_active?: number;
}

/**
 * Adapter chuyển đổi dữ liệu sản phẩm từ Backend sang ViewModel ProductItem hiển thị trên UI.
 */
export const mapBackendProductToProductItem = (raw: BackendProductRaw): ProductItem => {
  const price = typeof raw.price === "number" ? raw.price : parseFloat(String(raw.price)) || 0;
  const isFlashSale = Boolean(raw.is_flash_sale);

  const discountPercent =
    typeof raw.discount_percent === "number" &&
    Number.isFinite(raw.discount_percent) &&
    raw.discount_percent > 0 &&
    raw.discount_percent < 100
      ? raw.discount_percent
      : undefined;

  const originalPrice =
    typeof raw.original_price === "number" &&
    Number.isFinite(raw.original_price) &&
    raw.original_price > price
      ? raw.original_price
      : discountPercent
        ? Math.round(price / (1 - discountPercent / 100))
        : undefined;

  const validBadges: Array<NonNullable<ProductItem["shop_badge"]>> = [
    "OFFICIAL",
    "MALL",
    "ARTISAN",
    "VERIFIED",
  ];
  const shopBadge: ProductItem["shop_badge"] =
    typeof raw.shop_badge === "string" && (validBadges as string[]).includes(raw.shop_badge)
      ? (raw.shop_badge as NonNullable<ProductItem["shop_badge"]>)
      : undefined;

  return {
    id: raw.id,
    shop_id: raw.shop_id,
    category_id: raw.category_id,
    brand_id: raw.brand_id ?? null,
    name: raw.name || "Sản phẩm",
    slug: raw.slug || "",
    description: raw.description ?? null,
    thumbnail_url: raw.thumbnail_url ?? null,
    price,
    sold_count: raw.sold_count ?? 0,
    rating_avg:
      typeof raw.rating_avg === "number" &&
      Number.isFinite(raw.rating_avg) &&
      raw.rating_avg >= 0 &&
      raw.rating_avg <= 5
        ? raw.rating_avg
        : 0,
    rating_count: raw.rating_count ?? 0,
    status: (raw.status as ProductItem["status"]) || "ACTIVE",
    reject_reason: raw.reject_reason ?? null,
    is_deleted: raw.is_deleted ?? 0,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    // Thuộc tính mở rộng UI
    category_name: raw.category_name,
    stock: raw.stock ?? 0,
    shop_name: raw.shop_name || "Cửa hàng",
    shop_badge: shopBadge,
    original_price: originalPrice,
    discount_percent: discountPercent,
    is_flash_sale: isFlashSale,
    stock_alert: (raw.stock ?? 0) > 0 && (raw.stock ?? 0) <= 5 ? `Chỉ còn ${raw.stock} sản phẩm` : undefined,
  };
};

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "seed-fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300",
  "seed-fashion-accessories": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
  "seed-home-living": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300",
  "seed-food-drink": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300",
  "seed-electronics": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
  "thoi-trang": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300",
  "giay-sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300",
  "cong-nghe": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
  "tui-phu-kien": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
  "gom-thu-cong": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300",
  "trang-suc-bac": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300",
  "nuoc-hoa-nen": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300",
};

/**
 * Adapter chuẩn hóa danh mục trả về từ Backend
 */
export const mapBackendCategory = (raw: BackendCategoryRaw): Category => {
  const imageUrl =
    raw.image_url ||
    (raw.id !== 0 ? DEFAULT_CATEGORY_IMAGES[raw.slug] || DEFAULT_CATEGORY_IMAGES["seed-fashion"] : null);

  return {
    id: raw.id,
    parent_id: raw.parent_id ?? null,
    name: raw.name,
    slug: raw.slug,
    image_url: imageUrl,
    sort_order: raw.sort_order ?? 0,
    is_active: raw.is_active ?? 1,
  };
};
