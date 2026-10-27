import axiosClient from "./axiosClient";
import type { BackendUser, ApiResponse } from "./authApi";
import type {
  UserProfileDetails,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UserRole,
} from "../types/ecommerce";

// These presentation fields are not part of the current backend user schema.
let cachedProfileExt: Partial<UserProfileDetails> = {};

const mapProfile = (user: BackendUser): UserProfileDetails => ({
  id: user.id,
  email: user.email,
  phone: user.phone,
  full_name: user.full_name,
  username: cachedProfileExt.username || user.email?.split("@")[0] || "user",
  avatar_url: cachedProfileExt.avatar_url || null,
  email_verified: user.email_verified ? 1 : 0,
  phone_verified: 0,
  status: user.status === "LOCKED" ? "LOCKED" : "ACTIVE",
  role: (user.role ? user.role.toLowerCase() : "client") as UserRole,
  date_of_birth: cachedProfileExt.date_of_birth,
  gender: cachedProfileExt.gender,
  membership_tier: cachedProfileExt.membership_tier,
  created_at: user.created_at || new Date().toISOString(),
  updated_at: user.created_at || new Date().toISOString(),
});

export const profileApi = {
  getProfile: async (): Promise<UserProfileDetails> => {
    const response = await axiosClient.get<ApiResponse<BackendUser>>("/api/v1/auth/me");
    return mapProfile(response.data.data);
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfileDetails> => {
    const response = await axiosClient.put<ApiResponse<BackendUser>>("/api/v1/auth/profile", {
      full_name: payload.full_name,
      phone: payload.phone,
    });
    cachedProfileExt = {
      ...cachedProfileExt,
      username: payload.username ?? cachedProfileExt.username,
      avatar_url: payload.avatar_url !== undefined ? payload.avatar_url : cachedProfileExt.avatar_url,
      date_of_birth: payload.date_of_birth ?? cachedProfileExt.date_of_birth,
      gender: payload.gender ?? cachedProfileExt.gender,
    };
    return mapProfile(response.data.data);
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    if (!payload.currentPassword) throw new Error("Vui lòng nhập mật khẩu hiện tại.");
    if (!payload.newPassword || payload.newPassword.length < 10) throw new Error("Mật khẩu mới phải có tối thiểu 10 ký tự.");
    if (payload.newPassword !== payload.confirmPassword) throw new Error("Xác nhận mật khẩu mới không khớp.");
    const response = await axiosClient.put<{ success: boolean; message?: string }>("/api/v1/auth/password", {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    });
    return { success: true, message: response.data.message || "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." };
  },

  removeAvatar: async (): Promise<UserProfileDetails> => {
    cachedProfileExt.avatar_url = null;
    return profileApi.getProfile();
  },
};

export default profileApi;
