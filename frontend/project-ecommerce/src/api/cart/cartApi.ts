import axiosClient from "../axiosClient";
import type {
  BackendCartItem,
  BackendCartResponse,
  CartItem,
  ShopVoucher,
  PlatformVoucher,
} from "../../types/cart/cart.types";

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

  return {
    id: backendItem.id,
    shop_id: backendItem.shop_id,
    shop_name: backendItem.shop_name,
    shop_badge: "Chính hãng",
    shop_avatar_text: initials,
    shop_location: "Toàn quốc",
    product_id: backendItem.product_id,
    product_slug: backendItem.product_slug,
    variant_id: backendItem.variant_id,
    variant_sku: backendItem.variant_sku,
    name: backendItem.product_name,
    image_url:
      backendItem.product_thumbnail_url ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    alt_text: backendItem.product_name,
    variant_label: backendItem.variant_name || backendItem.variant_sku || "Mặc định",
    stock_status: stockStatus,
    original_price: backendItem.unit_price,
    price: backendItem.unit_price,
    quantity: backendItem.quantity,
    max_stock: Math.max(backendItem.available_stock, backendItem.quantity),
    selected: backendItem.is_available ? isSelected : false,
    is_available: backendItem.is_available,
    available_stock: backendItem.available_stock,
    line_total: backendItem.line_total,
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
    previousMap.set(prev.id, prev.selected);
  }

  return (backendData.items || []).map((item) => {
    const wasSelected = previousMap.has(item.id)
      ? previousMap.get(item.id)!
      : true; // Default selected for newly added items
    return mapBackendCartItemToCartItem(item, wasSelected);
  });
}

export const cartApi = {
  /**
   * GET /api/v1/cart
   * Retrieves user's active cart
   */
  async getCart(): Promise<BackendCartResponse> {
    const response = await axiosClient.get<{ success: boolean; data: BackendCartResponse }>(
      "/api/v1/cart"
    );
    return response.data.data;
  },

  /**
   * POST /api/v1/cart/items
   * Adds an item with variantId and quantity to cart
   */
  async addItem(variantId: number, quantity: number = 1): Promise<BackendCartResponse> {
    const response = await axiosClient.post<{ success: boolean; data: BackendCartResponse }>(
      "/api/v1/cart/items",
      {
        variant_id: variantId,
        quantity,
      }
    );
    return response.data.data;
  },

  /**
   * PUT /api/v1/cart/items/{id}
   * Updates an item's absolute quantity
   */
  async updateQuantity(itemId: number, quantity: number): Promise<BackendCartResponse> {
    const response = await axiosClient.put<{ success: boolean; data: BackendCartResponse }>(
      `/api/v1/cart/items/${itemId}`,
      {
        quantity,
      }
    );
    return response.data.data;
  },

  /**
   * DELETE /api/v1/cart/items/{id}
   * Removes a single item from user's cart
   */
  async removeItem(itemId: number): Promise<BackendCartResponse> {
    const response = await axiosClient.delete<{ success: boolean; data: BackendCartResponse }>(
      `/api/v1/cart/items/${itemId}`
    );
    return response.data.data;
  },

  /**
   * DELETE /api/v1/cart/items
   * Clears all items in user's cart
   */
  async clearCart(): Promise<BackendCartResponse> {
    const response = await axiosClient.delete<{ success: boolean; data: BackendCartResponse }>(
      "/api/v1/cart/items"
    );
    return response.data.data;
  },

  /**
   * Client-side Voucher helper methods
   */
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
