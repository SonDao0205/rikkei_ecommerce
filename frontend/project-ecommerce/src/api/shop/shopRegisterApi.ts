import type {
  ShopRegistrationFormData,
  ShopRegistrationResponse,
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
  submitRegistration: async (
    data: ShopRegistrationFormData
  ): Promise<ShopRegistrationResponse> => {
    return {
      applicationId: `#LOCAL-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: "MOCKED",
      shopName: data.store.shopName || "UrbanStep Official Store",
      ownerEmail: data.account.email,
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: "",
      message: "Backend chưa có API tiếp nhận hồ sơ onboarding/KYC. Đây chỉ là bản mô phỏng; hồ sơ chưa được gửi hoặc lưu trên máy chủ.",
    };
  },

  saveDraft: async (
    _data: Partial<ShopRegistrationFormData>
  ): Promise<{ savedAt: string }> => {
    void _data;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    return { savedAt: timeStr };
  },
};

export default shopRegisterApi;
