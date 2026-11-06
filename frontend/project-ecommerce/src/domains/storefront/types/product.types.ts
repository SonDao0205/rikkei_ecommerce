import type { PublicShop } from '@/domains/shop/types/shop.types';

export interface Product {
  id: number;
  shop_id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  sold_count: number;
  rating_avg: number;
  rating_count: number;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'HIDDEN' | 'REJECTED';
  reject_reason: string | null;
  is_deleted: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

export interface VariantAttribute {
  attribute_id: number;
  name: string;
  value_id: number;
  value: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  attributes: VariantAttribute[];
}

/**
 * Extended Product item for UI rendering with relational & presentation data
 */
export interface ProductItem extends Product {
  category_name?: string;
  stock?: number;
  original_price?: number;
  discount_percent?: number;
  shop_name: string;
  shop_badge?: 'OFFICIAL' | 'MALL' | 'ARTISAN' | 'VERIFIED';
  tag?: string;
  badge_info?: string;
  claimed_percentage?: number;
  stock_alert?: string;
  is_flash_sale?: boolean;
}

export interface ProductDetailData {
  product: ProductItem;
  images: ProductImage[];
  variants: ProductVariant[];
  shop: PublicShop;
}

export type ProductSortOption =
  | 'latest'
  | 'best_selling'
  | 'price_asc'
  | 'price_desc'
  | 'Latest Arrivals'
  | 'Best Selling'
  | 'Price: Low → High'
  | 'Price: High → Low';

export interface CatalogQueryParams {
  q?: string;
  search?: string;
  category_id?: number;
  brand_id?: number;
  shop_id?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort?: ProductSortOption | string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: ProductItem[];
  total: number;
  page?: number;
  limit?: number;
}

export interface InventoryStats {
  totalSkus: number;
  newThisMonth: number;
  activeListings: number;
  activePercentage: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface AdminProductItem {
  id: number;
  name: string;
  sku: string;
  thumbnail_url: string | null;
  shop_name: string;
  shop_badge: 'MALL' | 'ARTISAN' | 'VERIFIED' | 'OFFICIAL';
  category_name: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  is_active: boolean;
}

export type AdminProductSortOption =
  | 'newest'
  | 'stock_asc'
  | 'stock_desc'
  | 'price_desc';

export type AdminStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface AdminProductQueryParams {
  search?: string;
  category?: string;
  stock_status?: AdminStockStatus;
  vendor?: string;
  sort_by?: AdminProductSortOption;
}

export interface AdminProductListResponse {
  products: AdminProductItem[];
  total: number;
}

export interface AdminBulkProductActionPayload {
  action: 'activate' | 'deactivate' | 'delete';
  product_ids: number[];
}
