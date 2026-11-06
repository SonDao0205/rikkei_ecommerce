import axiosClient from "@/shared/api/axiosClient";
import type {
  BackendWishlistItem,
  BackendWishlistResponse,
  WishlistItem,
  WishlistRecommendation,
  WishlistResponse,
} from "@/domains/customer/types/wishlist.types";

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
    thumbnail_url: item.thumbnail_url,
    alt_text: item.name,
    price: item.price,
    original_price: item.price,
    urgency_badge: urgencyBadge,
    variant_label: "Mặc định",
    is_sale: false,
    status: isInStock ? "in-stock" : "out-of-stock",
    stock_count: item.available_stock,
    available_stock: item.available_stock,
    rating_average: item.rating_average,
    rating_count: item.rating_count,
    is_available: item.is_available,
    added_at: item.created_at,
  };
}

export const wishlistApi = {
  async getWishlist(): Promise<WishlistResponse> {
    const response = await axiosClient.get<{
      success: boolean;
      data: BackendWishlistResponse;
    }>("/api/v1/wishlist");

    const rawItems = response.data.data?.items || [];
    const items = rawItems.map(mapBackendWishlistItemToWishlistItem);
    const total = response.data.data?.total ?? items.length;

    return {
      items,
      total,
      recommendations: INITIAL_RECOMMENDATIONS,
    };
  },

  async addItem(productId: number): Promise<void> {
    await axiosClient.post(`/api/v1/wishlist/products/${productId}`);
  },

  async removeItem(productId: number): Promise<void> {
    await axiosClient.delete(`/api/v1/wishlist/products/${productId}`);
  },

  async clearAll(productIds: number[]): Promise<void> {
    for (const id of productIds) {
      await axiosClient.delete(`/api/v1/wishlist/products/${id}`);
    }
  },
};
