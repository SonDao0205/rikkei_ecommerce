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

/**
 * Trả về ảnh logo đại diện mặc định dựa theo tên gian hàng thông qua dịch vụ avatar (cắt chữ cái đầu theo tên cửa hàng).
 * Dùng cho cả tài khoản đăng ký mở shop và các shop đã được duyệt nhưng chưa tải ảnh logo lên.
 */
export const getShopDefaultLogo = (
  shopName?: string | null,
  customBackground?: string
): string => {
  return getDefaultAvatar(shopName?.trim() || "Shop", customBackground || "4f46e5");
};

/**
 * Ảnh bìa (banner) mặc định đơn giản cho gian hàng khi chưa tải ảnh lên.
 * Chỉ sử dụng để làm hiển thị giao diện, không lưu vào cơ sở dữ liệu.
 */
export const DEFAULT_SHOP_BANNER =
  "https://img.magnific.com/hinh-chup-mien-phi/nen-giay-nham-min-mau-xam_53876-101833.jpg?semt=ais_hybrid&w=740&q=80";

  