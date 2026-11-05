import axiosClient from "@/shared/api/axiosClient";
import type { CartResponse } from "@/domains/customer/types/cart.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const cartApi = {
  async getCart(): Promise<CartResponse> {
    const response = await axiosClient.get<ApiResponse<CartResponse>>("/api/v1/cart");
    return response.data.data;
  },
  async addItem(variantId: number, quantity: number): Promise<CartResponse> {
    const response = await axiosClient.post<ApiResponse<CartResponse>>("/api/v1/cart/items", {
      variant_id: variantId,
      quantity,
    });
    return response.data.data;
  },
  async updateQuantity(itemId: number, quantity: number): Promise<CartResponse> {
    const response = await axiosClient.put<ApiResponse<CartResponse>>(
      `/api/v1/cart/items/${itemId}`,
      { quantity },
    );
    return response.data.data;
  },
  async removeItem(itemId: number): Promise<CartResponse> {
    const response = await axiosClient.delete<ApiResponse<CartResponse>>(
      `/api/v1/cart/items/${itemId}`,
    );
    return response.data.data;
  },
  async clearCart(): Promise<CartResponse> {
    const response = await axiosClient.delete<ApiResponse<CartResponse>>("/api/v1/cart/items");
    return response.data.data;
  },
};
