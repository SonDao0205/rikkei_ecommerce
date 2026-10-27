import axiosClient from "./axiosClient";
import authApi, { type BackendUser, type ApiResponse } from "./authApi";
import type {
  UserProfileDetails,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UserRole,
} from "../types/ecommerce";

/**
 * Local cache for extra presentation attributes (e.g. date_of_birth, gender, membership tier)
 * not yet stored on the backend MVP database.
 */
let cachedProfileExt: Partial<UserProfileDetails> = {
  username: "user_rikkei",
  date_of_birth: {
    day: "15",
    month: "Tháng 08",
    year: "1995",
  },
  gender: "male",
  membership_tier: "Thành Viên Thân Thiết",
};

export const profileApi = {
  /**
   * Lấy thông tin hồ sơ người dùng thật từ Backend (GET /api/v1/auth/me)
   */
  getProfile: async (): Promise<UserProfileDetails> => {
    try {
      const res = await axiosClient.get<ApiResponse<BackendUser>>(
        "/api/v1/auth/me"
      );

      const u = res.data.data;
      return {
        id: u.id,
        email: u.email,
        phone: u.phone,
        full_name: u.full_name,
        username: cachedProfileExt.username || u.email?.split("@")[0] || "user",
        avatar_url: cachedProfileExt.avatar_url || null,
        email_verified: 1,
        phone_verified: 1,
        status: u.status === "LOCKED" ? "LOCKED" : "ACTIVE",
        role: (u.role ? (u.role.toLowerCase() as UserRole) : "client"),
        date_of_birth: cachedProfileExt.date_of_birth,
        gender: cachedProfileExt.gender,
        membership_tier: cachedProfileExt.membership_tier,
        created_at: u.created_at || new Date().toISOString(),
        updated_at: u.created_at || new Date().toISOString(),
      };
    } catch {
      // Nếu chưa có access token hoặc chưa đăng nhập, trả về cache mặc định
      return {
        id: 0,
        email: "",
        phone: "",
        full_name: "Khách hàng",
        username: "guest",
        avatar_url: null,
        email_verified: 0,
        status: "ACTIVE",
        role: "client",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  /**
   * Cập nhật thông tin hồ sơ (MVP client-side sync)
   */
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<UserProfileDetails> => {
    cachedProfileExt = {
      ...cachedProfileExt,
      username: payload.username || cachedProfileExt.username,
      avatar_url:
        payload.avatar_url !== undefined
          ? payload.avatar_url
          : cachedProfileExt.avatar_url,
      date_of_birth: payload.date_of_birth || cachedProfileExt.date_of_birth,
      gender: payload.gender || cachedProfileExt.gender,
    };

    return await profileApi.getProfile();
  },

  /**
   * Đổi mật khẩu tài khoản (PUT /api/v1/auth/password)
   */
  changePassword: async (
    payload: ChangePasswordPayload
  ): Promise<{ success: boolean; message: string }> => {
    return await authApi.changePassword(payload);
  },

  /**
   * Xóa avatar
   */
  removeAvatar: async (): Promise<UserProfileDetails> => {
    cachedProfileExt.avatar_url = null;
    return await profileApi.getProfile();
  },
};

export default profileApi;
