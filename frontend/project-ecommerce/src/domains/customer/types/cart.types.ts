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
}

export interface CartResponse {
  items: CartItem[];
  line_count: number;
  item_count: number;
  available_item_count: number;
  subtotal: number;
}

export interface WishlistItem {
  product_id: number;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  rating_average: number;
  rating_count: number;
  shop_id: number;
  shop_name: string;
  available_stock: number;
  is_available: boolean;
  created_at: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}
