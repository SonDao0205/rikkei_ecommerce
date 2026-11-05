import axiosClient from "../axiosClient";
import type {
  BackendWishlistItem,
  BackendWishlistResponse,
  WishlistItem,
  WishlistRecommendation,
} from "../../types/wishlist/wishlist.types";

export const INITIAL_RECOMMENDATIONS: WishlistRecommendation[] = [
  {
    id: 1,
    product_id: 960001,
    name: "Áo thun cotton cơ bản phong cách Minimalist",
    shop_name: "Active Seller A Shop",
    image_url:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400",
    price: 250000,
    tag: "Bán chạy #1",
  },
  {
    id: 2,
    product_id: 960002,
    name: "Túi vải Canvas dùng hằng ngày thân thiện môi trường",
    shop_name: "Active Seller A Shop",
    image_url:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400",
    price: 180000,
    tag: "Yêu thích",
    is_discounted: false,
  },
];

export function mapBackendWishlistItemToWishlistItem(
  item: BackendWishlistItem
): WishlistItem {
  const isInStock = item.is_available && item.available_stock > 0;
  const urgencyBadge = !isInStock
    ? "Hết hàng"
    : item.available_stock <= 5
    ? `Chỉ còn ${item.available_stock} sản phẩm`
    : undefined;

  return {
    id: item.product_id,
    product_id: item.product_id,
    slug: item.slug,
    name: item.name,
    shop_id: item.shop_id,
    shop_name: item.shop_name,
    is_verified_shop: true,
    image_url:
      item.thumbnail_url ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    alt_text: item.name,
    price: item.price,
    original_price: item.price,
    urgency_badge: urgencyBadge,
    variant_label: "Mặc định",
    is_sale: false,
    status: isInStock ? "in-stock" : "out-of-stock",
    stock_count: item.available_stock,
    rating_average: item.rating_average,
    rating_count: item.rating_count,
    is_available: item.is_available,
    added_at: item.created_at,
  };
}

export const wishlistApi = {
  /**
   * GET /api/v1/wishlist
   * Retrieves all items in the user's wishlist
   */
  async getWishlist(): Promise<{
    items: WishlistItem[];
    recommendations: WishlistRecommendation[];
  }> {
    const response = await axiosClient.get<{
      success: boolean;
      data: BackendWishlistResponse;
    }>("/api/v1/wishlist");

    const rawItems = response.data.data?.items || [];
    const items = rawItems.map(mapBackendWishlistItemToWishlistItem);

    return {
      items,
      recommendations: INITIAL_RECOMMENDATIONS,
    };
  },

  /**
   * POST /api/v1/wishlist/products/{id}
   * Adds a product to user's wishlist
   */
  async addItem(productId: number): Promise<{ product_id: number; is_favorite: boolean }> {
    const response = await axiosClient.post<{
      success: boolean;
      data: { product_id: number; is_favorite: boolean };
    }>(`/api/v1/wishlist/products/${productId}`);
    return response.data.data;
  },

  /**
   * DELETE /api/v1/wishlist/products/{id}
   * Removes a product from user's wishlist
   */
  async removeItem(productId: number): Promise<{ product_id: number }> {
    const response = await axiosClient.delete<{
      success: boolean;
      data: { product_id: number };
    }>(`/api/v1/wishlist/products/${productId}`);
    return response.data.data;
  },

  /**
   * Clears multiple/all wishlist items
   */
  async clearAll(productIds: number[]): Promise<void> {
    for (const id of productIds) {
      await axiosClient.delete(`/api/v1/wishlist/products/${id}`);
    }
  },
};
