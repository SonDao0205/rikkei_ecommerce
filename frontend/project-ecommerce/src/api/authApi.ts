import axiosClient from "./axiosClient";
import type {
  UserProfile,
  UserRole,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  RefreshTokenResponse,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  VerifyPasswordResetOtpPayload,
  VerifyPasswordResetOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../types/ecommerce";

/**
 * Interface describing user schema returned from Go backend (internal/auth/model.go)
 */
export interface BackendUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  email_verified?: number | boolean;
  created_at: string;
}

export interface BackendAuthData {
  user: BackendUser;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export type AuthUser = UserProfile;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Normalizes backend user (role in UPPERCASE like "CLIENT", "ADMIN") to frontend UserProfile
 */
export const mapBackendUser = (u: BackendUser): UserProfile => ({
  id: u.id,
  email: u.email,
  phone: u.phone,
  full_name: u.full_name,
  avatar_url: null,
  email_verified: u.email_verified ? 1 : 0,
  status: u.status === "LOCKED" ? "LOCKED" : "ACTIVE",
  role: u.role ? (u.role.toLowerCase() as UserRole) : "client",
  created_at: u.created_at || new Date().toISOString(),
  updated_at: u.created_at || new Date().toISOString(),
});

/**
 * Kept for backward compatibility if any legacy code checks localStorage
 */
const CLIENT_RT_KEY = "mp_client_refresh_token";
export const getStoredClientRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(CLIENT_RT_KEY);
  } catch {
    return null;
  }
};

export const setStoredClientRefreshToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(CLIENT_RT_KEY, token);
    } else {
      localStorage.removeItem(CLIENT_RT_KEY);
    }
  } catch {
    void 0;
  }
};

let activeRefreshPromise: Promise<RefreshTokenResponse> | null = null;

/**
 * Real API client matching Rikkei E-Commerce Backend (Section 2 - FE Guide)
 */
