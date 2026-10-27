import { apiRequest, jsonBody, setAccessToken } from "./httpClient";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
}

interface AuthData {
  user: AuthUser;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const authApi = {
  async register(input: { fullName: string; email: string; phone: string; password: string }) {
    await apiRequest<AuthUser>("/api/v1/auth/register", {
      method: "POST",
      body: jsonBody({
        full_name: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.replace(/[\s\-()]/g, ""),
        password: input.password,
      }),
    });
    return this.login(input.email, input.password);
  },

  async login(identifier: string, password: string) {
    const result = await apiRequest<AuthData>("/api/v1/auth/login", {
      method: "POST",
      body: jsonBody({ identifier: identifier.trim(), password }),
    });
    setAccessToken(result.access_token);
    return result.user;
  },

  async restoreSession() {
    const result = await apiRequest<AuthData>("/api/v1/auth/refresh", { method: "POST" });
    setAccessToken(result.access_token);
    return result.user;
  },

  me: () => apiRequest<AuthUser>("/api/v1/auth/me"),

  async logout() {
    try {
      await apiRequest<{ message?: string }>("/api/v1/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    const result = await apiRequest<{ message?: string }>("/api/v1/auth/password", {
      method: "PUT",
      body: jsonBody({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
    setAccessToken(null);
    return result;
  },

  requestPasswordReset: (identifier: string) =>
    apiRequest<{ message?: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: jsonBody({ identifier: identifier.trim() }),
    }),

  verifyResetOTP: (identifier: string, otp: string) =>
    apiRequest<{ message?: string }>("/api/v1/auth/verify-reset-otp", {
      method: "POST",
      body: jsonBody({ identifier: identifier.trim(), otp: otp.trim() }),
    }),

  resetPassword: (identifier: string, otp: string, newPassword: string) =>
    apiRequest<{ message?: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: jsonBody({ identifier: identifier.trim(), otp: otp.trim(), new_password: newPassword }),
    }),
};

