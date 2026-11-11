/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu
 */
export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

/**
 * Tạo URL-friendly slug từ chuỗi (loại bỏ dấu, ký tự đặc biệt, chuyển thành chữ thường gạch ngang)
 */
export const toSlug = (str: string): string => {
  if (!str) return "";
  return removeVietnameseTones(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