export const authApi = {
  /**
   * Đăng ký tài khoản mới (POST /api/v1/auth/register)
   * Tự động đăng nhập sau khi tạo tài khoản thành công để cấp access token và refresh cookie
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const cleanPhone = payload.phone.replace(/[\s\-()]/g, "");

    // 1. Gọi API tạo tài khoản CLIENT
    try {
      await axiosClient.post<ApiResponse<BackendUser>>(
        "/api/v1/auth/register",
        {
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          full_name: payload.fullName.trim(),
          phone: cleanPhone,
        },
      );
    } catch (err: unknown) {
      // Nếu tài khoản đã tồn tại (ví dụ đã được tạo ở lần bấm trước trước khi lỗi client xảy ra),
      // thử đăng nhập ngay bằng chính thông tin người dùng vừa nhập
      const errorObj = err as {
        response?: { status?: number };
        message?: string;
      };
      if (
        errorObj?.response?.status === 409 ||
        errorObj?.message?.toLowerCase().includes("already exists")
      ) {
        try {
          return await authApi.login({
            identifier: payload.email.trim().toLowerCase(),
            password: payload.password,
          });
        } catch {
          throw err;
        }
      }
      throw err;
    }

    // 2. Tự động đăng nhập để nhận Access Token và HttpOnly Refresh Cookie
    const loginRes = await axiosClient.post<ApiResponse<BackendAuthData>>(
      "/api/v1/auth/login",
      {
        identifier: payload.email.trim().toLowerCase(),
        password: payload.password,
      },
    );

    const authData = loginRes.data.data;
    const user = mapBackendUser(authData.user);
    return {
      user,
      accessToken: authData.access_token,
      refreshToken: "", // Refresh token được lưu riêng trong HttpOnly cookie
      message: "Đăng ký và khởi tạo phiên thành công!",
    };
  },

  /**
   * Đăng nhập (POST /api/v1/auth/login)
   * Identifier nhận email hoặc số điện thoại
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<BackendAuthData>>(
      "/api/v1/auth/login",
      {
        identifier: payload.identifier.trim(),
        password: payload.password,
      },
    );

    const authData = res.data.data;
    const user = mapBackendUser(authData.user);
    return {
      user,
      accessToken: authData.access_token,
      refreshToken: "", // Refresh token được đặt trong cookie HttpOnly
      message: `Đăng nhập thành công với vai trò ${user.role.toUpperCase()}!`,
    };
  },

  /**
   * Làm mới phiên (POST /api/v1/auth/refresh)
   * Trình duyệt tự động gửi kèm cookie `refresh_token` qua withCredentials.
   * Sử dụng deduplication để tránh gửi 2 request song song làm backend kích hoạt replay detection thu hồi phiên.
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
      try {
        const res = await axiosClient.post<ApiResponse<BackendAuthData>>(
          "/api/v1/auth/refresh",
        );

        const authData = res.data.data;
        return {
          accessToken: authData.access_token,
          user: mapBackendUser(authData.user),
        };
      } finally {
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  },

  /**
   * Đăng xuất (POST /api/v1/auth/logout)
   * Yêu cầu Bearer access token; backend thu hồi phiên và xóa refresh cookie
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await axiosClient.post<{
        success: boolean;
        message?: string;
      }>("/api/v1/auth/logout");

      return {
        success: true,
        message: res.data.message || "Đăng xuất thành công.",
      };
    } catch {
      return {
        success: true,
        message: "Phiên làm việc đã kết thúc.",
      };
    } finally {
      setStoredClientRefreshToken(null);
    }
  },

  /**
   * Lấy hồ sơ tài khoản hiện tại (GET /api/v1/auth/me)
   */
  getMe: async (): Promise<UserProfile> => {
    const res =
      await axiosClient.get<ApiResponse<BackendUser>>("/api/v1/auth/me");

    return mapBackendUser(res.data.data);
  },

  /**
   * Yêu cầu mã OTP khôi phục mật khẩu (POST /api/v1/auth/forgot-password)
   * Nhận email hoặc số điện thoại; OTP được gửi đến email đăng ký
   */
  requestPasswordResetOtp: async (
    payload: RequestPasswordResetPayload,
  ): Promise<RequestPasswordResetResponse> => {
    const res = await axiosClient.post<{
      success: boolean;
      message: string;
    }>("/api/v1/auth/forgot-password", {
      identifier: payload.identity.trim(),
    });

    return {
      success: true,
      message:
        res.data.message ||
        "Nếu tài khoản tồn tại, mã xác thực đã được gửi tới email của bạn.",
      identity: payload.identity.trim(),
      mode: payload.mode,
    };
  },

  /**
   * Xác thực mã OTP (bước 2)
   * Kiểm tra định dạng 6 chữ số trước khi tiếp tục
   */
  verifyPasswordResetOtp: async (
    payload: VerifyPasswordResetOtpPayload,
  ): Promise<VerifyPasswordResetOtpResponse> => {
    const trimmedOtp = payload.otp.trim();
    if (!/^\d{6}$/.test(trimmedOtp)) {
      throw new Error("Mã OTP phải gồm chính xác 6 chữ số.");
    }

    const res = await axiosClient.post<{ success: boolean; message: string }>(
      "/api/v1/auth/verify-reset-otp",
      { identifier: payload.identity.trim(), otp: trimmedOtp },
    );

    return {
      success: true,
      message: res.data.message || "OTP valid.",
      resetToken: trimmedOtp,
    };
  },

  /**
   * Đặt lại mật khẩu (POST /api/v1/auth/reset-password)
   * Nhận email, otp 6 chữ số và mật khẩu mới (tối thiểu 10 ký tự, có chữ và số)
   */
  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<ResetPasswordResponse> => {
    const res = await axiosClient.post<{
      success: boolean;
      message: string;
    }>("/api/v1/auth/reset-password", {
      email: payload.identity.trim().toLowerCase(),
      otp: payload.resetToken?.trim() || "",
      new_password: payload.newPassword,
    });

    return {
      success: true,
      message:
        res.data.message ||
        "Thiết lập mật khẩu mới thành công! Vui lòng đăng nhập lại.",
    };
  },

  /**
   * Danh sách người dùng dành cho quản trị viên (GET /api/v1/admin/users)
   * Yêu cầu role ADMIN
   */
  getAdminUsers: async (): Promise<UserProfile[]> => {
    const res = await axiosClient.get<ApiResponse<BackendUser[]>>(
      "/api/v1/admin/users",
    );

    return res.data.data.map(mapBackendUser);
  },

  /**
   * Kiểm tra sức khỏe dịch vụ (GET /healthz)
   */
  checkHealth: async (): Promise<{ status: string }> => {
    const res =
      await axiosClient.get<ApiResponse<{ status: string }>>("/healthz");

    return res.data.data;
  },

  /**
   * Danh sách tài khoản demo
   */

  // Compatibility methods for legacy standalone pages retained under src.
  restoreSession: async (): Promise<UserProfile> => (await authApi.refreshToken()).user,
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    await axiosClient.put("/api/v1/auth/password", { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
  },
};

export default authApi;
