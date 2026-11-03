import type {
  ShopProductItem,
  ShopProductStats,
  ShopProductFilterState,
} from "../../types/shop/shopProduct.types";

export const initialShopProducts: ShopProductItem[] = [
  {
    id: "prod-1",
    name: "Bình gốm mộc hoả biến vân rêu cổ phong cách Indochine",
    sku: "VN-CER-00192",
    category: "art",
    categoryLabel: "Gốm nghệ thuật",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5EfnOPri4N6dEKOhMUIP8rqxXkduxGinUXkkdk-ki54I6mmHzOcOOPjcbd23uKAZXNNym25Js8B8YU-yyV_eC1yqXNialcTX1jjc-od6Q-K_LG229JttV_xBGrwwd5P9mXNgumN-ayvaBrDkpYCQTwFMCKokyBq6ObPXsEAw9FfdCUvbh1mbeuZf3Usns3t8wXsS1_-7OpdgdGh0K2lLhrzdmeUgtGp9rPfguaSqd0BMwgmn0vrC",
    imageAlt: "Bình gốm mộc hoả biến",
    soldCount: 128,
    variationTitle: "3 Kích thước (S, M, L)",
    variationSubtitle: "2 Màu men hỏa biến",
    price: 1150000,
    formattedPrice: "1.150.000 ₫",
    originalPrice: 1350000,
    formattedOriginalPrice: "1.350.000 ₫",
    stock: 128,
    stockStatus: "abundant",
    stockStatusLabel: "Đủ hàng",
    status: "ACTIVE",
  },
  {
    id: "prod-2",
    name: "Bộ tách trà gốm tử sa men rạn cao cấp dát chỉ vàng",
    sku: "VN-TEA-00481",
    category: "tea",
    categoryLabel: "Trà cụ & Ấm chén",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFaUC6LXV2N-GLs1fyOaKEg52DXMULiwaa4EOd8sLavVu6mgDglVJbwXZZKt_oYgpZPHYYwAH0dshT7YoVL3q9hsjH0dhnzY4B4ENEyo16UTkO2UFo9Kk2RJp6kSmRBGG5xlDV64pDhIoASqpLjlnUzTrkNIRw4_68upW-_HW48Ea03kziZtTS2uTIM1pw97vWW3MSHrNM2JhOZHiDxwd0TPIrt-n08VUcOXwyseHTmEUYkThv1IDI",
    imageAlt: "Bộ tách trà gốm tử sa",
    soldCount: 94,
    variationTitle: "Bộ 6 chén 1 ấm",
    variationSubtitle: "Kèm khay gốm đồng bộ",
    price: 890000,
    formattedPrice: "890.000 ₫",
    priceNote: "Đồng giá niêm yết",
    stock: 15,
    stockStatus: "safe",
    stockStatusLabel: "An toàn",
    status: "ACTIVE",
  },
  {
    id: "prod-3",
    name: "Đĩa lót ly ceramic vân đá xám khói tráng men bóng chống trượt",
    sku: "VN-MAT-00912",
    category: "dining",
    categoryLabel: "Phụ kiện bàn ăn",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-2VN67PK8WHOVsLTkb6yVnCdtn_WtMwlD6rp3-PjuTtAbsnMsO5I29kTCK2FAwXIu1ZrVb51XX2RO553bXmxs67Ke4-E6UdczG4n3uYRRwitmPhx_BsBzLs-IJRogwBBABo6CfrCK2ahtSj8Ny8fM-KJrfaPYi8fTFDDjK1KNY_Vg3NE5m-koxseCCCsN_xHiBeCq_GUqJG83gqUvX6iVYToHelkw_4P0BbEIMuNB41cI_oYETd6x",
    imageAlt: "Đĩa lót ly ceramic vân đá",
    soldCount: 82,
    variationTitle: "Set 4 chiếc",
    variationSubtitle: "2 Họa tiết vân đá",
    price: 420000,
    formattedPrice: "420.000 ₫",
    priceNote: "Giá ưu đãi tuần",
    stock: 6,
    stockStatus: "low",
    stockStatusLabel: "Sắp hết hàng - Cần nhập",
    status: "LOW_STOCK",
  },
  {
    id: "prod-4",
    name: "Đèn xông tinh dầu gốm thấu quang thủ công men lam cổ truyền",
    sku: "VN-LMP-00723",
    category: "lighting",
    categoryLabel: "Đèn trang trí & Hương liệu",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChOEda4NHlf-ObqiUuKrwlVQJCdjHZpI_wxFhW7skFfZjQfTQl86wTQxct-6nFEweEvL6ffoiH-T1ioIMfVdKmw10bpKJFvVOMLoQzNECKLZUKdWgZlPSN9465qC87ywF1iF4o5mUlwQID5uOYUCFOosLSUOgXnqtOc9MjtrKL9qcnT9EaQDFetZ6U6T2MUfAWeT9PjSCY-E9kJjmwS5AJE0hqlDYDRvf50hJWzwFGUpUCiU7OrcLv",
    imageAlt: "Đèn xông tinh dầu gốm",
    soldCount: 65,
    variationTitle: "1 Size tiêu chuẩn",
    variationSubtitle: "Kèm bóng halogen",
    price: 360000,
    formattedPrice: "360.000 ₫",
    priceNote: "Giá bán buôn",
    stock: 38,
    stockStatus: "abundant",
    stockStatusLabel: "Đủ hàng",
    status: "ACTIVE",
  },
  {
    id: "prod-5",
    name: "Lọ hoa mini men rạn phong cách Wabi Sabi mộc mạc",
    sku: "VN-VAS-00315",
    category: "vases",
    categoryLabel: "Gốm trang trí để bàn",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9hmbfjqQvkMDncTRabW_Npnq2Eqtv9rIuJo_d28y_21ZNN_niUZ7ldiwnOHubQOeOLu0sxvQq09kk8tPnixcMu6IZiU4hOW8XNBv_A6iipbu_qH7VtdrzmxD2QXpSxuLNC95h7z1ih_IEQfDBiEjWSjFiK-fwJ_0QAZPYSILelhyK86v41zoxiNDxfPX25YeBnBl5caHuOf2EHHtAdD26iu2V7dq9j5Yp27gOwzhfglZ4VkcJDrrR",
    imageAlt: "Lọ hoa mini men rạn",
    soldCount: 51,
    variationTitle: "2 Mẫu hình học",
    variationSubtitle: "Bản thủ công giới hạn",
    price: 280000,
    formattedPrice: "280.000 ₫",
    originalPrice: 320000,
    formattedOriginalPrice: "320.000 ₫",
    stock: 2,
    stockStatus: "critical",
    stockStatusLabel: "Nguy cơ hết hàng!",
    status: "LOW_STOCK",
  },
  {
    id: "prod-6",
    name: "Tách cà phê men hoả biến lòng men ngọc kèm đĩa lót oval",
    sku: "VN-CUP-00511",
    category: "dining",
    categoryLabel: "Ly cốc gốm sứ",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcLUY0_wQAKnDFZ8QBmZAu3RY4wZvw26zH_F6wojTZ6opKfOtQwINuC_08Pg_lG3PhlY-bW8EaN_GTWJ613nhUYJPeXIo6WTc1pA4mV7-etovEj5IMi1tA9b19QSLswKGxvBaytsuoRgTPzF_Q0vOr3rMI6XUpp2xCCUrMEwyoDpe8GYioW6QlKpKLnEv39DQk9ZW2eKHAayqOIGzoxGfVtsZJ8qDIzXkrfnGRybLS58wY7RTo1ord",
    imageAlt: "Tách cà phê men hoả biến",
    soldCount: 43,
    variationTitle: "Dung tích 220ml",
    variationSubtitle: "Men xanh cobalt",
    price: 245000,
    formattedPrice: "245.000 ₫",
    priceNote: "Tạm hết",
    stock: 0,
    stockStatus: "out",
    stockStatusLabel: "Đã hết hàng",
    status: "OUT_OF_STOCK",
  },
];

