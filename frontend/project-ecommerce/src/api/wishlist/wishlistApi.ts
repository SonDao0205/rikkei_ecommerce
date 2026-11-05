import type { WishlistItem, WishlistRecommendation } from "../../types/wishlist/wishlist.types";

const WISHLIST_STORAGE_KEY = "mp_user_wishlist_items";

export const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: 1,
    product_id: 101,
    name: "Giày Sneaker Retro Runner V2 Cổ Thấp Da Lộn Thủ Công",
    shop_name: "UrbanStep Official",
    is_verified_shop: true,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8FWlavxaRSP1lVtxQ_Vsg3PkdweBkIdP_SJWiIkCOz3UQYvLFzZ4bdtI8LdpdQ6136U_5ryDNR3b8LxU_Fp9NGdRVrMUVgjyAF_fdlc0iYaYshJE6PoLuICNrNyYypWSrWM8tu2GRg4d5SHi3QjuVHaV9UJQz-yMBHgCn6aAISuKqaQqcHHq93zeo3YYiNTB3f8_iQFW6oFTQiF4WwS-_SqPU-HvllOZ3LCO5Ib9hinipB9VwTpiW",
    alt_text:
      "Close-up commercial fashion footwear shot of Retro Runner V2 low-top sneakers in navy blue premium suede.",
    price: 890000,
    original_price: 1190000,
    discount_percent: 25,
    discount_badge: "-25% GIẢM",
    urgency_badge: "Chỉ còn 3 đôi",
    variant_label: "Đen Tuyền • Size 41",
    is_sale: true,
    status: "in-stock",
    stock_count: 3,
    added_at: "2026-11-05T08:00:00Z",
  },
  {
    id: 2,
    product_id: 102,
    name: "Bình gốm mộc hoả biến vân rêu cổ trang trí phòng khách",
    shop_name: "MarketPulse Craft Studio",
    is_verified_shop: true,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdvy5XiHmN5i0-Puasul3lCktUjAMar2F2lHslpNnJ-Xn1VMGoCyDe2FJRzV8KJ6grcY1n7Lpx-_07VazBkMz2buzW8Dl3ztfLE01Hcxy21aORt-xV41sdeagGIRKSAB-nJWAB2hmVZ7GiMae3K1Maj6Irxt-YDGI5YC6ezUVv2IzTv2v7n6U1c7YexX3lbjXt7nW8aUSXV5RFOg_YFITv3yaiFgDILjJ13FeeRNiSNt_ly0iPhY3r",
    alt_text:
      "Artisanal ceramic vase with reactive moss-green and earthen bronze glaze in an Indochine minimalist living room.",
    price: 1150000,
    original_price: 1350000,
    discount_percent: 15,
    discount_badge: "Flash Sale",
    urgency_badge: "Còn hàng (18)",
    variant_label: "Men hoả biến • Cỡ L (32cm)",
    is_sale: true,
    status: "in-stock",
    stock_count: 18,
    added_at: "2026-11-04T12:00:00Z",
  },
  {
    id: 3,
    product_id: 103,
    name: "Túi du lịch da bò sáp mộc Minimalist Vintage Duffel",
    shop_name: "Sài Gòn Artisan Leather",
    is_verified_shop: false,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6wnt77QgNR4nNVRemR49w4a_H27Ko22sowJUKIkvItLGJCLzU8M7bwX02sGyRrhRoHP5FBJsALVkDG1rbeQxvUWcORCIdgtEqj2qGXUD9LKA5yB0MFtLcnea9FXtf94bD-ypkQ8e4oQxcuHS-Nq0LTHJp0tHcw-VSj6LZ5dONi54uGqB2BAtu5_-fPdSHEfANS5DwBb48LPkU8KCabAzbfLF3JOA9YAYCn6DX-8Alm6BhBl_LR218",
    alt_text:
      "Full grain caramel coffee pull-up leather weekend duffel bag resting on dark rustic wood bench.",
    price: 1650000,
    original_price: 1950000,
    discount_percent: 15,
    discount_badge: "-15% OFF",
    variant_label: "Nâu Cà phê Sáp",
    is_sale: true,
    status: "in-stock",
    stock_count: 5,
    added_at: "2026-11-03T10:00:00Z",
  },
  {
    id: 4,
    product_id: 104,
    name: "Bộ ấm chén trà tử sa men rạn khay gỗ mun đồng bộ",
    shop_name: "Gốm Bát Tràng Di Sản",
    is_verified_shop: false,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGcrzep-2ddJra9Q42FkCBPxkfLuCUiCqDPXuIfrgJYUKXSabUhykTpv1PHB2mp1VnBSbspkkAozmTacI2bekcCSx4cvkqqOvbKSu9HpYRtEaEIPH2140DuEvizy5SIK2U1Nyewv2t1nCasY-gl2zvhVZmxI1SSybLp2wRJ4wJgR6OT_quSqVwhbtSJ3QB6weGPHRaByRLUvWwyiWaBgIyKwoO6g5YHokjwFpdbqJihpjyJWQ9Uaqz",
    alt_text:
      "Traditional handmade Vietnamese crackle glaze purple clay tea set with aged brass trim on dark ebony wooden tray.",
    price: 890000,
    original_price: 890000,
    discount_badge: "TẠM HẾT HÀNG",
    variant_label: "Bộ 6 chén 1 ấm • Khay mun",
    is_sale: false,
    status: "out-of-stock",
    stock_count: 0,
    added_at: "2026-11-02T15:00:00Z",
  },
  {
    id: 5,
    product_id: 105,
    name: "Áo thun Oversized Cotton 280gsm Graphic Streetwear 1990s",
    shop_name: "UrbanStreet Apparel",
    is_verified_shop: false,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdydmke9isXOO6aUdRrQf78fNbvEj0NLMCSHVK0eFfTP86me2PdKm-ORpyRVNcnyeGpWU_mIxoZ_wlgMTZYa2w3xSZEYBtbU9mXCc3-szuzHALtqfecJgMi5qP708dOLtRNEI8AsDI5cAe35IHhT4jAxIZymHaeYbXsT6sa16FRagahl3lsEN7fi6cM6vkqhm52Ptho1Y46fEGonNr7THZuNt3m9P2xjYzcLoC2gGbb3eIQqV2Kbep",
    alt_text:
      "Model wearing heavyweight 280gsm vintage heather grey oversized streetwear graphic t-shirt.",
    price: 385000,
    original_price: 550000,
    discount_percent: 30,
    discount_badge: "-30% SIÊU GIẢM GIÁ",
    urgency_badge: "Sắp hết (Còn 2 áo)",
    variant_label: "Size L • Màu Xám Tiêu",
    is_sale: true,
    status: "in-stock",
    stock_count: 2,
    added_at: "2026-11-01T09:00:00Z",
  },
  {
    id: 6,
    product_id: 106,
    name: "Đèn xông tinh dầu gốm thấu quang chạm khắc hoa sen",
    shop_name: "MarketPulse Craft Studio",
    is_verified_shop: true,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHhvV-QXR0f6nhB9Ur1psDMahVDy_Mpya7ZS9wWqHvR0npyzx-nNxByj9hTBNwrJTDhAb2qcy-J35Frt4wyW-amGD46u7h05dj1Yh7H6WghMs32k4qWQXNNbL2NY_QdzgcDL1plQK6emMAw375uTR95oRf25Ga3oF-pS_f9CzaIkGUJFPKlkE1XXq4z22dkY78CIi29rtEP-J4Na2MMmGaW08LbkuOxazsHoI0NFvamzhrijPs_h2I",
    alt_text:
      "Handcrafted translucent white ceramic essential oil diffuser lamp carved with delicate lotus petals emitting a warm glow.",
    price: 360000,
    original_price: 360000,
    discount_badge: "Mới lưu",
    variant_label: "Kèm bóng halogen dimmer 50W",
    is_sale: false,
    status: "in-stock",
    stock_count: 25,
    added_at: "2026-11-05T09:30:00Z",
  },
  {
    id: 7,
    product_id: 107,
    name: "Túi Tote Canvas vải mộc quai da thật đa ngăn chống sốc",
    shop_name: "Indochine Studio",
    is_verified_shop: false,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTY6UR6JxPN8-E8OZvHmeFYKmMMDBXcQgmiyLm_WNWpYAJFTBp7XUMyOd-Elg54OZdq7mpIzZ2cY3v43jLkuHqJeKcVhAOXUcM6ECnOlxXMKtp6dLOG6QvelUEpK9a483SiZAH_f-sua9-Ku5VaLl-bUpguswIc4r6ulMae_nxhtgpb4xzCM_QuUxqG35zHFB3MjkGFeG1i_sRL5Lfftf_a4YARPwxD93PYgyPyflaQJAMvYGQaK0Q",
    alt_text:
      "Heavy organic raw off-white canvas tote bag with vegetable tanned brown leather shoulder handles.",
    price: 420000,
    original_price: 525000,
    discount_percent: 20,
    discount_badge: "-20% OFF",
    variant_label: "Màu Kem Mộc Canvas",
    is_sale: true,
    status: "in-stock",
    stock_count: 12,
    added_at: "2026-10-30T14:00:00Z",
  },
  {
    id: 8,
    product_id: 108,
    name: "Lọ hoa mini men rạn nghệ thuật phong cách Wabi Sabi dáng hồ lô",
    shop_name: "MarketPulse Craft Studio",
    is_verified_shop: true,
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIay5G8EAu4eYQyZvRuOzmrkNYmKXALEsOFRgu9dI9KB67OCiqC6zFc3BxrS7la0UeC-IeXHlb9-5bcYFYeD5emwGyH7IH8zlZ51igAHcNjcdjha1Uveh2_h66UiR-SAYth1xrKjv4paan7ASEhrMR4LGqi1tD0dF3qvaPI5YrYTtEKofN9onvv1v2OPMHLmU1VQXvmmCa6hkx38nOCGngKECsksFY1RX6cxfMhOMJiJlcBNMUjt6G",
    alt_text:
      "Small rustic Wabi Sabi gourd shaped ceramic bud vase with fine crackle celadon glaze.",
    price: 280000,
    original_price: 320000,
    discount_percent: 12,
    urgency_badge: "Chỉ còn 1 chiếc cuối",
    variant_label: "Men rạn mộc cốt thủ công",
    is_sale: true,
    status: "in-stock",
    stock_count: 1,
    added_at: "2026-10-28T16:00:00Z",
  },
];

