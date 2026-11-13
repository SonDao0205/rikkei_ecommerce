const KNOWN_CATEGORY_NAMES: Record<number, string> = {
  930001: "Thời trang",
  930002: "Áo & Quần",
  930003: "Nhà cửa & Đời sống",
  930004: "Thực phẩm & Đồ uống",
  930005: "Điện thoại & Điện tử",
  930006: "Áo khoác",
  930007: "Máy tính & Laptop",
  930008: "Đồ bếp & Bàn ăn",
  930009: "Cà phê & Trà",
  930010: "Balo & Túi xách",
  930011: "Giày dép & Sneaker",
  930012: "Phụ kiện máy tính",
};

export function cleanCategoryName(name?: string, id?: number): string {
  if (id && KNOWN_CATEGORY_NAMES[id]) {
    return KNOWN_CATEGORY_NAMES[id];
  }
  if (!name) return "Sản phẩm";
  if (/[ÃÄá»‡áº¡]/.test(name)) {
    try {
      const bytes = Uint8Array.from(name, (c) => c.charCodeAt(0));
      const decoded = new TextDecoder("utf-8").decode(bytes);
      if (decoded && !/[ÃÄ]/.test(decoded)) {
        return decoded;
      }
    } catch {
      // ignore
    }
  }
  return name;
}

