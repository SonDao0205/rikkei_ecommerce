import type { CartItem, ShopVoucher, PlatformVoucher } from "../../types/cart/cart.types";

const CART_STORAGE_KEY = "mp_user_cart_items";

// Initial seed data extracted accurately from shopping_cart.html
export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 101,
    shop_id: 1,
    shop_name: "UrbanStep Official",
    shop_badge: "Official Mall",
    shop_avatar_text: "US",
    shop_location: "Fast Saigon Dispatch",
    product_id: 1,
    name: "Retro Runner V2 Sneaker – Off White / Forest Green",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOgr6jzX5MRBqlbBc3j6tLq8YIc8X9pmghE3T7-XMm0-X3wiRoIi0-eAOp__w8W-AAHQGAcgqEDyUt2452ZNVKXtQjNPpSGhckLCqcBvurqatDrokrNExV2VRdozSF7QR_ftmYuF_6I8zsuw2z4ObiwWvPw66Wl0qTS1lgs7_nazmvVyCSWT1fSNV-D-RPbeBLVibMDW9MdjJFtgw9zAOWfKZ_T5UQt611dzsbckGcfw8NSQO3maiM",
    alt_text:
      "Close-up studio photograph of premium vintage-inspired running sneaker, forest green and off-white suede textures, modern gum sole.",
    variant_label: "Color: Forest Green • Size: EU 40",
    stock_status: "In Stock - Fast Saigon Dispatch",
    original_price: 1750000,
    price: 1250000,
    quantity: 1,
    max_stock: 15,
    selected: true,
  },
  {
    id: 102,
    shop_id: 1,
    shop_name: "UrbanStep Official",
    shop_badge: "Official Mall",
    shop_avatar_text: "US",
    shop_location: "Fast Saigon Dispatch",
    product_id: 2,
    name: "Cushioned Bamboo Athletic Socks (3-Pack)",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa7QGM4G-BiNUcdmcdFsOiaUFvvNcyJ5nD_b7C4b4LO2XxO0cEKJAp1Hq5xOKrQ7h0XwGeMCU5slvl0seeqwbgZFHCwPxZqbyXHwHwTqWcv8ELC2kH_9AgLL6dFWtg4He5qIG13GasmnqOEl9M9xKllMnyXKLOEpfRxeG0LYa0mW5PoQbMsSBNZTUboZozwd6Jo8kLo5HPesvvuQ6YInV7K9znl00m_O3JftKElIoJ6oatIu_Sp8Gv",
    alt_text:
      "Minimalist pack of three rolled organic bamboo athletic ankle socks in neutral white and heather grey tones.",
    variant_label: "Color: White/Grey Mix • One Size",
    stock_status: "Ready to Ship",
    original_price: 1500000, // or 150.000 (unit: 150.000 ₫ original, 120.000 ₫ price)
    price: 120000,
    quantity: 2,
    max_stock: 50,
    selected: true,
  },
  {
    id: 201,
    shop_id: 2,
    shop_name: "Crafted Saigon",
    shop_badge: "Artisan Partner",
    shop_avatar_text: "CS",
    shop_location: "Workshop in District 3, HCMC",
    product_id: 3,
    name: "Minimalist Vegetable Tanned Leather Cardholder",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD14nOFIXfy8YisZNTXT0Itp4w-hckTzyNYKTkcCBYT6_dwAGfIPo2wbFqOvLe36II0PVwP0f4pXeSj8EUk9vgTcRQYTh-F-J4AUc8xJHVEi0lB3wT9ed85GqedTWAsWlbcWFsH-0lmxA_p-oZcjkqLrAtGcrSU0AiH-RsI-ZTExGCmV-Y3ZocRsQXyHMn7Uo62jv6xxNaT5LhtIWDkuAdnjQPeOC0AKCUi-biyAn0ztTwCPfYr7cXJ",
    alt_text:
      "Artisanal hand-stitched vegetable tanned leather slim cardholder in warm tan saddle brown.",
    variant_label: "Color: Tan Saddle • Stitch: Waxed Cream",
    stock_status: "Handmade • Ships in 24h",
    original_price: 400000,
    price: 240000,
    quantity: 1,
    max_stock: 8,
    selected: true,
  },
];

