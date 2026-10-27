import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// In-memory token storage (isolated in JavaScript memory, not persisted in localStorage)
let inMemoryAccessToken: string | null = null;

export const setInMemoryAccessToken = (token: string | null) => {
    inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = (): string | null => {
    return inMemoryAccessToken;
};

const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const rawBackendHost = import.meta.env.VITE_BACKEND_HOST;
const baseURL =
    typeof rawApiBase === "string" && rawApiBase !== ""
        ? rawApiBase
        : rawApiBase === ""
            ? ""
            : rawBackendHost || "";

export const axiosClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 15000,
});

interface RefreshSession {
  accessToken: string;
  user: unknown;
}

let refreshSessionPromise: Promise<RefreshSession> | null = null;

export const refreshSession = (): Promise<RefreshSession> => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = axiosClient
      .post<{ data: { access_token: string; user: unknown } }>(
        "/api/v1/auth/refresh",
        undefined,
        { headers: { Authorization: undefined } },
      )
      .then((response) => {
        const session = {
          accessToken: response.data.data.access_token,
          user: response.data.data.user,
        };
        setInMemoryAccessToken(session.accessToken);
        return session;
      })
      .finally(() => {
        refreshSessionPromise = null;
      });
  }
  return refreshSessionPromise;
};

axiosClient.interceptors.request.use(
    (config) => {
        // Read access token strictly from memory
        const token = inMemoryAccessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
  async (error: AxiosError<{ message?: string; code?: string; errors?: { code?: string; message?: string }[] }>) => {
        const data = error.response?.data;
    const code = data?.errors?.[0]?.code || data?.code;
    const original = error.config as (InternalAxiosRequestConfig & { _authRetry?: boolean }) | undefined;
    const url = original?.url || "";

    if (
      error.response?.status === 401 &&
      (code === "unauthorized" || code === "invalid_session") &&
      original &&
      !original._authRetry &&
      !url.includes("/api/v1/auth/refresh") &&
      !url.includes("/api/v1/auth/login") &&
      !url.includes("/api/v1/auth/register")
    ) {
      original._authRetry = true;
      try {
        const session = await refreshSession();
        original.headers.set("Authorization", `Bearer ${session.accessToken}`);
        return await axiosClient.request(original);
      } catch {
        setInMemoryAccessToken(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:session-expired"));
        }
      }
    }

        let message =
            data?.message ||
            (Array.isArray(data?.errors) && data.errors[0]?.message) ||
            error.message ||
            "An unexpected error occurred";

        const errorCode = code;

        if (
            message.includes("Email/phone or password is incorrect") ||
            errorCode === "invalid_credentials"
        ) {
            message = "Thông tin tài khoản hoặc mật khẩu không chính xác.";
        } else if (errorCode === "invalid_or_expired_otp") {
            message = "Mã OTP không chính xác hoặc đã hết hạn.";
        } else if (errorCode === "invalid_current_password") {
            message = "Mật khẩu hiện tại không chính xác.";
        } else if (errorCode === "password_reused") {
            message = "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
        } else if (errorCode === "invalid_password_request") {
            message = "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới hợp lệ (tối thiểu 10 ký tự, có cả chữ và số).";
        } else if (errorCode === "invalid_reset_request") {
            message = "Mã OTP và mật khẩu mới hợp lệ là bắt buộc.";
        } else if (errorCode === "rate_limited" || error.response?.status === 429) {
            message = "Thao tác quá nhanh. Vui lòng thử lại sau giây lát.";
        }

        const enhancedError = Object.assign(new Error(message), {
            response: error.response,
            errors: data?.errors,
        });
        return Promise.reject(enhancedError);
    }
);

export default axiosClient;
