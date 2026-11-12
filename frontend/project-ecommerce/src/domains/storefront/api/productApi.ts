import axiosClient from "@/shared/api/axiosClient";
import type {
  Category,
  ProductItem,
  InventoryStats,
  CatalogQueryParams,
  ProductListResponse,
  ProductDetailData,
  AdminProductQueryParams,
  AdminProductListResponse,
} from "@/shared/types";
import {
  cleanCatalogQueryParams,
  cleanAdminProductQueryParams,
  mapBackendProductToProductItem,
  mapBackendCategory,
  type BackendProductRaw,
} from "@/domains/storefront/utils/catalogAdapters";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CategoryVariantAttribute {
  id: number;
  name: string;
  required: boolean;
  values: Array<{ id: number; value: string }>;
}

export const productApi = {
  /**
   * Lấy danh mục sản phẩm (Category Circles Bar trên trang Home)
   * GET /api/v1/categories
   */
  fetchCategories: async (): Promise<Category[]> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>("/api/v1/categories");
    const rawCategories = response.data?.data || [];
    const mapped = rawCategories.map(mapBackendCategory);

    // Backend quy ước: Danh mục tổng hợp "Tất cả" có id: 0
    if (!mapped.some((c) => c.id === 0)) {
      mapped.unshift({
        id: 0,
        parent_id: null,
        name: "Tất cả",
        slug: "all",
        image_url: null,
        sort_order: 0,
        is_active: 1,
      });
    }
    return mapped;
  },

  /**
   * Lấy các thuộc tính biến thể được cấu hình cho danh mục
   * GET /api/v1/categories/{id}/attributes
   */
  fetchCategoryAttributes: async (
    categoryId: number
  ): Promise<{ category_id: number; attributes: CategoryVariantAttribute[] }> => {
    const response = await axiosClient.get<
      ApiResponse<{ category_id: number; attributes: CategoryVariantAttribute[] }>
    >(`/api/v1/categories/${categoryId}/attributes`);
    return response.data.data;
  },

  /**
   * Lấy danh sách Flash Sale / Sản phẩm nổi bật cho trang Home
   * GET /api/v1/products?sort=best_selling&limit=4[&category_id=...]
   */
  fetchFlashSaleProducts: async (categoryId?: number): Promise<ProductItem[]> => {
    const params: Record<string, string | number> = { sort: "best_selling", limit: 4 };
    if (typeof categoryId === "number" && categoryId > 0) {
      params.category_id = categoryId;
    }
    const response = await axiosClient.get<ApiResponse<{ products: BackendProductRaw[]; total: number }>>("/api/v1/products", {
      params,
    });
    const products = response.data?.data?.products || [];
    return products.map(mapBackendProductToProductItem);
  },

  /**
   * Lấy danh mục sản phẩm Catalog trên trang Home (hỗ trợ tìm kiếm, lọc theo categoryId & sắp xếp)
   * GET /api/v1/products
   */
  fetchCatalogProducts: async (
    params?: CatalogQueryParams & { categoryId?: number }
  ): Promise<ProductListResponse> => {
    const cleaned = cleanCatalogQueryParams({
      q: params?.q ?? params?.search,
      category_id: params?.category_id ?? params?.categoryId,
      brand_id: params?.brand_id,
      shop_id: params?.shop_id,
      min_price: params?.min_price,
      max_price: params?.max_price,
      min_rating: params?.min_rating,
      sort: params?.sort,
      page: params?.page || 1,
      limit: params?.limit || 20,
    });

    const response = await axiosClient.get<
      ApiResponse<{ products: BackendProductRaw[]; total: number; page?: number; limit?: number }>
    >("/api/v1/products", { params: cleaned });

    const rawList = response.data?.data?.products || [];
    return {
      products: rawList.map(mapBackendProductToProductItem),
      total: response.data?.data?.total || 0,
      page: response.data?.data?.page || 1,
      limit: response.data?.data?.limit || 20,
    };
  },

  /**
   * Lấy chi tiết sản phẩm công khai kèm danh sách ảnh, biến thể và thông tin shop
   * GET /api/v1/products/{id}
   */
  fetchProductDetail: async (productId: number): Promise<ProductDetailData> => {
    const response = await axiosClient.get<ApiResponse<ProductDetailData>>(
      `/api/v1/products/${productId}`
    );
    const data = response.data.data;
    return {
      product: mapBackendProductToProductItem(data.product),
      images: data.images || [],
      variants: data.variants || [],
      shop: data.shop,
    };
  },

  /**
   * Lấy số liệu thống kê kho hàng cho Admin Product Management
   * GET /api/v1/admin/inventory-stats (Yêu cầu tài khoản ADMIN)
   */
  fetchInventoryStats: async (): Promise<InventoryStats> => {
    const response = await axiosClient.get<ApiResponse<InventoryStats>>(
      "/api/v1/admin/inventory-stats"
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách sản phẩm quản trị (Admin Product Management Table)
   * GET /api/v1/admin/products (Yêu cầu tài khoản ADMIN)
   * Hỗ trợ tìm kiếm, lọc danh mục, trạng thái tồn kho, nhà cung cấp và sắp xếp
   */
  fetchAdminProducts: async (
    params?: AdminProductQueryParams
  ): Promise<AdminProductListResponse> => {
    const cleaned = cleanAdminProductQueryParams(params);
    const response = await axiosClient.get<ApiResponse<AdminProductListResponse>>(
      "/api/v1/admin/products",
      { params: cleaned }
    );
    return response.data.data;
  },

  /**
   * Bật/Tắt trạng thái hoạt động của sản phẩm đã duyệt trong Admin Table
   * PATCH /api/v1/admin/products/{id}/status (Yêu cầu tài khoản ADMIN)
   */
  toggleAdminProductStatus: async (
    productId: number,
    newIsActive: boolean
  ): Promise<{ id: number; is_active: boolean; status: string }> => {
    const response = await axiosClient.patch<
      ApiResponse<{ id: number; is_active: boolean; status: string }>
    >(`/api/v1/admin/products/${productId}/status`, {
      is_active: newIsActive,
    });
    return response.data.data;
  },

  /**
   * Xóa mềm sản phẩm trong Admin Table
   * DELETE /api/v1/admin/products/{id} (Yêu cầu tài khoản ADMIN)
   */
  deleteAdminProduct: async (productId: number): Promise<number> => {
    await axiosClient.delete<ApiResponse<{ id: number }>>(
      `/api/v1/admin/products/${productId}`
    );
    return productId;
  },

  /**
   * Phê duyệt sản phẩm (chuyển trạng thái sang ACTIVE)
   * PATCH /api/v1/admin/products/{id}/status hoặc cập nhật moderation
   */
  approveAdminProduct: async (
    productId: number
  ): Promise<{ id: number; is_active: boolean; status: string }> => {
    const response = await axiosClient.patch<
      ApiResponse<{ id: number; is_active: boolean; status: string }>
    >(`/api/v1/admin/products/${productId}/status`, { status: "ACTIVE" });
    return response.data.data;
  },

  /**
   * Từ chối phê duyệt sản phẩm (chuyển trạng thái sang REJECTED cùng lý do)
   */
  rejectAdminProduct: async (
    productId: number,
    reason: string
  ): Promise<{ id: number; is_active: boolean; status: string; reject_reason: string }> => {
    const response = await axiosClient.patch<
      ApiResponse<{ id: number; is_active: boolean; status: string; reject_reason: string }>
    >(`/api/v1/admin/products/${productId}/status`, {
      status: "REJECTED",
      reason,
    });
    return response.data.data;
  },

  /**
   * Thao tác hàng loạt (Bulk Actions: activate, deactivate, delete)
   * POST /api/v1/admin/products/bulk (Yêu cầu tài khoản ADMIN)
   */
  bulkAdminAction: async (
    action: "activate" | "deactivate" | "delete",
    productIds: number[]
  ): Promise<{ action: string; count: number }> => {
    const response = await axiosClient.post<ApiResponse<{ action: string; count: number }>>(
      "/api/v1/admin/products/bulk",
      { action, product_ids: productIds }
    );
    return response.data.data;
  },
};

export default productApi;
