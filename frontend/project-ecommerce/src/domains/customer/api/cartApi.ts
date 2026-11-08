import axiosClient from "@/shared/api/axiosClient";
import axios from "axios";
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

export const INITIAL_SHOP_VOUCHERS: Record<number, ShopVoucher> = {};
export const INITIAL_PLATFORM_VOUCHER: PlatformVoucher | null = null;

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

  async validateVoucher(
    code: string,
    scope: "PLATFORM" | "SHOP",
    cartItemIds: number[],
    shopId?: number
  ) {
    const response = await axiosClient.post<ApiResponse<VoucherValidation>>(
      "/api/v1/vouchers/validate",
      { code, scope, shop_id: shopId, cart_item_ids: cartItemIds }
    );
    return response.data.data;
  },

  async getCheckoutOptions() {
    const response = await axiosClient.get<
      ApiResponse<{
        shipping_methods: CheckoutMethod[];
        payment_methods: CheckoutMethod[];
      }>
    >("/api/v1/checkout/options");
    return response.data.data;
  },

  async getAddresses() {
    const response = await axiosClient.get<ApiResponse<CheckoutAddress[]>>("/api/v1/addresses");
    return response.data.data;
  },

  async quoteCheckout(request: CheckoutQuoteRequest) {
    const response = await axiosClient.post<ApiResponse<CheckoutQuote>>("/api/v1/checkout/quote", request);
    return response.data.data;
  },
};

export interface CheckoutMethod {
  id: number;
  code: string;
  name: string;
  base_fee?: number;
  estimated_days?: string | null;
}

export interface CheckoutAddress {
  id: number;
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street_detail: string;
  is_default: boolean;
}

export interface CheckoutQuoteRequest {
  address_id: number;
  shipping_method_id: number;
  payment_method_id: number;
  cart_item_ids: number[];
  platform_voucher?: string;
  shop_vouchers?: Record<string, string>;
}

export interface CheckoutQuote {
  subtotal: number;
  shipping_fee: number;
  shop_discount: number;
  platform_discount: number;
  total: number;
  shipping_method: CheckoutMethod;
  payment_method: CheckoutMethod;
  address: { recipient_name: string; phone: string; formatted: string };
  items: Array<{
    cart_item_id: number;
    product_name: string;
    quantity: number;
    line_total: number;
  }>;
}

export interface VoucherValidation {
  id: number;
  code: string;
  title: string;
  scope: "PLATFORM" | "SHOP";
  shop_id: number | null;
  discount_amount: number;
  min_order_amount: number;
  is_applied: boolean;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ code?: string; message?: string }> }
      | undefined;
    const errCode = data?.errors?.[0]?.code;
    const errMsg = data?.errors?.[0]?.message;

    if (errCode === "voucher_invalid") {
      return "Mã voucher không tồn tại hoặc đã bị vô hiệu hóa.";
    }
    if (errCode === "voucher_unavailable") {
      return "Voucher đã hết lượt sử dụng hoặc tài khoản của bạn đã dùng mã này rồi.";
    }
    if (errCode === "voucher_minimum_not_met") {
      return "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này.";
    }
    if (errCode === "voucher_shop_mismatch") {
      return "Mã voucher của shop không khớp với các sản phẩm được chọn.";
    }
    if (errCode === "cart_selection_changed" || errCode === "cart_item_unavailable") {
      return "Một số sản phẩm trong giỏ hàng đã thay đổi hoặc không đủ tồn kho.";
    }
    if (errCode === "cart_total_exceeded") {
      return "Tổng giá trị đơn hàng vượt quá giới hạn tối đa cho phép.";
    }

    return errMsg || data?.message || fallback;
  }
  if (typeof error === "string") {
    return error;
  }
  return error instanceof Error ? error.message : fallback;
}
