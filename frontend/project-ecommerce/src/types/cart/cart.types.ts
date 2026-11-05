export interface CartItem {
  id: number;
  shop_id: number;
  shop_name: string;
  shop_badge: string;
  shop_avatar_text: string;
  shop_location?: string;
  product_id: number;
  name: string;
  image_url: string;
  alt_text?: string;
  variant_label: string;
  stock_status: string;
  original_price: number;
  price: number;
  quantity: number;
  max_stock: number;
  selected: boolean;
}

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
  shop_badge: string;
  shop_avatar_text: string;
  shop_location?: string;
  items: CartItem[];
  voucher?: ShopVoucher;
  is_selected: boolean;
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

export interface CartState {
  items: CartItem[];
  platformVoucher: PlatformVoucher | null;
  shopVouchers: Record<number, ShopVoucher>;
  freeShippingThreshold: number;
  isLoading: boolean;
  error: string | null;
  summary: CartSummary;
}

