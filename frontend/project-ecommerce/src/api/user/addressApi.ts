import axiosClient from "../axiosClient";
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../../types/ecommerce";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const requireData = <T>(response: ApiResponse<T>): T => {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || "Phản hồi địa chỉ từ máy chủ không hợp lệ.");
  }
  return response.data;
};

export const addressApi = {
  fetchAddresses: async (): Promise<Address[]> => {
    const response = await axiosClient.get<ApiResponse<Address[]>>("/api/v1/addresses");
    const addresses = requireData(response.data);
    if (!Array.isArray(addresses)) {
      throw new Error("Danh sách địa chỉ từ máy chủ không hợp lệ.");
    }
    return addresses;
  },

  createAddress: async (payload: CreateAddressPayload): Promise<Address> => {
    const response = await axiosClient.post<ApiResponse<Address>>(
      "/api/v1/addresses",
      payload
    );
    return requireData(response.data);
  },

  updateAddress: async (payload: UpdateAddressPayload): Promise<Address> => {
    const response = await axiosClient.put<ApiResponse<Address>>(
      `/api/v1/addresses/${payload.id}`,
      payload
    );
    return requireData(response.data);
  },

  deleteAddress: async (id: number): Promise<number> => {
    const response = await axiosClient.delete<ApiResponse<number>>(
      `/api/v1/addresses/${id}`
    );
    const deletedID = requireData(response.data);
    if (deletedID !== id) {
      throw new Error("Máy chủ xác nhận xóa sai địa chỉ.");
    }
    return deletedID;
  },

  setDefaultAddress: async (id: number): Promise<Address> => {
    const response = await axiosClient.patch<ApiResponse<Address>>(
      `/api/v1/addresses/${id}/default`
    );
    return requireData(response.data);
  },
};

export default addressApi;
