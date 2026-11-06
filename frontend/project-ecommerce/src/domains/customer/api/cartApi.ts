import axiosClient from "@/shared/api/axiosClient";
import type {
  CartItem,
  CartResponse,
  BackendCartItem,
  BackendCartResponse,
  ShopVoucher,
  PlatformVoucher,
} from "@/domains/customer/types/cart.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

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

/**
 * Maps a single backend cart item to UI CartItem model
 */
export function mapBackendCartItemToCartItem(
  backendItem: BackendCartItem,
  isSelected: boolean = true
): CartItem {
  const initials = backendItem.shop_name
    ? backendItem.shop_name
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SHOP";

  let stockStatus = "Còn hàng";
  if (!backendItem.is_available) {
    stockStatus = backendItem.available_stock <= 0 ? "Hết hàng" : "Tạm ngưng bán";
  } else if (backendItem.available_stock <= 5) {
    stockStatus = `Chỉ còn ${backendItem.available_stock} sản phẩm`;
  }

  const unitPrice = backendItem.unit_price ?? backendItem.price ?? 0;

  return {
    ...backendItem,
    name: backendItem.product_name || backendItem.name || "",
    price: unitPrice,
    original_price: backendItem.original_price ?? unitPrice,
    unit_price: unitPrice,
    image_url:
      backendItem.product_thumbnail_url ||
      backendItem.image_url ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    alt_text: backendItem.product_name || backendItem.name || "",
    variant_label: backendItem.variant_name || backendItem.variant_sku || "Mặc định",
    stock_status: stockStatus,
    max_stock: Math.max(backendItem.available_stock, backendItem.quantity),
    selected: backendItem.is_available ? isSelected : false,
    shop_badge: backendItem.shop_badge || "Chính hãng",
    shop_avatar_text: backendItem.shop_avatar_text || initials,
    shop_location: backendItem.shop_location || "Toàn quốc",
  };
}

/**
 * Maps a BackendCartResponse into CartItem[], preserving previous selection state if present
 */
export function mapBackendCartResponse(
  backendData: BackendCartResponse,
  previousItems: CartItem[] = []
): CartItem[] {
  const previousMap = new Map<number, boolean>();
  for (const prev of previousItems) {
    if (typeof prev.selected === "boolean") {
      previousMap.set(prev.id, prev.selected);
    }
  }

  return (backendData.items || []).map((item) => {
    const wasSelected = previousMap.has(item.id)
      ? previousMap.get(item.id)!
      : true; // Default selected for newly added items
    return mapBackendCartItemToCartItem(item, wasSelected);
  });
}

export const cartApi = {
  async getCart(): Promise<CartResponse> {
    const response = await axiosClient.get<ApiResponse<CartResponse>>("/api/v1/cart");
    return response.data.data;
  },

  async addItem(variantId: number, quantity: number = 1): Promise<CartResponse> {
    const response = await axiosClient.post<ApiResponse<CartResponse>>("/api/v1/cart/items", {
      variant_id: variantId,
      quantity,
    });
    return response.data.data;
  },

  async updateQuantity(itemId: number, quantity: number): Promise<CartResponse> {
    const response = await axiosClient.put<ApiResponse<CartResponse>>(
      `/api/v1/cart/items/${itemId}`,
      { quantity }
    );
    return response.data.data;
  },

  async removeItem(itemId: number): Promise<CartResponse> {
    const response = await axiosClient.delete<ApiResponse<CartResponse>>(
      `/api/v1/cart/items/${itemId}`
    );
    return response.data.data;
  },

  async clearCart(): Promise<CartResponse> {
    const response = await axiosClient.delete<ApiResponse<CartResponse>>("/api/v1/cart/items");
    return response.data.data;
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
