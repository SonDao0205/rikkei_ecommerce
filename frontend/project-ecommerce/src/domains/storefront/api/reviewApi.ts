import axiosClient from "@/shared/api/axiosClient";

export interface ReviewRecord {
  id: number;
  order_item_id: number;
  product_id: number;
  shop_id: number;
  customer_name: string;
  rating: number;
  content: string | null;
  images: string[];
  status: "VISIBLE" | "HIDDEN";
  shop_reply: string | null;
  shop_replied_at: string | null;
  created_at: string;
}
export interface EligibleReviewItem { order_item_id: number; product_id: number; product_name: string; order_code: string }
interface ApiEnvelope<T> { success: boolean; data: T }

export const reviewApi = {
  async listProduct(productId: number): Promise<ReviewRecord[]> {
    const { data } = await axiosClient.get<ApiEnvelope<ReviewRecord[]>>(`/api/v1/products/${productId}/reviews`);
    return data.data ?? [];
  },
  async listEligible(): Promise<EligibleReviewItem[]> {
    const { data } = await axiosClient.get<ApiEnvelope<EligibleReviewItem[]>>("/api/v1/me/reviews/eligible");
    return data.data ?? [];
  },
  async create(input: { order_item_id: number; rating: number; content: string; images: string[] }): Promise<void> {
    await axiosClient.post("/api/v1/reviews", input);
  },
};
