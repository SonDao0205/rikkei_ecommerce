import axios from "axios";

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
  (error) => {
    const data = error.response?.data;
    let message =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      error.message ||
      "An unexpected error occurred";

    if (
      message.includes("Email/phone or password is incorrect") ||
      data?.errors?.[0]?.code === "invalid_credentials"
    ) {
      message = "Thông tin tài khoản hoặc mật khẩu không chính xác.";
    }

    const enhancedError = Object.assign(new Error(message), {
      response: error.response,
      errors: data?.errors,
    });
    return Promise.reject(enhancedError);
  }
);

export default axiosClient;
