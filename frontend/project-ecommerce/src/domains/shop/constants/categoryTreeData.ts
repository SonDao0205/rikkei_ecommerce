import type { AddProductCategoryOption } from "@/domains/shop/types/shopAddProduct.types";

export const CATEGORY_TREE_DATA: AddProductCategoryOption[] = [
  {
    id: 930011,
    name: "Giày Sneakers Cổ Thấp",
    parentPath: ["Thời trang nam", "Giày dép & Phụ kiện"],
    suggestedSizes: ["38", "39", "40", "41", "42", "43", "44"],
    suggestedColors: [
      { id: "c1", name: "Đen Tuyền", hex: "#18181b" },
      { id: "c2", name: "Trắng Kem", hex: "#fef3c7" },
      { id: "c3", name: "Xám Khói", hex: "#64748b" },
      { id: "c4", name: "Xanh Navy", hex: "#1e3a8a" },
    ],
  },
  {
    id: 930012,
    name: "Giày Sneakers Cổ Cao",
    parentPath: ["Thời trang nam", "Giày dép & Phụ kiện"],
    suggestedSizes: ["39", "40", "41", "42", "43"],
    suggestedColors: [
      { id: "c1", name: "Đen", hex: "#18181b" },
      { id: "c2", name: "Trắng", hex: "#f4f4f5" },
    ],
  },
  {
    id: 930002,
    name: "Áo Thun Cổ Tròn (T-Shirt)",
    parentPath: ["Thời trang nam", "Áo & Trang phục"],
    suggestedSizes: ["S", "M", "L", "XL", "XXL"],
    suggestedColors: [
      { id: "c1", name: "Đen", hex: "#18181b" },
      { id: "c2", name: "Trắng", hex: "#ffffff" },
      { id: "c3", name: "Xám Tiêu", hex: "#94a3b8" },
      { id: "c4", name: "Xanh Rêu", hex: "#3f6212" },
    ],
  },
  {
    id: 930006,
    name: "Áo Khoác Bomber & Hoodie",
    parentPath: ["Thời trang nam", "Áo Khoác ngoài"],
    suggestedSizes: ["M", "L", "XL", "XXL"],
    suggestedColors: [
      { id: "c1", name: "Đen", hex: "#18181b" },
      { id: "c2", name: "Nâu Đất", hex: "#78350f" },
      { id: "c3", name: "Xanh Rêu", hex: "#365314" },
    ],
  },
  {
    id: 930010,
    name: "Balo Laptop & Túi Đeo Chéo",
    parentPath: ["Phụ kiện & Túi ví", "Balo & Túi xách"],
    suggestedSizes: ["14 inch", "15.6 inch", "Tiêu chuẩn"],
    suggestedColors: [
      { id: "c1", name: "Đen Graphite", hex: "#27272a" },
      { id: "c2", name: "Xám Melange", hex: "#71717a" },
    ],
  },
  {
    id: 930005,
    name: "Ốp lưng & Cáp sạc di động",
    parentPath: ["Điện thoại & Phụ kiện", "Phụ kiện thông minh"],
    suggestedSizes: ["iPhone 13/14", "iPhone 15", "iPhone 15 Pro Max", "Universal"],
    suggestedColors: [
      { id: "c1", name: "Trong suốt", hex: "#e2e8f0" },
      { id: "c2", name: "Đen Nhám", hex: "#18181b" },
      { id: "c3", name: "Titan Tự Nhiên", hex: "#94a3b8" },
    ],
  },
  {
    id: 930003,
    name: "Gốm sứ & Đồ decor phòng",
    parentPath: ["Nhà cửa & Đời sống", "Trang trí nội thất"],
    suggestedSizes: ["Size S (15cm)", "Size M (25cm)", "Size L (35cm)"],
    suggestedColors: [
      { id: "c1", name: "Gốm Mộc Men Hoả Biến", hex: "#b45309" },
      { id: "c2", name: "Men Trắng Ngà", hex: "#fef3c7" },
    ],
  },
];

