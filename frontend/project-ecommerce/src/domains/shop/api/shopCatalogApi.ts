import axiosClient from "@/shared/api/axiosClient";
import type { AddProductCategoryOption } from "@/domains/shop/types/shopAddProduct.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface BackendCategory {
  id: number;
  parent_id: number | null;
  name: string;
  is_active: number | boolean;
}

export interface ShopBrandOption {
  id: number | null;
  name: string;
  isVerified: boolean;
}

export interface ShopCategoryAttribute {
  id: number;
  name: string;
  required: boolean;
  values: Array<{ id: number; value: string }>;
}

export const shopCatalogApi = {
  async categories(): Promise<AddProductCategoryOption[]> {
    const response = await axiosClient.get<ApiResponse<BackendCategory[]>>("/api/v1/categories");
    const categories = (response.data.data || []).filter((item) => item.id > 0);
    const byId = new Map(categories.map((item) => [item.id, item]));

    return categories.map((item) => {
      const parentPath: string[] = [];
      const visited = new Set<number>([item.id]);
      let parentId = item.parent_id;
      while (parentId && byId.has(parentId) && !visited.has(parentId)) {
        visited.add(parentId);
        const parent = byId.get(parentId)!;
        parentPath.unshift(parent.name);
        parentId = parent.parent_id;
      }
      return {
        id: item.id,
        name: item.name,
        parentPath,
        suggestedSizes: [],
        suggestedColors: [],
      };
    });
  },

  async brands(): Promise<ShopBrandOption[]> {
    const response = await axiosClient.get<ApiResponse<Array<{ id: number; name: string }>>>("/api/v1/brands");
    return [
      { id: null, name: "Không có thương hiệu", isVerified: false },
      ...(response.data.data || []).map((brand) => ({
        id: brand.id,
        name: brand.name,
        isVerified: false,
      })),
    ];
  },

  async categoryAttributes(categoryId: number): Promise<ShopCategoryAttribute[]> {
    const response = await axiosClient.get<ApiResponse<{ category_id: number; attributes: ShopCategoryAttribute[] }>>(
      `/api/v1/categories/${categoryId}/attributes`,
    );
    return response.data.data.attributes || [];
  },
};