// Initial vouchers
export const INITIAL_SHOP_VOUCHERS: Record<number, ShopVoucher> = {
  1: {
    shop_id: 1,
    code: "URBANSTEP50",
    discount_amount: 50000,
    min_order_amount: 500000,
    is_applied: true,
    label: "URBANSTEP50 applied",
  },
};

export const INITIAL_PLATFORM_VOUCHER: PlatformVoucher = {
  code: "RETRO50",
  discount_amount: 50000,
  min_order_amount: 300000,
  is_applied: true,
  description: "Code 'RETRO50' auto-deducted",
};

// Helper methods to read/write storage safely
function getStoredItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(INITIAL_CART_ITEMS));
      return INITIAL_CART_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CART_ITEMS;
  } catch {
    return INITIAL_CART_ITEMS;
  }
}

function saveStoredItems(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage error
  }
}

export const cartApi = {
  async getCart(): Promise<{
    items: CartItem[];
    shopVouchers: Record<number, ShopVoucher>;
    platformVoucher: PlatformVoucher | null;
  }> {
    // Simulate brief network latency for smooth UI feel
    await new Promise((resolve) => setTimeout(resolve, 80));
    const items = getStoredItems();
    return {
      items,
      shopVouchers: INITIAL_SHOP_VOUCHERS,
      platformVoucher: INITIAL_PLATFORM_VOUCHER,
    };
  },

  async updateQuantity(itemId: number, quantity: number): Promise<CartItem[]> {
    const items = getStoredItems().map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, Math.min(item.max_stock, quantity)) }
        : item
    );
    saveStoredItems(items);
    return items;
  },

  async toggleSelectItem(itemId: number): Promise<CartItem[]> {
    const items = getStoredItems().map((item) =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    );
    saveStoredItems(items);
    return items;
  },

  async toggleSelectShop(shopId: number, selected: boolean): Promise<CartItem[]> {
    const items = getStoredItems().map((item) =>
      item.shop_id === shopId ? { ...item, selected } : item
    );
    saveStoredItems(items);
    return items;
  },

  async toggleSelectAll(selected: boolean): Promise<CartItem[]> {
    const items = getStoredItems().map((item) => ({ ...item, selected }));
    saveStoredItems(items);
    return items;
  },

  async removeItem(itemId: number): Promise<CartItem[]> {
    const items = getStoredItems().filter((item) => item.id !== itemId);
    saveStoredItems(items);
    return items;
  },

  async removeSelectedItems(): Promise<CartItem[]> {
    const items = getStoredItems().filter((item) => !item.selected);
    saveStoredItems(items);
    return items;
  },

  async clearCart(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    saveStoredItems(items);
    return items;
  },

  async applyShopVoucher(
    shopId: number,
    code: string
  ): Promise<ShopVoucher | null> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;

    if (normalized.includes("50") || normalized === "URBANSTEP50" || normalized === "CS50") {
      return {
        shop_id: shopId,
        code: normalized,
        discount_amount: 50000,
        min_order_amount: 200000,
        is_applied: true,
        label: `${normalized} applied`,
      };
    }
    if (normalized.includes("10") || normalized === "DISCOUNT10") {
      return {
        shop_id: shopId,
        code: normalized,
        discount_amount: 20000,
        min_order_amount: 100000,
        is_applied: true,
        label: `${normalized} applied (-20.000 ₫)`,
      };
    }
    throw new Error(`Mã giảm giá "${code}" không hợp lệ hoặc đã hết hạn.`);
  },

  async applyPlatformVoucher(code: string): Promise<PlatformVoucher> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new Error("Vui lòng nhập mã giảm giá sàn.");
    }
    if (normalized === "RETRO50" || normalized.includes("50")) {
      return {
        code: normalized,
        discount_amount: 50000,
        min_order_amount: 300000,
        is_applied: true,
        description: `Code '${normalized}' auto-deducted`,
      };
    }
    if (normalized === "MP100" || normalized.includes("100")) {
      return {
        code: normalized,
        discount_amount: 100000,
        min_order_amount: 1000000,
        is_applied: true,
        description: `Mã '${normalized}' giảm 100.000 ₫ cho đơn từ 1.000.000 ₫`,
      };
    }
    throw new Error(`Mã ưu đãi sàn "${code}" không tồn tại hoặc đã hết lượt dùng.`);
  },
};
