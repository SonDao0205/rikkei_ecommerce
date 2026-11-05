export type WishlistFilterType = "all" | "sale" | "in-stock" | "out-of-stock";
export type WishlistSortType = "recent" | "price-asc" | "price-desc" | "discount";

export interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  shop_name: string;
  is_verified_shop: boolean;
  image_url: string;
  alt_text?: string;
  price: number;
  original_price: number;
  discount_percent?: number;
  discount_badge?: string;
  urgency_badge?: string;
  variant_label: string;
  is_sale: boolean;
  status: "in-stock" | "out-of-stock";
  stock_count?: number;
  added_at: string;
}

export interface WishlistRecommendation {
  id: number;
  product_id: number;
  name: string;
  shop_name: string;
  image_url: string;
  alt_text?: string;
  price: number;
  tag?: string;
  is_discounted?: boolean;
  discount_badge?: string;
}

export interface WishlistState {
  items: WishlistItem[];
  recommendations: WishlistRecommendation[];
  filter: WishlistFilterType;
  sortBy: WishlistSortType;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

