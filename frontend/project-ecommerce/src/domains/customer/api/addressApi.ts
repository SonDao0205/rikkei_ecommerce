import axiosClient from "@/shared/api/axiosClient";
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/domains/customer/types";

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

const normalizeAddress = (raw: Address): Address => ({
  ...raw,
  is_default: Boolean(raw.is_default),
});

export const addressApi = {
  /**
   * GET /api/v1/addresses
   * Lấy danh sách địa chỉ của tài khoản đang đăng nhập
   */
  fetchAddresses: async (): Promise<Address[]> => {
    const response = await axiosClient.get<ApiResponse<Address[]>>("/api/v1/addresses");
    const addresses = requireData(response.data);
    if (!Array.isArray(addresses)) {
      throw new Error("Danh sách địa chỉ từ máy chủ không hợp lệ.");
    }
    return addresses.map(normalizeAddress);
  },

  /**
   * POST /api/v1/addresses
   * Thêm mới địa chỉ giao hàng
   */
  createAddress: async (payload: CreateAddressPayload): Promise<Address> => {
    const response = await axiosClient.post<ApiResponse<Address>>(
      "/api/v1/addresses",
      payload
    );
    const data = requireData(response.data);
    return normalizeAddress(data);
  },

  /**
   * PUT /api/v1/addresses/{id}
   * Cập nhật địa chỉ giao hàng
   */
  updateAddress: async (payload: UpdateAddressPayload): Promise<Address> => {
    const response = await axiosClient.put<ApiResponse<Address>>(
      `/api/v1/addresses/${payload.id}`,
      payload
    );
    const data = requireData(response.data);
    return normalizeAddress(data);
  },

  /**
   * DELETE /api/v1/addresses/{id}
   * Xóa địa chỉ giao hàng
   */
  deleteAddress: async (id: number): Promise<number> => {
    const response = await axiosClient.delete<ApiResponse<number>>(
      `/api/v1/addresses/${id}`
    );
    const deletedID = requireData(response.data);
    if (Number(deletedID) !== Number(id)) {
      throw new Error("Máy chủ xác nhận xóa sai địa chỉ.");
    }
    return Number(deletedID);
  },

  /**
   * PATCH /api/v1/addresses/{id}/default
   * Đặt làm địa chỉ mặc định
   */
  setDefaultAddress: async (id: number): Promise<Address> => {
    const response = await axiosClient.patch<ApiResponse<Address>>(
      `/api/v1/addresses/${id}/default`
    );
    const data = requireData(response.data);
    return normalizeAddress(data);
  },
};

export default addressApi;
