import axiosClient from "@/shared/api/axiosClient";

export interface PromotionBanner {
  id: number;
  title: string;
  image_url: string;
  target_url: string | null;
  position: "HOME_HERO" | "HOME_MIDDLE" | "SHOP";
  start_at: string;
  end_at: string;
  sort_order: number;
}

export interface FlashSale {
  id: number;
  product_id: number;
  sale_price: number;
  remaining: number;
  start_at: string;
  end_at: string;
}

interface ApiEnvelope<T> { success: boolean; data: T }

export const promotionApi = {
  async getBanners(): Promise<PromotionBanner[]> {
    const { data } = await axiosClient.get<ApiEnvelope<PromotionBanner[]>>("/api/v1/promotions/banners");
    return data.data ?? [];
  },
  async getFlashSales(): Promise<FlashSale[]> {
    const { data } = await axiosClient.get<ApiEnvelope<FlashSale[]>>("/api/v1/promotions/flash-sales");
    return data.data ?? [];
  },
};