export const initialShopProductStats: ShopProductStats = {
  totalInventoryValue: 348650000,
  formattedInventoryValue: "348.650.000 ₫",
  totalProductsCount: 86,
  totalStockUnits: 421,
  readinessRate: 90.7,
  readinessChangeLabel: "+1.2% tuần này",
  lowStockSkusCount: 5,
  outOfStockSkusCount: 3,
  activeSkusCount: 86,
  statusTabCounts: {
    all: 86,
    active: 78,
    low_stock: 5,
    out_of_stock: 3,
    pending: 0,
    hidden: 5,
  },
};

export const shopProductApi = {
  fetchStats: async (): Promise<ShopProductStats> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...initialShopProductStats };
  },

  fetchProducts: async (filters?: Partial<ShopProductFilterState>): Promise<{
    items: ShopProductItem[];
    total: number;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let items = [...initialShopProducts];

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== "all") {
      items = items.filter((p) => p.category === filters.category);
    }

    if (filters?.statusTab && filters.statusTab !== "all") {
      if (filters.statusTab === "active") {
        items = items.filter((p) => p.status === "ACTIVE");
      } else if (filters.statusTab === "low_stock") {
        items = items.filter((p) => p.status === "LOW_STOCK");
      } else if (filters.statusTab === "out_of_stock") {
        items = items.filter((p) => p.status === "OUT_OF_STOCK");
      } else if (filters.statusTab === "pending") {
        items = items.filter((p) => p.status === "PENDING");
      } else if (filters.statusTab === "hidden") {
        items = items.filter((p) => p.status === "HIDDEN");
      }
    }

    if (filters?.priceRange && filters.priceRange !== "all") {
      if (filters.priceRange === "under300") {
        items = items.filter((p) => p.price < 300000);
      } else if (filters.priceRange === "300-800") {
        items = items.filter((p) => p.price >= 300000 && p.price <= 800000);
      } else if (filters.priceRange === "above800") {
        items = items.filter((p) => p.price > 800000);
      }
    }

    if (filters?.stockLevel && filters.stockLevel !== "all") {
      if (filters.stockLevel === "abundant") {
        items = items.filter((p) => p.stock > 20);
      } else if (filters.stockLevel === "low") {
        items = items.filter((p) => p.stock >= 1 && p.stock <= 5);
      } else if (filters.stockLevel === "out") {
        items = items.filter((p) => p.stock === 0);
      }
    }

    return {
      items,
      total: items.length,
    };
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return Boolean(id);
  },

  saveProduct: async (product: Partial<ShopProductItem>): Promise<ShopProductItem> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const isNew = !product.id;
    const item: ShopProductItem = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || "Sản phẩm gốm mới",
      sku: product.sku || `VN-NEW-${Math.floor(Math.random() * 90000 + 10000)}`,
      category: product.category || "art",
      categoryLabel: product.categoryLabel || "Gốm nghệ thuật",
      imageUrl:
        product.imageUrl ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5EfnOPri4N6dEKOhMUIP8rqxXkduxGinUXkkdk-ki54I6mmHzOcOOPjcbd23uKAZXNNym25Js8B8YU-yyV_eC1yqXNialcTX1jjc-od6Q-K_LG229JttV_xBGrwwd5P9mXNgumN-ayvaBrDkpYCQTwFMCKokyBq6ObPXsEAw9FfdCUvbh1mbeuZf3Usns3t8wXsS1_-7OpdgdGh0K2lLhrzdmeUgtGp9rPfguaSqd0BMwgmn0vrC",
      imageAlt: product.name || "Hình ảnh sản phẩm",
      soldCount: product.soldCount || 0,
      variationTitle: product.variationTitle || "Tiêu chuẩn",
      variationSubtitle: product.variationSubtitle || "Mặc định",
      price: product.price || 500000,
      formattedPrice: new Intl.NumberFormat("vi-VN").format(product.price || 500000) + " ₫",
      stock: product.stock || 20,
      stockStatus: (product.stock || 20) > 10 ? "abundant" : (product.stock || 20) > 0 ? "low" : "out",
      stockStatusLabel: (product.stock || 20) > 10 ? "Đủ hàng" : (product.stock || 20) > 0 ? "Sắp hết" : "Hết hàng",
      status: isNew ? "ACTIVE" : (product.status || "ACTIVE"),
    };
    return item;
  },
};

