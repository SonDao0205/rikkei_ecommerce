import { APP_CONFIG } from "@/shared/config/appConfig";

/**
 * Trả về đường dẫn avatar mặc định dựa theo tên người dùng thông qua dịch vụ avatar (mặc định ui-avatars.com).
 * URL service được cấu hình linh hoạt qua biến môi trường VITE_DEFAULT_AVATAR_SERVICE_URL.
 * Sử dụng tông màu thương hiệu Indigo (#4f46e5) với chữ trắng đậm nét, đồng bộ với thiết kế giao diện MarketPulse
 * (thay thế background=random vốn bị sinh ra màu xanh nõn chuối/lime green chói mắt theo tên người dùng).
 */
export const getDefaultAvatar = (
  name?: string | null,
  customBackground?: string
): string => {
  const displayName = name?.trim() || "User";
  const baseUrl = APP_CONFIG.defaultAvatarServiceUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  const background = customBackground || "4f46e5";
  return `${baseUrl}${separator}name=${encodeURIComponent(displayName)}&background=${background}&color=fff&bold=true`;
};

