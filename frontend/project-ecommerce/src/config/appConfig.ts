/**
 * Cấu hình tập trung toàn bộ các biến môi trường cho Frontend.
 * Đảm bảo fallback an toàn khi biến môi trường chưa được thiết lập.
 */
export const APP_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || "MarketPulse",
  appEnv: import.meta.env.VITE_APP_ENV || "development",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  backendHost: import.meta.env.VITE_BACKEND_HOST || "http://localhost:8080",
  defaultAvatarServiceUrl:
    import.meta.env.VITE_DEFAULT_AVATAR_SERVICE_URL || "https://ui-avatars.com/api/",
  supportHotline: import.meta.env.VITE_SUPPORT_HOTLINE || "+84 1900 6868",
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "support@marketpulse.vn",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export default APP_CONFIG;
