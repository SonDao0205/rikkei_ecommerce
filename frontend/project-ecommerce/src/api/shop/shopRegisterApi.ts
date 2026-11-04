import axiosClient from "../axiosClient";
import type {
  Shop,
  ShopRegistrationFormData,
  ShopRegistrationResponse,
  ShopProfilePayload,
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

const sanitizeHttpsUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  return trimmed.startsWith("https://") ? trimmed : null;
};

export const shopRegisterApi = {
  /**
   * Gửi hồ sơ đăng ký mở gian hàng (Onboarding)
   * POST /api/v1/shops (Yêu cầu tài khoản có role CLIENT)
   */
  submitRegistration: async (
    data: ShopRegistrationFormData
  ): Promise<ShopRegistrationResponse> => {
    // 1. Chuẩn bị địa chỉ kho hàng từ thông tin Step 2 (phải từ 5 đến 500 ký tự)
    const addressParts = [
      data.store.addressDetail,
      data.store.ward,
      data.store.district,
      data.store.province,
    ]
      .map((s) => (s || "").trim())
      .filter(Boolean);

    const warehouseAddress =
      addressParts.join(", ") ||
      data.store.pickupAddress?.addressLine ||
      "Địa chỉ kho hàng Việt Nam";

    // 2. Chuẩn bị số điện thoại liên hệ
    const rawPhone = (
      data.store.warehousePhone ||
      data.account.phone ||
      ""
    ).trim().replace(/\s+/g, "");

    const phone = rawPhone.startsWith("0") || rawPhone.startsWith("+")
      ? rawPhone
      : rawPhone
      ? `0${rawPhone}`
      : "";

    // 3. Chuẩn bị payload chuẩn theo contract Go Backend
    const payload: ShopProfilePayload = {
      name: data.store.shopName.trim(),
      description: (data.store.bio || data.store.description || "Gian hàng chính hãng phân phối tại MarketPulse.").trim(),
      logo_url: sanitizeHttpsUrl(data.store.logoUrl),
      banner_url: sanitizeHttpsUrl(data.store.bannerUrl),
      phone,
      warehouse_address: warehouseAddress,
    };

    const response = await axiosClient.post<ApiResponse<Shop>>(
      "/api/v1/shops",
      payload
    );

    const shop = response.data?.data;

    return {
      applicationId: shop?.id ? `#SHOP-${String(shop.id).padStart(4, "0")}` : "#REQ-SHOP",
      status: "PENDING_APPROVAL",
      shopName: shop?.name || data.store.shopName,
      ownerEmail: data.account.email,
      submittedAt: shop?.created_at
        ? new Date(shop.created_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      estimatedReviewTime: "Trong vòng 24 - 48 giờ làm việc",
      message: response.data?.message || "Hồ sơ mở gian hàng đã được gửi thành công!",
    };
  },

  /**
   * Lưu bản nháp hồ sơ vào LocalStorage để tiếp tục sau
   */
  saveDraft: async (
    data: Partial<ShopRegistrationFormData>
  ): Promise<{ savedAt: string }> => {
    try {
      localStorage.setItem("marketpulse_shop_registration_draft", JSON.stringify(data));
    } catch {
      // LocalStorage access fallback
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    return { savedAt: timeStr };
  },
};

export default shopRegisterApi;
