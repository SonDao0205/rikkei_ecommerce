import { APP_CONFIG } from "../config/appConfig";

/**
 * Trả về đường dẫn avatar mặc định dựa theo tên người dùng thông qua dịch vụ avatar (mặc định ui-avatars.com).
 * URL service được cấu hình linh hoạt qua biến môi trường VITE_DEFAULT_AVATAR_SERVICE_URL.
 */
export const getDefaultAvatar = (name?: string | null): string => {
  const displayName = name?.trim() || "User";
  const baseUrl = APP_CONFIG.defaultAvatarServiceUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}name=${encodeURIComponent(displayName)}&background=random&color=fff`;
};
