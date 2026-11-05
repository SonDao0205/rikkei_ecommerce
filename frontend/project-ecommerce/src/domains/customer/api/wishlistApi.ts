import axiosClient from "@/shared/api/axiosClient";
import type { WishlistResponse } from "@/domains/customer/types/cart.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const wishlistApi = {
  async getWishlist(): Promise<WishlistResponse> {
    const response = await axiosClient.get<ApiResponse<WishlistResponse>>("/api/v1/wishlist");
    return response.data.data;
  },
  async addItem(productId: number): Promise<void> {
    await axiosClient.post(`/api/v1/wishlist/products/${productId}`);
  },
  async removeItem(productId: number): Promise<void> {
    await axiosClient.delete(`/api/v1/wishlist/products/${productId}`);
  },
};
