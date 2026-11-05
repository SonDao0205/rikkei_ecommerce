import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// In-memory token storage (isolated in JavaScript memory, not persisted in localStorage)
let inMemoryAccessToken: string | null = null;

export const setInMemoryAccessToken = (token: string | null) => {
    inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = (): string | null => {
    return inMemoryAccessToken;
};

export const shouldFallbackToMock = (error: unknown): boolean => {
    if (
        typeof error !== "object" ||
        error === null ||
        !("isAxiosError" in error) ||
        error.isAxiosError !== true
    ) {
        return false;
    }

    if (!("response" in error) || error.response == null) {
        return true;
    }

    return (
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        typeof error.response.status === "number" &&
        error.response.status >= 500
    );
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
        } else if (errorCode === "product_not_found") {
            message = "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.";
        } else if (errorCode === "shop_not_found") {
            message = "Cửa hàng không tồn tại hoặc tạm ngưng hoạt động.";
        } else if (errorCode === "self_follow_denied" || errorCode === "cannot_follow_own_shop") {
            message = "Bạn không thể theo dõi cửa hàng của chính mình.";
        } else if (errorCode === "invalid_product_status") {
            message = "Chỉ có thể thay đổi trạng thái cho sản phẩm đã được duyệt.";
        } else if (errorCode === "invalid_product_filters") {
            message = "Bộ lọc hoặc tham số tìm kiếm không hợp lệ.";
        } else if (errorCode === "address_limit_exceeded") {
            message = "Bạn đã đạt giới hạn tối đa 20 địa chỉ giao hàng.";
        } else if (errorCode === "address_not_found") {
            message = "Địa chỉ giao hàng không tồn tại hoặc đã bị xóa.";
        } else if (errorCode === "invalid_recipient_name") {
            message = "Họ và tên người nhận phải từ 2 đến 120 ký tự.";
        } else if (errorCode === "invalid_phone") {
            message = "Số điện thoại phải từ 9 đến 15 chữ số.";
        } else if (errorCode === "invalid_street_detail") {
            message = "Địa chỉ chi tiết (số nhà, tên đường) phải từ 3 đến 255 ký tự.";
        } else if (
            errorCode === "invalid_province" ||
            errorCode === "invalid_district" ||
            errorCode === "invalid_ward"
        ) {
            message = "Thông tin Tỉnh/Thành, Quận/Huyện hoặc Phường/Xã không hợp lệ.";
        } else if (errorCode === "invalid_address_type") {
            message = "Loại địa chỉ phải là HOME, OFFICE hoặc OTHER.";
        } else if (errorCode === "shop_already_exists") {
            message = "Tài khoản của bạn đã có gian hàng hoặc tên gian hàng này đã được sử dụng.";
        } else if (errorCode === "shop_name_in_use") {
            message = "Tên gian hàng đã được sử dụng bởi người khác.";
        } else if (errorCode === "invalid_shop_name") {
            message = "Tên gian hàng phải từ 2 đến 150 ký tự.";
        } else if (errorCode === "invalid_shop_description") {
            message = "Mô tả gian hàng không được vượt quá 2000 ký tự.";
        } else if (errorCode === "invalid_shop_phone") {
            message = "Số điện thoại gian hàng phải từ 9 đến 15 chữ số.";
        } else if (errorCode === "invalid_warehouse_address") {
            message = "Địa chỉ kho hàng phải từ 5 đến 500 ký tự.";
        } else if (errorCode === "invalid_logo_url") {
            message = "Logo gian hàng phải là đường dẫn HTTPS hợp lệ.";
        } else if (errorCode === "invalid_banner_url") {
            message = "Ảnh bìa gian hàng phải là đường dẫn HTTPS hợp lệ.";
        } else if (errorCode === "invalid_shop_id") {
            message = "Mã định danh gian hàng không hợp lệ.";
        } else if (errorCode === "invalid_shop_status") {
            message = "Trạng thái gian hàng không hợp lệ.";
        } else if (errorCode === "invalid_reject_reason") {
            message = "Lý do là bắt buộc khi từ chối hoặc khóa gian hàng (tối đa 500 ký tự).";
        } else if (errorCode === "invalid_notes") {
            message = "Ghi chú không được vượt quá 500 ký tự.";
        } else if (errorCode === "shop_owner_inactive") {
            message = "Tài khoản chủ gian hàng đang bị vô hiệu hóa hoặc bị khóa, không thể duyệt.";
        } else if (errorCode === "invalid_shop_owner_role") {
            message = "Tài khoản chủ sở hữu không thể nâng cấp lên vai trò Người bán.";
        } else if (errorCode === "active_shop_required") {
            message = "Yêu cầu gian hàng được duyệt và đang hoạt động để thực hiện thao tác.";
        } else if (errorCode === "unexpected_variant_id") {
            message = "Mã biến thể chỉ được chấp nhận khi cập nhật sản phẩm.";
        } else if (errorCode === "invalid_variant_id") {
            message = "Mã biến thể không thuộc về sản phẩm này.";
        } else if (errorCode === "sku_in_use") {
            message = "Mã SKU này đã tồn tại trong hệ thống. Vui lòng chọn SKU khác.";
        } else if (errorCode === "product_conflict") {
            message = "Tên hoặc đường dẫn sản phẩm bị trùng lặp trong gian hàng.";
        } else if (errorCode === "invalid_category_variant_attribute") {
            message = "Thuộc tính biến thể không khớp với danh mục ngành hàng đã chọn.";
        } else if (errorCode === "missing_required_variant_attribute") {
            message = "Biến thể thiếu thuộc tính bắt buộc của danh mục.";
        } else if (errorCode === "duplicate_variant_attribute") {
            message = "Mỗi biến thể chỉ được chọn một giá trị cho mỗi thuộc tính.";
        } else if (errorCode === "inconsistent_variant_attributes") {
            message = "Tất cả biến thể của sản phẩm phải có cùng cấu trúc thuộc tính.";
        } else if (errorCode === "duplicate_variant_combination") {
            message = "Mỗi biến thể phải có sự kết hợp thuộc tính riêng biệt, không được trùng nhau.";
        } else if (errorCode === "invalid_product_images") {
            message = "Sản phẩm phải có từ 1 đến 10 hình ảnh.";
        } else if (errorCode === "invalid_product_variants") {
            message = "Sản phẩm phải có từ 1 đến 50 biến thể.";
        } else if (errorCode === "invalid_product_image_url") {
            message = "Đường dẫn hình ảnh sản phẩm phải là liên kết HTTPS hợp lệ.";
        } else if (errorCode === "rate_limited" || error.response?.status === 429) {
            message = "Thao tác quá nhanh. Vui lòng thử lại sau giây lát.";
        }

        const enhancedError = Object.assign(new Error(message), {
            response: error.response,
            errors: data?.errors,
            isAxiosError: true,
        });
        return Promise.reject(enhancedError);
    }
);

export default axiosClient;
