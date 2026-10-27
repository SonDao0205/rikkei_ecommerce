/**
 * Trả về đường dẫn avatar mặc định dựa theo tên người dùng thông qua dịch vụ ui-avatars.com.
 * Không lưu xuống database, chỉ dùng để hiển thị avatar mặc định khi tài khoản chưa cập nhật ảnh riêng.
 */
export const getDefaultAvatar = (name?: string | null): string => {
  const displayName = name?.trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`;
};
