import axiosClient from "../axiosClient";
import type {
  ShopRegistrationFormData,
  ShopRegistrationResponse,
  ShopTermsAcceptance,
} from "../../types";

export const initialShopRegistrationData: ShopRegistrationFormData = {
  account: {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  },
  store: {
    logoUrl: "",
    shopName: "",
    category: "Thời trang, Giày dép & Phụ kiện thể thao",
    bio: "",
    customStoreUrl: "",
    warehouseContact: "",
    warehousePhone: "",
    province: "TP. Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    addressDetail: "",
    pickupNote: "",
    sameReturnAddress: true,
  },
  kyc: {
    idNumber: "",
    issueDate: "",
    issuePlace: "",
    frontCardUrl: "",
    frontCardName: "",
    frontCardSize: "",
    backCardUrl: "",
    backCardName: "",
    backCardSize: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    bankBranch: "",
  },
  agreements: {
    agreeServicePolicy: false,
    agreeAuthenticCommitment: false,
    agreeEkycConsent: false,
  },
};

export interface BackendShop {
  id: number;
  name: string;
  status: string;
  updated_at: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  phone?: string | null;
  warehouse_address?: string | null;
  reject_reason?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const shopProfilePayload = (data: ShopRegistrationFormData) => {
  const store = data.store;
  const warehouseAddress = [
    store.addressDetail,
    store.ward,
    store.district,
    store.province,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  return {
    name: store.shopName.trim(),
    description: store.bio.trim(),
    logo_url: store.logoUrl.trim() || null,
    banner_url: store.bannerUrl?.trim() || null,
    phone: store.warehousePhone.trim() || data.account.phone.trim(),
    warehouse_address: warehouseAddress,
  };
};

const getCurrentShop = async (): Promise<BackendShop | null> => {
  try {
    const response = await axiosClient.get<ApiResponse<BackendShop>>(
      "/api/v1/me/shop",
    );
    return response.data.data;
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "status" in error.response
        ? error.response.status
        : undefined;
    if (status === 404) return null;
    throw error;
  }
};

const saveProfile = async (
  data: ShopRegistrationFormData,
): Promise<BackendShop> => {
  const payload = shopProfilePayload(data);
  const current = await getCurrentShop();
  if (!current) {
    try {
      const response = await axiosClient.post<ApiResponse<BackendShop>>(
        "/api/v1/me/shop",
        payload,
      );
      return response.data.data;
    } catch (error: unknown) {
      if (!isAxiosStatus(error, 409)) throw error;
      const createdByAnotherRequest = await getCurrentShop();
      if (!createdByAnotherRequest) throw error;
    }
  }
  const response = await axiosClient.put<ApiResponse<BackendShop>>(
    "/api/v1/me/shop",
    payload,
  );
  return response.data.data;
};

const isAxiosStatus = (error: unknown, status: number): boolean =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  typeof error.response === "object" &&
  error.response !== null &&
  "status" in error.response &&
  error.response.status === status;

export const shopRegisterApi = {
  getMyShop: getCurrentShop,

  submitRegistration: async (
    data: ShopRegistrationFormData,
    agreements: ShopTermsAcceptance,
  ): Promise<ShopRegistrationResponse> => {
    let shop = await saveProfile(data);
    if (shop.status !== "PENDING") {
      try {
        const response = await axiosClient.post<ApiResponse<BackendShop>>(
          "/api/v1/me/shop/submit",
          { agreements },
        );
        shop = response.data.data;
      } catch (error: unknown) {
        if (!isAxiosStatus(error, 409)) throw error;
        const latest = await getCurrentShop();
        if (!latest || latest.status !== "PENDING") throw error;
        shop = latest;
      }
    }

    return {
      applicationId: String(shop.id),
      status: "PENDING_APPROVAL",
      shopName: shop.name,
      ownerEmail: data.account.email,
      submittedAt: shop.updated_at || new Date().toISOString(),
      estimatedReviewTime: "",
      message: "Hồ sơ đã được gửi lên máy chủ và đang chờ xét duyệt.",
    };
  },

  saveDraft: async (
    data: Partial<ShopRegistrationFormData>,
  ): Promise<{ savedAt: string }> => {
    const formData: ShopRegistrationFormData = {
      ...initialShopRegistrationData,
      ...data,
      account: { ...initialShopRegistrationData.account, ...data.account },
      store: { ...initialShopRegistrationData.store, ...data.store },
      kyc: { ...initialShopRegistrationData.kyc, ...data.kyc },
      agreements: {
        ...initialShopRegistrationData.agreements,
        ...data.agreements,
      },
    };
    const shop = await saveProfile(formData);
    return {
      savedAt: shop.updated_at
        ? new Date(shop.updated_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
    };
  },
};

export default shopRegisterApi;
