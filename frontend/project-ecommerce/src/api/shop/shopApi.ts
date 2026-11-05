import axiosClient from "../axiosClient";
import type {
  Shop,
  PublicShop,
  ShopFollowState,
  CatalogQueryParams,
  ProductListResponse,
  ShopProfilePayload,
  ShopTermsAcceptance,
} from "../../types";
import {
  cleanCatalogQueryParams,
  mapBackendProductToProductItem,
  type BackendProductRaw,
} from "../../utils/catalogAdapters";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const shopApi = {
  /**
   * Tạo gian hàng mới (CLIENT)
   * POST /api/v1/shops
   * Trạng thái khởi tạo: PENDING
   */
  createShop: async (payload: ShopProfilePayload): Promise<Shop> => {
    const response = await axiosClient.post<ApiResponse<Shop>>("/api/v1/shops", payload);
    return response.data.data;
  },

  /**
   * Lấy thông tin gian hàng của tài khoản hiện tại
   * GET /api/v1/me/shop (Yêu cầu đăng nhập)
   * Trả về null nếu người dùng chưa mở gian hàng (404 shop_not_found)
   */
  fetchMyShop: async (): Promise<Shop | null> => {
    try {
      const response = await axiosClient.get<ApiResponse<Shop>>("/api/v1/me/shop");
      return response.data?.data || null;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { code?: string } } };
      if (
        axiosErr.response?.status === 404 ||
        axiosErr.response?.data?.code === "shop_not_found"
      ) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Cập nhật thông tin gian hàng của tài khoản hiện tại
   * PUT /api/v1/me/shop (Yêu cầu đăng nhập)
   * Nếu shop đang REJECTED, sau khi sửa sẽ chuyển lại về PENDING
   */
  updateMyShop: async (payload: ShopProfilePayload): Promise<Shop> => {
    const response = await axiosClient.put<ApiResponse<Shop>>("/api/v1/me/shop", payload);
    return response.data.data;
  },

  submitMyShop: async (agreements: ShopTermsAcceptance): Promise<Shop> => {
    const response = await axiosClient.post<ApiResponse<Shop>>("/api/v1/me/shop/submit", { agreements });
    return response.data.data;
  },

  /**
   * Lấy hồ sơ công khai của cửa hàng đang hoạt động
   * GET /api/v1/shops/{id} (Không yêu cầu đăng nhập)
   */
  fetchShopDetail: async (shopId: number): Promise<PublicShop> => {
    const response = await axiosClient.get<ApiResponse<{ shop: PublicShop }>>(
      `/api/v1/shops/${shopId}`
    );
    return response.data.data.shop;
  },

  /**
   * Lấy danh sách sản phẩm công khai của cửa hàng
   * GET /api/v1/shops/{id}/products (Hỗ trợ tìm kiếm, lọc, phân trang)
   */
  fetchShopProducts: async (
    shopId: number,
    params?: CatalogQueryParams
  ): Promise<ProductListResponse> => {
    const cleaned = cleanCatalogQueryParams(params);
    const response = await axiosClient.get<
      ApiResponse<{ products: BackendProductRaw[]; total: number; page?: number; limit?: number }>
    >(`/api/v1/shops/${shopId}/products`, { params: cleaned });

    const rawProducts = response.data?.data?.products || [];
    return {
      products: rawProducts.map(mapBackendProductToProductItem),
      total: response.data?.data?.total || 0,
      page: response.data?.data?.page || 1,
      limit: response.data?.data?.limit || 20,
    };
  },

  /**
   * Lấy trạng thái theo dõi cửa hàng của user hiện tại
   * GET /api/v1/shops/{id}/follow (Yêu cầu tài khoản CLIENT)
   */
  getShopFollowState: async (shopId: number): Promise<ShopFollowState> => {
    const response = await axiosClient.get<ApiResponse<{ shop_id: number; following: boolean; follower_count: number }>>(
      `/api/v1/shops/${shopId}/follow`
    );
    return {
      following: response.data.data.following,
      follower_count: response.data.data.follower_count,
    };
  },

  /**
   * Theo dõi cửa hàng
   * POST /api/v1/shops/{id}/follow (Yêu cầu tài khoản CLIENT)
   */
  followShop: async (shopId: number): Promise<ShopFollowState> => {
    const response = await axiosClient.post<ApiResponse<{ shop_id: number; following: boolean; follower_count: number }>>(
      `/api/v1/shops/${shopId}/follow`
    );
    return {
      following: response.data.data.following,
      follower_count: response.data.data.follower_count,
    };
  },

  /**
   * Hủy theo dõi cửa hàng
   * DELETE /api/v1/shops/{id}/follow (Yêu cầu tài khoản CLIENT)
   */
  unfollowShop: async (shopId: number): Promise<ShopFollowState> => {
    const response = await axiosClient.delete<ApiResponse<{ shop_id: number; following: boolean; follower_count: number }>>(
      `/api/v1/shops/${shopId}/follow`
    );
    return {
      following: response.data.data.following,
      follower_count: response.data.data.follower_count,
    };
  },
};

export default shopApi;
