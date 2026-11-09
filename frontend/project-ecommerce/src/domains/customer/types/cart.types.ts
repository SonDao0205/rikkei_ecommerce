export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_thumbnail_url: string | null;
  shop_id: number;
  shop_name: string;
  variant_id: number;
  variant_sku: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
  available_stock: number;
  is_available: boolean;
  line_total: number;

  // UI helper fields for rich components:
  name?: string;
  price?: number;
  original_price?: number;
  max_stock?: number;
  selected?: boolean;
  image_url?: string;
  alt_text?: string;
  variant_label?: string;
  stock_status?: string;
  shop_badge?: string;
  shop_avatar_text?: string;
  shop_location?: string;
}

export interface CartResponse {
  items: CartItem[];
  line_count: number;
  item_count: number;
  available_item_count: number;
  subtotal: number;
}

export type BackendCartItem = CartItem;
export type BackendCartResponse = CartResponse;

export interface ShopVoucher {
  shop_id: number;
  code: string;
  discount_amount: number;
  min_order_amount: number;
  is_applied: boolean;
  label?: string;
}

export interface PlatformVoucher {
  code: string;
  discount_amount: number;
  min_order_amount: number;
  is_applied: boolean;
  description?: string;
}

export interface CartShopGroup {
  shop_id: number;
  shop_name: string;
  shop_badge?: string;
  shop_avatar_text?: string;
  shop_location?: string;
  items: CartItem[];
  voucher?: ShopVoucher;
  is_selected?: boolean;
}

export interface CartSummary {
  total_items: number;
  selected_count: number;
  items_subtotal: number;
  estimated_shipping: number;
  shipping_discount: number;
  store_vouchers_discount: number;
  platform_voucher_discount: number;
  grand_total: number;
  total_savings: number;
  free_shipping_threshold: number;
  free_shipping_progress: number;
  amount_left_for_free_shipping: number;
  is_free_shipping_eligible: boolean;
}

export type {
  WishlistItem,
  WishlistResponse,
  BackendWishlistItem,
  BackendWishlistResponse,
} from "./wishlist.types";