export const INITIAL_RECOMMENDATIONS: WishlistRecommendation[] = [
  {
    id: 1,
    product_id: 201,
    name: "Ví Đựng Thẻ Da Bò Slim Cardholder",
    shop_name: "Sài Gòn Artisan Leather",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoVs87-r26ZvVuJM4tK6dZ3OM7PWVaOhfTwqW_BpqdenZQvYY8bnFr5zXCBgYykzVa42S7BV8b98ORH2u1_NVcmiIFD1Tf_02lbKoU2iAzwgheGAZxFMpdgIK4D6EIbvPz5mBguPQEW2R4phG5zRrtfy0cQ1UIq6TKyxKQfTgTZiM0c1Ec6uJS86DLhaClQZ-J-FSNl2Xn50m0g7quhjka9BNVVBhkyPeasfvb1OHrTS89ItSjmzvg",
    price: 320000,
    tag: "Bán chạy #1",
  },
  {
    id: 2,
    product_id: 202,
    name: "Nến Thơm Đậu Nành Hương Rừng Thông Đà Lạt",
    shop_name: "MarketPulse Craft Studio",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA38eQfRlXlsb4v_ANZvpUFOSUAGIssKRhBZHFKGue7NVMEqgOzhXa3rctV8okwbtNPOthNWtnI1L1q6DzGlhEf3zfLh0GzKP7qFV9o_793kJl4aESPKavpF7LR3VSsF5d2BoBG2HMYYJ5KbziCKJKUrilKffJyYGqiBOK3oxcggz-9UxWPe_XEyTN_Z-Tz3vuUTTQW8-AE8Mk1DW-TMzOaQyuNK5AapCIHQg-GjHEwPQodGiC65ozz",
    price: 265000,
    tag: "-10%",
    is_discounted: true,
  },
  {
    id: 3,
    product_id: 203,
    name: "Mũ Bucket Hat Vải Kaki Giặt Mềm Phong Cách Nhật",
    shop_name: "UrbanStreet Apparel",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAyfOoH10IoIRKluDU_lSm4f3-zSNjdt_8qeFHDQ0O7_yIokpMUY5cawpySVCOURDED9fu7iFdyaAoxDVVNLUs2zTB-B8y-403mpJ6RxzqmbnDQou8qKdabVsStwhyhqwruMDo5XJJft5Yjw2eQ_riKr7kX0WV-6I19hF1lkZJ7vNflYW3Xwpngwaa9DM_NHeUr7iexhwQF3di1HQjdgK5Pa-05QEu5d582BW4eoTCQPW2LpnRTPLvE",
    price: 210000,
  },
  {
    id: 4,
    product_id: 204,
    name: "Phễu Pha Cà Phê Pour-Over Gốm Men Mộc",
    shop_name: "Gốm Bát Tràng Di Sản",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDi8cv02lXuX-72r1wHFtIenIwMUvyAbN45dYe9QxFsMg0067oIfy_VzZKqj1AO8AoWMwPt7yADjZfjf5j34DrCK6PATSz2n-1I1R3eQOZFQZAkQBo4GUsoz3rq3FtJ2dzS_LLyRm9sGc2dT7MFGZBTwAwegxQcjiB-e39QjV0gedvTx-N1LudUnpTI0GckzdY2BkYXPLcDYq-gpAwWTHbocqXVM378QOJAB-vRjTDeGMnarSVEnnT8",
    price: 345000,
    tag: "Thủ công",
  },
];

function getStoredWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(INITIAL_WISHLIST_ITEMS));
      return INITIAL_WISHLIST_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_WISHLIST_ITEMS;
  } catch {
    return INITIAL_WISHLIST_ITEMS;
  }
}

function saveStoredWishlist(items: WishlistItem[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage issues
  }
}

export const wishlistApi = {
  async getWishlist(): Promise<{
    items: WishlistItem[];
    recommendations: WishlistRecommendation[];
  }> {
    await new Promise((res) => setTimeout(res, 80));
    return {
      items: getStoredWishlist(),
      recommendations: INITIAL_RECOMMENDATIONS,
    };
  },

  async removeItem(id: number): Promise<WishlistItem[]> {
    const items = getStoredWishlist().filter((it) => it.id !== id);
    saveStoredWishlist(items);
    return items;
  },

  async clearAll(): Promise<WishlistItem[]> {
    const items: WishlistItem[] = [];
    saveStoredWishlist(items);
    return items;
  },

  async addItem(item: Omit<WishlistItem, "id" | "added_at">): Promise<WishlistItem[]> {
    const existing = getStoredWishlist();
    const isAlready = existing.find((it) => it.product_id === item.product_id);
    if (isAlready) {
      return existing;
    }
    const newItem: WishlistItem = {
      ...item,
      id: Date.now(),
      added_at: new Date().toISOString(),
    };
    const updated = [newItem, ...existing];
    saveStoredWishlist(updated);
    return updated;
  },
};

