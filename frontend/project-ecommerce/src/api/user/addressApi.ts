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

export let mockAddressesState: Address[] = [
  {
    id: 910001,
    user_id: 900003,
    recipient_name: "Nguyễn Văn A",
    phone: "0909123456",
    province: "TP. Hồ Chí Minh",
    district: "Quận 3",
    ward: "Phường Võ Thị Sáu",
    street_detail: "142 Võ Thị Sáu",
    is_default: 1,
    address_type: "HOME",
    created_at: "2026-10-15T08:30:00Z",
  },
  {
    id: 910002,
    user_id: 900003,
    recipient_name: "Nguyễn Văn A",
    phone: "0918888999",
    province: "TP. Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    street_detail: "Tầng 4, Tòa nhà Bitexco Financial Tower, số 2 Hải Triều",
    is_default: 0,
    address_type: "OFFICE",
    created_at: "2026-10-18T14:20:00Z",
  },
  {
    id: 910003,
    user_id: 900003,
    recipient_name: "Nguyễn Văn A",
    phone: "0910000003",
    province: "Hà Nội",
    district: "Cầu Giấy",
    ward: "Phường Dịch Vọng",
    street_detail: "12 Phố Duy Tân, Toà nhà FPT Cầu Giấy",
    is_default: 0,
    address_type: "OFFICE",
    created_at: "2026-10-22T09:15:00Z",
  },
];

export const addressApi = {
  fetchAddresses: async (): Promise<Address[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<Address[]>>("/api/v1/addresses");
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch {
      // Fallback to local mock state
    }
    return mockAddressesState;
  },

  createAddress: async (payload: CreateAddressPayload): Promise<Address> => {
    try {
      const response = await axiosClient.post<ApiResponse<Address>>("/api/v1/addresses", payload);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory create
    }

    const newId = Date.now();
    const shouldBeDefault = Boolean(payload.is_default) || mockAddressesState.length === 0;

    if (shouldBeDefault) {
      mockAddressesState = mockAddressesState.map((addr) => ({
        ...addr,
        is_default: 0,
      }));
    }

    const newAddress: Address = {
      id: newId,
      recipient_name: payload.recipient_name,
      phone: payload.phone,
      province: payload.province,
      district: payload.district,
      ward: payload.ward,
      street_detail: payload.street_detail,
      is_default: shouldBeDefault ? 1 : 0,
      address_type: payload.address_type || "HOME",
      created_at: new Date().toISOString(),
    };

    mockAddressesState.unshift(newAddress);
    return newAddress;
  },

  updateAddress: async (payload: UpdateAddressPayload): Promise<Address> => {
    try {
      const response = await axiosClient.put<ApiResponse<Address>>(
        `/api/v1/addresses/${payload.id}`,
        payload
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
    }

    const shouldBeDefault = Boolean(payload.is_default);

    if (shouldBeDefault) {
      mockAddressesState = mockAddressesState.map((addr) => ({
        ...addr,
        is_default: addr.id === payload.id ? 1 : 0,
      }));
    }

    const idx = mockAddressesState.findIndex((addr) => addr.id === payload.id);
    if (idx !== -1) {
      mockAddressesState[idx] = {
        ...mockAddressesState[idx],
        recipient_name: payload.recipient_name,
        phone: payload.phone,
        province: payload.province,
        district: payload.district,
        ward: payload.ward,
        street_detail: payload.street_detail,
        is_default: shouldBeDefault ? 1 : 0,
        address_type: payload.address_type || mockAddressesState[idx].address_type,
        updated_at: new Date().toISOString(),
      };
      return mockAddressesState[idx];
    }

    throw new Error("Không tìm thấy địa chỉ");
  },

  deleteAddress: async (id: number): Promise<number> => {
    try {
      await axiosClient.delete(`/api/v1/addresses/${id}`);
    } catch {
      // In-memory delete
    }

    mockAddressesState = mockAddressesState.filter((addr) => addr.id !== id);

    // If default was deleted, promote first address to default
    if (mockAddressesState.length > 0 && !mockAddressesState.some((a) => Boolean(a.is_default))) {
      mockAddressesState[0].is_default = 1;
    }

    return id;
  },

  setDefaultAddress: async (id: number): Promise<Address> => {
    try {
      const response = await axiosClient.patch<ApiResponse<Address>>(
        `/api/v1/addresses/${id}/default`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory set default
    }

    mockAddressesState = mockAddressesState.map((addr) => ({
      ...addr,
      is_default: addr.id === id ? 1 : 0,
    }));

    const target = mockAddressesState.find((addr) => addr.id === id);
    if (!target) throw new Error("Không tìm thấy địa chỉ");
    return target;
  },
};

export default addressApi;
