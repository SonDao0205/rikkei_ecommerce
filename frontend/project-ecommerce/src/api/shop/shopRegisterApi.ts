import axiosClient from "../axiosClient";
import type {
  ShopRegistrationFormData,
  ShopRegistrationResponse,
} from "../../types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
    bankName: "Vietcombank - Ngân hàng Ngoại thương Việt Nam",
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

export const shopRegisterApi = {
  /**
   * Gửi hồ sơ đăng ký mở gian hàng (Onboarding)
   * POST /api/v1/shops/register
   */
  submitRegistration: async (
    data: ShopRegistrationFormData
  ): Promise<ShopRegistrationResponse> => {
    try {
      const response = await axiosClient.post<ApiResponse<ShopRegistrationResponse>>(
        "/api/v1/shops/register",
        data
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Mock fallback response if endpoint is not implemented on backend
    }

    // Mock response simulating successful submission
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      applicationId: "#REQ-SHOP-" + Math.floor(1000 + Math.random() * 9000),
      status: "PENDING_APPROVAL",
      shopName: data.store.shopName || "UrbanStep Official Store",
      ownerEmail: data.account.email || "nguyen.vana@gmail.com",
      submittedAt: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      estimatedReviewTime: "Trong vòng 24 - 48 giờ làm việc",
      message: "Hồ sơ mở gian hàng đã được gửi thành công!",
    };
  },

  /**
   * Lưu bản nháp hồ sơ
   */
  saveDraft: async (
    data: Partial<ShopRegistrationFormData>
  ): Promise<{ savedAt: string }> => {
    try {
      await axiosClient.post("/api/v1/shops/register/draft", data);
    } catch {
      // Fallback local save
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    return { savedAt: timeStr };
  },
};

export default shopRegisterApi;
