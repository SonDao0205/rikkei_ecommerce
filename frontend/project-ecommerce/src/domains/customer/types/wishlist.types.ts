export type WishlistFilterType = "all" | "sale" | "in-stock" | "out-of-stock";
export type WishlistSortType = "recent" | "price-asc" | "price-desc" | "discount";

export interface BackendWishlistItem {
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

export interface BackendWishlistResponse {
  items: BackendWishlistItem[];
  total: number;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  recommendations?: WishlistRecommendation[];
}

export interface WishlistItem {
  id: number;
  product_id: number;
  slug?: string;
  name: string;
  shop_id?: number;
  shop_name: string;
  is_verified_shop: boolean;
  image_url: string;
  thumbnail_url?: string | null;
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
  available_stock?: number;
  rating_average?: number;
  rating_count?: number;
  is_available?: boolean;
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
  total: number;
  recommendations: WishlistRecommendation[];
  filter: WishlistFilterType;
  sortBy: WishlistSortType;
  searchQuery: string;
  loading: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  mutatingIds: number[];
  error: string | null;
  fetchRequestId: string | null;
  mutationRequestIds: Record<number, string>;
}
