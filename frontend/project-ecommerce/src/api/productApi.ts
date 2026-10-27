import axiosClient from "./axiosClient";
import type { Category, ProductItem, AdminProductItem, InventoryStats } from "../types/ecommerce";

interface ApiResponse<T> { success: boolean; data: T; message?: string }
interface ProductList { products: ProductItem[]; total: number }
interface AdminProductList { products: AdminProductItem[]; total: number }

export const productApi = {
  fetchCategories: async (): Promise<Category[]> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>("/api/v1/categories");
    return response.data.data;
  },
  fetchFlashSaleProducts: async (): Promise<ProductItem[]> => {
    const response = await axiosClient.get<ApiResponse<ProductList>>("/api/v1/products", { params: { sort: "best_selling", limit: 4 } });
    return response.data.data.products;
  },
  fetchCatalogProducts: async (params?: { categoryId?: number; sort?: string; page?: number; limit?: number }): Promise<ProductList> => {
    const sortMap: Record<string, string> = {
      "Price: Low → High": "price_asc",
      "Price: High → Low": "price_desc",
      "Best Selling": "best_selling",
      "Latest Arrivals": "latest",
    };
    const response = await axiosClient.get<ApiResponse<ProductList>>("/api/v1/products", {
      params: { category_id: params?.categoryId || 0, sort: sortMap[params?.sort || ""] || params?.sort, page: params?.page || 1, limit: params?.limit || 100 },
    });
    return response.data.data;
  },
  fetchInventoryStats: async (): Promise<InventoryStats> => {
    const response = await axiosClient.get<ApiResponse<InventoryStats>>("/api/v1/admin/inventory-stats");
    return response.data.data;
  },
  fetchAdminProducts: async (params?: { search?: string; category?: string; stockStatus?: string; vendor?: string; sortBy?: string }): Promise<AdminProductList> => {
    const response = await axiosClient.get<ApiResponse<AdminProductList>>("/api/v1/admin/products", {
      params: { search: params?.search, category: params?.category, stock_status: params?.stockStatus, vendor: params?.vendor, sort_by: params?.sortBy },
    });
    return response.data.data;
  },
  toggleAdminProductStatus: async (productId: number): Promise<AdminProductItem> => {
    const current = await productApi.fetchAdminProducts();
    const product = current.products.find((item) => item.id === productId);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    const response = await axiosClient.patch<ApiResponse<{ id: number; is_active: boolean }>>(`/api/v1/admin/products/${productId}/status`, { is_active: !product.is_active });
    return { ...product, is_active: response.data.data.is_active, status: response.data.data.is_active ? "ACTIVE" : "INACTIVE" };
  },
  deleteAdminProduct: async (productId: number): Promise<number> => {
    await axiosClient.delete(`/api/v1/admin/products/${productId}`);
    return productId;
  },
  bulkAdminAction: async (action: string, productIds: number[]): Promise<{ action: string; count: number }> => {
    if (!["activate", "deactivate", "delete"].includes(action)) throw new Error("Thao tác không hợp lệ");
    const response = await axiosClient.post<ApiResponse<{ action: string; count: number }>>("/api/v1/admin/products/bulk", { action, product_ids: productIds });
    return response.data.data;
  },
};
