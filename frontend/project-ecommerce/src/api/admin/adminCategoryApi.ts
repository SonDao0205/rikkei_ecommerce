import axiosClient from "../axiosClient";
import type { Category } from "../../types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AdminCategoryPayload {
  parent_id: number | null;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export const adminCategoryApi = {
  list: async (): Promise<Category[]> => {
    const response = await axiosClient.get<ApiResponse<Category[]>>("/api/v1/admin/categories");
    return response.data.data;
  },
  create: async (payload: AdminCategoryPayload): Promise<Category> => {
    const response = await axiosClient.post<ApiResponse<Category>>("/api/v1/admin/categories", payload);
    return response.data.data;
  },
  update: async (id: number, payload: AdminCategoryPayload): Promise<Category> => {
    const response = await axiosClient.put<ApiResponse<Category>>(`/api/v1/admin/categories/${id}`, payload);
    return response.data.data;
  },
  setActive: async (id: number, isActive: boolean): Promise<Category> => {
    const response = await axiosClient.patch<ApiResponse<Category>>(
      `/api/v1/admin/categories/${id}/status`,
      { is_active: isActive },
    );
    return response.data.data;
  },
  deactivate: async (id: number): Promise<Category> => {
    const response = await axiosClient.delete<ApiResponse<Category>>(`/api/v1/admin/categories/${id}`);
    return response.data.data;
  },
};
