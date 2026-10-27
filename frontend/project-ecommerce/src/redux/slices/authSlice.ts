import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";
import { setInMemoryAccessToken } from "../../api/axiosClient";
import type {
  UserProfile,
  UserRole,
  LoginPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  VerifyPasswordResetOtpPayload,
  VerifyPasswordResetOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../../types/ecommerce";

interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  accessToken: string | null; // Stored strictly in-memory via Redux
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Tells whether startup auth check has completed
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  showLoginSuccessToast: boolean;
  isLogoutModalOpen: boolean;

  // Password reset flow
  resetPasswordSession: {
    identity: string;
    mode: "email" | "phone";
    step: number;
    otp?: string;
  } | null;
  resetToken: string | null;
  resetPasswordLoading: boolean;
  resetPasswordError: string | null;
  resetPasswordSuccess: string | null;
}

const CACHED_USER_KEY = "mp_cached_user";

const getCachedUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    void 0;
  }
  return null;
};

const cachedUser = getCachedUser();

const initialState: AuthState = {
  user: cachedUser,
  role: cachedUser?.role || null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: Boolean(cachedUser),
  isInitialized: false,
  loading: false,
  error: null,
  successMessage: null,
  showLoginSuccessToast: false,
  isLogoutModalOpen: false,

  resetPasswordSession: null,
  resetToken: null,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: null,
};

/**
 * Thunk: Đăng nhập phân quyền (client / admin / seller)
 * Cấp access token ngắn mô phỏng lưu vào memory Redux
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      // Synchronize in-memory access token for axiosClient
      setInMemoryAccessToken(response.accessToken);
      return response;
    } catch (err: unknown) {
      let message = "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      if (err instanceof Error) {
        if (
          err.message.includes("Email/phone or password is incorrect") ||
          err.message.includes("invalid_credentials")
        ) {
          message = "Thông tin tài khoản hoặc mật khẩu không chính xác.";
        } else if (
          err.message.includes("Network Error") ||
          err.message.includes("Origin is not allowed")
        ) {
          message = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
        } else {
          message = err.message;
        }
      }
      return rejectWithValue(message);
    }
  }
);

/**
 * Thunk: Đăng ký tài khoản mới
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      setInMemoryAccessToken(response.accessToken);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to register"
      );
    }
  }
);

/**
 * Thunk: Refresh Token để lấy Access Token mới vào memory
 */
/**
 * Thunk: Refresh Token để lấy Access Token mới vào memory
 */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken();
      setInMemoryAccessToken(response.accessToken);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to refresh token"
      );
    }
  }
);

/**
 * Thunk: Gửi yêu cầu mã OTP phục hồi mật khẩu (Bước 1: Điền email hoặc số điện thoại)
 */
export const sendPasswordResetOtp = createAsyncThunk<
  RequestPasswordResetResponse,
  RequestPasswordResetPayload
>(
  "auth/sendPasswordResetOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.requestPasswordResetOtp(payload);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Gửi mã xác thực thất bại"
      );
    }
  }
);

/**
 * Thunk: Xác thực mã OTP (Bước 2)
 */
export const verifyPasswordResetOtp = createAsyncThunk<
  VerifyPasswordResetOtpResponse,
  VerifyPasswordResetOtpPayload
>(
  "auth/verifyPasswordResetOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyPasswordResetOtp(payload);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Xác thực mã OTP thất bại"
      );
    }
  }
);

/**
 * Thunk: Thiết lập mật khẩu mới (Bước 3)
 */
export const resetPasswordWithToken = createAsyncThunk<
  ResetPasswordResponse,
  ResetPasswordPayload
>(
  "auth/resetPasswordWithToken",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(payload);
      return response;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại"
      );
    }
  }
);

/**
 * Thunk: Đăng xuất — Chỉ khi đăng xuất mới xoá access token và thông tin phiên
 */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    await authApi.logout();
    setInMemoryAccessToken(null);
    return true;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
    dismissLoginToast: (state) => {
      state.showLoginSuccessToast = false;
    },
    openLogoutModal: (state) => {
      state.isLogoutModalOpen = true;
    },
    closeLogoutModal: (state) => {
      state.isLogoutModalOpen = false;
    },
    setAccessTokenInMemoryOnly: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      setInMemoryAccessToken(action.payload);
    },
    clearPasswordResetState: (state) => {
      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.accessToken = action.payload.accessToken; // Saved strictly in memory
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message || "Đăng nhập thành công!";
        state.showLoginSuccessToast = true;
        try {
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(action.payload.user));
        } catch {
          void 0;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.accessToken = action.payload.accessToken; // Saved strictly in memory
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message || "Registered successfully";
        try {
          localStorage.setItem(CACHED_USER_KEY, JSON.stringify(action.payload.user));
        } catch {
          void 0;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      })

      // Refresh Token
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.accessToken = action.payload.accessToken; // Updated in memory
        state.isAuthenticated = true;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.role = action.payload.user.role;
          try {
            localStorage.setItem(CACHED_USER_KEY, JSON.stringify(action.payload.user));
          } catch {
            void 0;
          }
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
        state.role = null;
        state.error = null;
        try {
          localStorage.removeItem(CACHED_USER_KEY);
        } catch {
          void 0;
        }
      })

      // Logout — Only on logout do we wipe the access token and session
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.accessToken = null; // Access token removed upon logout
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.loading = false;
        state.error = null;
        state.successMessage = "Logged out successfully";
        state.showLoginSuccessToast = false;
        state.isLogoutModalOpen = false;
        try {
          localStorage.removeItem(CACHED_USER_KEY);
        } catch {
          void 0;
        }
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.isLogoutModalOpen = false;
      })

      // Send Password Reset OTP (Step 1)
      .addCase(sendPasswordResetOtp.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = null;
      })
      .addCase(sendPasswordResetOtp.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = action.payload.message;
        state.resetPasswordSession = {
          identity: action.payload.identity,
          mode: action.payload.mode,
          step: 1,
          otp: action.payload.otp,
        };
      })
      .addCase(sendPasswordResetOtp.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = (action.payload as string) || "Gửi mã xác thực thất bại.";
      })

      // Verify OTP (Step 2)
      .addCase(verifyPasswordResetOtp.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = null;
      })
      .addCase(verifyPasswordResetOtp.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = action.payload.message;
        state.resetToken = action.payload.resetToken || null;
        if (state.resetPasswordSession) {
          state.resetPasswordSession.step = 2;
        }
      })
      .addCase(verifyPasswordResetOtp.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError =
          (action.payload as string) || "Mã OTP không chính xác hoặc đã hết hiệu lực.";
      })

      // Reset Password (Step 3)
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = action.payload.message;
        state.resetPasswordSession = null;
        state.resetToken = null;
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError =
          (action.payload as string) || "Đặt lại mật khẩu thất bại.";
      });
  },
});

export const {
  clearAuthError,
  clearAuthSuccess,
  dismissLoginToast,
  openLogoutModal,
  closeLogoutModal,
  setAccessTokenInMemoryOnly,
  clearPasswordResetState,
} = authSlice.actions;

export default authSlice.reducer;
