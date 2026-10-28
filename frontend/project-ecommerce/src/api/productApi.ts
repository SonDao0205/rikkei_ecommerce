import axiosClient from "./axiosClient";
import type {
  Category,
  ProductItem,
  AdminProductItem,
  InventoryStats,
} from "../types/ecommerce";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ProductList {
  products: ProductItem[];
  total: number;
}

interface AdminProductList {
  products: AdminProductItem[];
  total: number;
}

/* ==========================================================================
   1. MOCK DATA: CATEGORIES (matching scriptDb.sql & home_page.html)
   ========================================================================== */
export const mockCategories: Category[] = [
  { id: 0, name: "Tất cả", slug: "all", parent_id: null, image_url: null, sort_order: 0, is_active: 1 },
  { id: 1, name: "Giày & Sneakers", slug: "giay-sneakers", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqVk-lBkAA4USyZO0R0_HY-FbaMP7NsI74OjtCcPgT_KkDyoj6C9_MHm1Jq8Tx3tc7-c8B8yku8KesRJDNKvkKJ7Zzdb_ZPMhYTpGvc0WDcAXWxN9LtLLcoxdtPh8xt_urWfsV5Gf6kA-9PxrWHT3z0zJnsC-NHUsE3_iFD6Gi24ZdDXwhWKXYGYC0EWvicm_kOyuy_e-FY2Nj51bwy_hdqv_p8Pvd1-DZRbd1Xr1-ZOX16wLOZwSz", sort_order: 1, is_active: 1 },
  { id: 2, name: "Thời trang", slug: "thoi-trang", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGqeWsOSGJB-59Hbs43pb4fqcZNi7PwMfHt7WG66WlZqaJTtspBZAN1eObVrCPaMiEUIDs6tVXX7I63cCoQ1rUNgg2ad-0gCeHvaEGHjeaxvWO0FVxdAu6UqFZFHBzPQWzTETn48GK9ePeqeFmTX6qMUJ7HL4Nl9TXU_9s875AImYx19ZGjeX8b1Vx4uGgC-cUFZ502tD2EJiJUkjhAdjDmP0EEFZpvHO0CIWYKveDRNVvch0GZcA", sort_order: 2, is_active: 1 },
  { id: 3, name: "Công nghệ", slug: "cong-nghe", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnQyZyuNWZZUPb_k3XM-ruGr3dvkO4wS5NBMkP3ogp_WLnd1ybVsfrraJt68lWuotdKeMu4egh2O7f-l4D2KfJegXS0OqNKhicRwyQ8cquxLg63AJjkFEWJh0cvs3oecyR6zREK4QCuq2e7wgnUZI_ibqEkiieTUZvSGr4gcFtbIHyy5l9UhBN7OPKUXnrSPdCNt0iKHPWH4T6LtocsXMy4sa6dVbi3BVx2IJ5iGgS8zZCM300g0wl", sort_order: 3, is_active: 1 },
  { id: 4, name: "Túi & Phụ kiện", slug: "tui-phu-kien", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEgHtCqlhutCLIQeAPrUQ6z8T4LNYDhol_IwHnzx6VC4SbLlCcHCyKqLxuAbMlXEE77KGZNel8F9aP3JOlxy6tHFZqo_mZrzew2bVZXC6rzMPwS17MLVfEM1mH5lxT9rfH_llb3BxdFFfASPWLmWSj38wI35RXkm2lawjFjpUTCepwPoS3myFo_ikMbGhwfk5xyY-g8xodJdXrwJDtIfm0TbhtqIMjAJsf9S49z2LYmMc9DJig6Ezw", sort_order: 4, is_active: 1 },
  { id: 5, name: "Gốm & Thủ công", slug: "gom-thu-cong", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_lUHQFUIemftdU5or3cXphetJcZ383ap0u9O9zBjHp373bbT25SwI1fQIJH0fB6bvKYoZDnpDW4Cn9taa20Rf7bNQFsvjiHK8qOzQR8m5Lgd_ygw3adOmT-6Rc4dMSq-UhQq7g2GfRD8xiSzGgPcVy5GS5SP7oWgkmQraW6QsCrCp8vIPEyL1cUW1Ix6abCS_A9tIbLiTpeyieozNz1PxSce2mnogeixselK_Y8KM4klrbeFvPdIk", sort_order: 5, is_active: 1 },
  { id: 6, name: "Trang sức & Bạc", slug: "trang-suc-bac", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnrCOmzIYBDKjjhCBpOIg2ppWNzdmO_Kxm-AcWniec5TKz9zawLSjlIhqBmCMZao2O0FdxA1yFqgYs3hvL1g3fXAciA5qfJFdDwSnWKgzxoqD-SgzMwNN7AqDkY6zFXPa5WAlPtZDC94EgScnW8XxPGlvP2jwVHUgKtuJBqZgmcIdQg_WpPoy4Xpj4ZKXOl8SxD-7aar7h4c5p9LumBpT7PmOEvEBdb7Lj2ftRjIM58egp9DBMWKCV", sort_order: 6, is_active: 1 },
  { id: 7, name: "Nước hoa & Nến", slug: "nuoc-hoa-nen", parent_id: null, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAv8pR4zCIsUyVYGZt2-fJC6qdClbMdRcNjkTw1jvWiVmsKcXi_oDwvRKxRF21YqQ6ssyJDdqoFNtn6maP79Uc6_zRQyrfve8tazbChfGQNso8gVMbo-HKfGtKWfflBxY90hfqpj1G_AH4o_CinZmwAi9Yia8zuw--RFP7vYEy9GrwpxsBF7u5J0bGgwcv7xxx0l52C2Mn95HOzbN_bdipc3mCucqOHmwmdV-B2GCexz78SXketW-kf", sort_order: 7, is_active: 1 },
];

/* ==========================================================================
   2. MOCK DATA: FLASH SALE PRODUCTS (Home Page Section 2)
   ========================================================================== */
export const mockFlashSaleProducts: ProductItem[] = [
  {
    id: 101,
    shop_id: 1,
    category_id: 2,
    brand_id: 1,
    name: "Komorebi Heavyweight Boxy Tee - Vintage Black",
    slug: "komorebi-heavyweight-boxy-tee-vintage-black",
    description: "260 GSM custom milled heavyweight combed cotton with subtle washed charcoal faded finish.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGqeWsOSGJB-59Hbs43pb4fqcZNi7PwMfHt7WG66WlZqaJTtspBZAN1eObVrCPaMiEUIDs6tVXX7I63cCoQ1rUNgg2ad-0gCeHvaEGHjeaxvWO0FVxdAu6UqFZFHBzPQWzTETn48GK9ePeqeFmTX6qMUJ7HL4Nl9TXU_9s875AImYx19ZGjeX8b1Vx4uGgC-cUFZ502tD2EJiJUkjhAdjDmP0EEFZpvHO0CIWYKveDRNVvch0GZcA",
    price: 390000,
    original_price: 600000,
    discount_percent: 35,
    sold_count: 980,
    rating_avg: 4.9,
    rating_count: 1200,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Aura Studio",
    shop_badge: "OFFICIAL",
    claimed_percentage: 78,
    stock_alert: "78% Claimed",
    is_flash_sale: true,
  },
  {
    id: 102,
    shop_id: 2,
    category_id: 1,
    brand_id: 2,
    name: "Retro Runner V2 Sneaker - Off White / Forest Green",
    slug: "retro-runner-v2-sneaker",
    description: "Pair of retro styled premium lifestyle running sneakers in off-white leather with deep forest green suede accents.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqVk-lBkAA4USyZO0R0_HY-FbaMP7NsI74OjtCcPgT_KkDyoj6C9_MHm1Jq8Tx3tc7-c8B8yku8KesRJDNKvkKJ7Zzdb_ZPMhYTpGvc0WDcAXWxN9LtLLcoxdtPh8xt_urWfsV5Gf6kA-9PxrWHT3z0zJnsC-NHUsE3_iFD6Gi24ZdDXwhWKXYGYC0EWvicm_kOyuy_e-FY2Nj51bwy_hdqv_p8Pvd1-DZRbd1Xr1-ZOX16wLOZwSz",
    price: 1250000,
    original_price: 1750000,
    discount_percent: 28,
    sold_count: 420,
    rating_avg: 4.8,
    rating_count: 840,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "UrbanStep Official",
    shop_badge: "MALL",
    claimed_percentage: 92,
    stock_alert: "Only 6 left",
    is_flash_sale: true,
  },
  {
    id: 103,
    shop_id: 3,
    category_id: 4,
    brand_id: null,
    name: "Minimalist Vegetable Tanned Leather Cardholder",
    slug: "minimalist-vegetable-tanned-leather-cardholder",
    description: "Artisanal hand stitched vegetable tanned natural caramel leather card wallet with solid saddle stitching.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiK1ACxrAqhJiusftQGXjV28yO9xncYI8nmoNuSVCRN-Gzmth_r5wrAv4KrBl3FNt0heMuUEh_PkfyoD4mcPOXcsRzwDkv50guWn5pRUdW9kAWPyX-xH8QUpMog04jCpi3AKzigHRFYGaOYYMXviB5xYglRb7qqtjd6gMvFsxP92i13gQ6obpzW4SEvpYZOE73GP6Hf1UjjOJAEOx9gpv3NfAfFsO7YyddWczovXZS7YtCAQqPDerH",
    price: 240000,
    original_price: 400000,
    discount_percent: 40,
    sold_count: 650,
    rating_avg: 4.9,
    rating_count: 320,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Crafted Saigon",
    shop_badge: "ARTISAN",
    claimed_percentage: 65,
    stock_alert: "Selling fast",
    is_flash_sale: true,
  },
  {
    id: 104,
    shop_id: 4,
    category_id: 3,
    brand_id: 3,
    name: "Over-Ear ANC Studio Wireless Headphones - Matte Slate",
    slug: "over-ear-anc-studio-wireless-headphones",
    description: "Active Noise Cancellation studio headphones with 40mm titanium drivers and 40h battery.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnQyZyuNWZZUPb_k3XM-ruGr3dvkO4wS5NBMkP3ogp_WLnd1ybVsfrraJt68lWuotdKeMu4egh2O7f-l4D2KfJegXS0OqNKhicRwyQ8cquxLg63AJjkFEWJh0cvs3oecyR6zREK4QCuq2e7wgnUZI_ibqEkiieTUZvSGr4gcFtbIHyy5l9UhBN7OPKUXnrSPdCNt0iKHPWH4T6LtocsXMy4sa6dVbi3BVx2IJ5iGgS8zZCM300g0wl",
    price: 2190000,
    original_price: 2920000,
    discount_percent: 25,
    sold_count: 4200,
    rating_avg: 4.9,
    rating_count: 2100,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "SoundWave Store",
    shop_badge: "OFFICIAL",
    claimed_percentage: 88,
    stock_alert: "Almost sold out",
    is_flash_sale: true,
  },
];

/* ==========================================================================
   3. MOCK DATA: BROWSE CATALOG PRODUCTS (Home Page Section 3)
   ========================================================================== */
export const mockCatalogProducts: ProductItem[] = [
  {
    id: 201,
    shop_id: 5,
    category_id: 4,
    brand_id: null,
    name: "Minimalist Heavy Canvas Day Tote - Khaki Cream",
    slug: "minimalist-heavy-canvas-day-tote",
    description: "Structured raw canvas tote with full grain leather straps and internal dividers.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEgHtCqlhutCLIQeAPrUQ6z8T4LNYDhol_IwHnzx6VC4SbLlCcHCyKqLxuAbMlXEE77KGZNel8F9aP3JOlxy6tHFZqo_mZrzew2bVZXC6rzMPwS17MLVfEM1mH5lxT9rfH_llb3BxdFFfASPWLmWSj38wI35RXkm2lawjFjpUTCepwPoS3myFo_ikMbGhwfk5xyY-g8xodJdXrwJDtIfm0TbhtqIMjAJsf9S49z2LYmMc9DJig6Ezw",
    price: 450000,
    original_price: 450000,
    sold_count: 640,
    rating_avg: 4.9,
    rating_count: 312,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Mộc Atelier • Saigon",
    shop_badge: "ARTISAN",
    tag: "NEW IN",
  },
  {
    id: 202,
    shop_id: 6,
    category_id: 5,
    brand_id: null,
    name: "Hand-thrown Wood Ash Ceramic Tumbler (Set of 2)",
    slug: "hand-thrown-wood-ash-ceramic-tumbler",
    description: "Artisan wood-fired ceramic tumblers finished with natural ash glaze from Bat Trang Craft Lab.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_lUHQFUIemftdU5or3cXphetJcZ383ap0u9O9zBjHp373bbT25SwI1fQIJH0fB6bvKYoZDnpDW4Cn9taa20Rf7bNQFsvjiHK8qOzQR8m5Lgd_ygw3adOmT-6Rc4dMSq-UhQq7g2GfRD8xiSzGgPcVy5GS5SP7oWgkmQraW6QsCrCp8vIPEyL1cUW1Ix6abCS_A9tIbLiTpeyieozNz1PxSce2mnogeixselK_Y8KM4klrbeFvPdIk",
    price: 320000,
    original_price: 320000,
    sold_count: 180,
    rating_avg: 4.8,
    rating_count: 180,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Bat Trang Craft Lab",
    shop_badge: "ARTISAN",
    tag: "HANDMADE",
  },
  {
    id: 203,
    shop_id: 7,
    category_id: 2,
    brand_id: null,
    name: "Tactical Parachute Cargo Pants - Sage Olive",
    slug: "tactical-parachute-cargo-pants",
    description: "Lightweight weather-resistant technical cargo trousers with adjustable toggle hem.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyTzIcNZctXPuwkxN6qS0buY1MKDd_WaT60shV1lQBzAdqScOsLZF9BmjoM4yjwGOgZMhXK2KDtpvf3oVOtAzQ8Z-y8a4SFoElyiTsUxAHiOPHSI8VAcayyCroo73-ArBwbCNANVQKIvynItFI51RuJaoRRKn1WG1tBFq3ONnxgmcFVFr-XEwrrh3ByDEOrPGrb_kxkyoR11W4eGK12UcBHDAOjkDxy5Qak1LdrCh-WRFaHpJJsWVk",
    price: 680000,
    original_price: 800000,
    discount_percent: 15,
    sold_count: 450,
    rating_avg: 4.7,
    rating_count: 450,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "District 1 Streetwear",
    shop_badge: "MALL",
    tag: "-15%",
  },
  {
    id: 204,
    shop_id: 8,
    category_id: 3,
    brand_id: null,
    name: "Linear Touch-Dimming Studio Desk Bar - Space Black",
    slug: "linear-touch-dimming-studio-desk-bar",
    description: "Precision engineered anodized aluminum computer monitor lamp with asymmetric optical design.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh7c9Wmqd9Mqq0BWHRpqJm9nMvOg70gi72thfKkzxkU_WkEx7G1rjNCSrFK2LhFUF33Zv2uXj51ECEmiHWgJ5i81EBwdtBWQUNyBQNj-NTWoyG49OmeTzZrZnEtRxWrMqW86pdvD5CD0n5lr4DmswW5lAK9koTBo09YVvVV02RxKBl3MWL8rpI4qqgoc-TNsVOAEZm1edBLKzVZZF5cJfoMuzCMska0UdSI8VQS08mTvvbWGbqOFgT",
    price: 1150000,
    original_price: 1150000,
    sold_count: 220,
    rating_avg: 5.0,
    rating_count: 220,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Lumens Industrial VN",
    shop_badge: "OFFICIAL",
    tag: "POPULAR",
  },
  {
    id: 205,
    shop_id: 9,
    category_id: 6,
    brand_id: null,
    name: "Hammered Compass Signet Ring in Solid 925 Silver",
    slug: "hammered-compass-signet-ring",
    description: "Solid sterling silver signet ring with engraved nautical compass rose and textured hammered band.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnrCOmzIYBDKjjhCBpOIg2ppWNzdmO_Kxm-AcWniec5TKz9zawLSjlIhqBmCMZao2O0FdxA1yFqgYs3hvL1g3fXAciA5qfJFdDwSnWKgzxoqD-SgzMwNN7AqDkY6zFXPa5WAlPtZDC94EgScnW8XxPGlvP2jwVHUgKtuJBqZgmcIdQg_WpPoy4Xpj4ZKXOl8SxD-7aar7h4c5p9LumBpT7PmOEvEBdb7Lj2ftRjIM58egp9DBMWKCV",
    price: 590000,
    original_price: 590000,
    sold_count: 140,
    rating_avg: 4.9,
    rating_count: 140,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "SilverForge Hanoi",
    shop_badge: "ARTISAN",
    tag: "LIMITED",
  },
  {
    id: 206,
    shop_id: 10,
    category_id: 4,
    brand_id: null,
    name: "Utility Crossbody Sling w/ Magnetic Fidlock - Terracotta",
    slug: "utility-crossbody-sling-terracotta",
    description: "Cordura 500D weatherproof everyday carry sling bag with German Fidlock V-buckle.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjlxE1_gJkEaDcn6FUNSUrj0Kx7JjRaNK1DU6ES62aDZHTa4kn9oBrKmI80BlM59ySTTLfzwQSBDOnboF8Ci6Yzv2U9u8o2uHTjUdXp8lGNbflrH1pZfozoAwFrzTwziCldjIZgEybl3owXN-snp-JFGbvxQwtyO0LKyavOe78MGdcw7bjEDbAeyXg7tLiWKg_i4_uaTYaaUzH6fseRo8dz2afzzpDJ2BCvEh-RU7HzWXcz-dIFbBK",
    price: 510000,
    original_price: 510000,
    sold_count: 530,
    rating_avg: 4.8,
    rating_count: 530,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "NOMAD Packworks",
    shop_badge: "MALL",
    tag: "NEW IN",
  },
  {
    id: 207,
    shop_id: 11,
    category_id: 1,
    brand_id: null,
    name: "Track 6 Low Top Vulcanized Canvas Sneaker - Raw Linen",
    slug: "track-6-low-top-sneaker",
    description: "Heritage low profile sneaker with 12oz natural unbleached raw linen upper and gum sole.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK4UarBaVhWmPtmjQNS1A4cjK61SFDsLw8jf7QOH1K1oTQ5V3Tnv6efkTB8q6E130NVUfw4tAPT8sDen7ndaZg271GgyGR6-SPnjrnXy1amf2Y5rhzXU5ZZzRg1Y5hewc-PymTEYnByi-nZIsi-iomAcDK8bpsHIeXHR6TC6WhR9OD7K7T3Gn33WHdkIwcH4W99D4P_2ubXt6KirDq2axOwC8PebCgc9IQCoHry0sKfMkWSkfJpyyk",
    price: 750000,
    original_price: 750000,
    sold_count: 980,
    rating_avg: 4.9,
    rating_count: 980,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Ananas Collective",
    shop_badge: "OFFICIAL",
    tag: "BEST SELLER",
  },
  {
    id: 208,
    shop_id: 12,
    category_id: 7,
    brand_id: null,
    name: "Artisanal Pine & Smoky Hinoki Amber Scented Candle",
    slug: "artisanal-pine-smoky-hinoki-amber-candle",
    description: "Botanical soy wax candle infused with pure essential oils of Dalat pine needles and Japanese hinoki wood.",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAv8pR4zCIsUyVYGZt2-fJC6qdClbMdRcNjkTw1jvWiVmsKcXi_oDwvRKxRF21YqQ6ssyJDdqoFNtn6maP79Uc6_zRQyrfve8tazbChfGQNso8gVMbo-HKfGtKWfflBxY90hfqpj1G_AH4o_CinZmwAi9Yia8zuw--RFP7vYEy9GrwpxsBF7u5J0bGgwcv7xxx0l52C2Mn95HOzbN_bdipc3mCucqOHmwmdV-B2GCexz78SXketW-kf",
    price: 360000,
    original_price: 360000,
    sold_count: 210,
    rating_avg: 4.8,
    rating_count: 210,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Dalat Botanics",
    shop_badge: "ARTISAN",
    tag: "NATURAL",
  },
];

/* ==========================================================================
   4. MOCK DATA: ADMIN INVENTORY STATS (admin_product.html telemetry strip)
   ========================================================================== */
export const mockInventoryStats: InventoryStats = {
  totalSkus: 124,
  newThisMonth: 18,
  activeListings: 118,
  activePercentage: 95.2,
  lowStockCount: 4,
  outOfStockCount: 2,
};

/* ==========================================================================
   5. MOCK DATA: ADMIN PRODUCTS LIST (admin_product.html table)
   ========================================================================== */
export let mockAdminProductsState: AdminProductItem[] = [
  {
    id: 1,
    name: "Urban Runner Sneaker - Night Camo Edition",
    sku: "SKU-SNK-042",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD344B_38t_6l8e37lR1F7JjCj506xK043qE54v_42wF524_Sneaker_Night_Camo",
    shop_name: "UrbanStep",
    shop_badge: "MALL",
    category_name: "Footwear",
    price: 1250000,
    stock: 3,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 2,
    name: "Cushioned Bamboo Athletic Socks (3-Pack)",
    sku: "SKU-SOX-102",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK-JFdB_64SlYHfC6mKpGa4elPAoJ68RZ-jKJS8WDId1iCsZ62DUKXE47e2OE7AapWzAs8aKrglf2IYcas8NPqcZZDstr5L8v7enTpwCxqZx_6JfdRf13JMzq9jJho6Xcq1FKu71ogmN8YBbURHir3YkSR2AsZUU02BgZF6SpfH4u_dPdacZJIz_0zegk45v_x_ejHtenZ7cDZYpOq34wJK2add2612crmxelm7owLXJAuPf4JZl0H",
    shop_name: "UrbanStep",
    shop_badge: "MALL",
    category_name: "Accessories",
    price: 120000,
    stock: 85,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 3,
    name: "Minimalist Veg-Tanned Cardholder",
    sku: "SKU-CRD-770",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe3_BArY2ZqxL9i2URLB7FWT1g4AXxpzQjjM-2pc23C7HcEJ0URIdkh2ssnWH-6mZhEWD-1n_36CgjWQoEpRXrRdKaOsSdHp79LAF2W8pX7OBAApLvrLF3wlHScjxdzBcAasyWTfzTyh2nc5fU5NkOpEku6vdojPfw_e2PyRnHOjw0HXn2RcLLtJY3EQqqsHIxZza86F1S3KbTvCJclpQ6icLZKmHvAuP-MImmRVuJrCJtv7uChXm4",
    shop_name: "Crafted Saigon",
    shop_badge: "ARTISAN",
    category_name: "Artisan",
    price: 450000,
    stock: 0,
    status: "INACTIVE",
    is_active: false,
  },
  {
    id: 4,
    name: "Minimalist Ceramic Coffee Dripper",
    sku: "SKU-DRP-882",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK_Ceramic_Dripper_Basalt_Grey_Coffee_Set_Minimalist_Saigon",
    shop_name: "Crafted Saigon",
    shop_badge: "ARTISAN",
    category_name: "Home & Living",
    price: 380000,
    stock: 2,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 5,
    name: "Linen Blend Summer Resort Shirt - Olive",
    sku: "SKU-SHT-204",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuE9_Linen_Blend_Summer_Shirt_Olive_UrbanStep",
    shop_name: "UrbanStep",
    shop_badge: "MALL",
    category_name: "Apparel",
    price: 580000,
    stock: 42,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 6,
    name: "Organic Matcha Powder Ceremonial Grade 100g",
    sku: "SKU-MTC-501",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Matcha_Powder_Ceremonial_Grade_GreenTea_VN",
    shop_name: "GreenTea VN",
    shop_badge: "VERIFIED",
    category_name: "Food & Beverage",
    price: 290000,
    stock: 110,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 7,
    name: "Hand-poured Soy Candle Cedarwood & Amber",
    sku: "SKU-CND-309",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_Soy_Candle_Cedarwood_Fig_Lac_Scent_Artisan_Saigon",
    shop_name: "Lạc Scent",
    shop_badge: "ARTISAN",
    category_name: "Home & Living",
    price: 280000,
    stock: 24,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 8,
    name: "Wireless Ergonomic Vertical Mouse 2.4G",
    sku: "SKU-MSE-914",
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuF_Vertical_Mouse_Ergonomic_Wireless_TechGear",
    shop_name: "TechGear Official",
    shop_badge: "OFFICIAL",
    category_name: "Electronics",
    price: 620000,
    stock: 15,
    status: "ACTIVE",
    is_active: true,
  },
];

/* ==========================================================================
   6. PRODUCT API WITH AUTOMATIC MOCK FALLBACK
   ========================================================================== */
export const productApi = {
  /**
   * Lấy danh mục sản phẩm (Category Circles Bar trên trang Home)
   */
  fetchCategories: async (): Promise<Category[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<Category[]>>("/api/v1/categories");
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch {
      // Fallback to mock categories matching scriptDb.sql
    }
    return mockCategories;
  },

  /**
   * Lấy danh sách Flash Sale cho trang Home
   */
  fetchFlashSaleProducts: async (): Promise<ProductItem[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<ProductList>>("/api/v1/products", {
        params: { sort: "best_selling", limit: 4 },
      });
      if (response.data && response.data.data && response.data.data.products?.length > 0) {
        return response.data.data.products;
      }
    } catch {
      // Fallback to mock flash sale products matching home_page.html
    }
    return mockFlashSaleProducts;
  },

  /**
   * Lấy danh mục sản phẩm Catalog trên trang Home (hỗ trợ lọc theo categoryId & sắp xếp)
   */
  fetchCatalogProducts: async (params?: {
    categoryId?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductList> => {
    const sortMap: Record<string, string> = {
      "Price: Low → High": "price_asc",
      "Price: High → Low": "price_desc",
      "Best Selling": "best_selling",
      "Latest Arrivals": "latest",
    };

    try {
      const response = await axiosClient.get<ApiResponse<ProductList>>("/api/v1/products", {
        params: {
          category_id: params?.categoryId || 0,
          sort: sortMap[params?.sort || ""] || params?.sort,
          page: params?.page || 1,
          limit: params?.limit || 100,
        },
      });
      if (response.data && response.data.data && response.data.data.products?.length > 0) {
        return response.data.data;
      }
    } catch {
      // Fallback to mock catalog products
    }

    let filtered = [...mockCatalogProducts];

    // Filter by category if selected
    if (params?.categoryId && params.categoryId > 0) {
      filtered = filtered.filter((p) => p.category_id === params.categoryId);
    }

    // Sort items
    if (params?.sort === "Price: Low → High" || params?.sort === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params?.sort === "Price: High → Low" || params?.sort === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (params?.sort === "Best Selling" || params?.sort === "best_selling") {
      filtered.sort((a, b) => b.sold_count - a.sold_count);
    } else if (params?.sort === "Latest Arrivals" || params?.sort === "latest") {
      filtered.sort((a, b) => b.id - a.id);
    }

    return {
      products: filtered,
      total: filtered.length,
    };
  },

  /**
   * Lấy số liệu thống kê kho hàng cho Admin Product Management
   */
  fetchInventoryStats: async (): Promise<InventoryStats> => {
    try {
      const response = await axiosClient.get<ApiResponse<InventoryStats>>(
        "/api/v1/admin/inventory-stats"
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback to mock stats
    }
    return mockInventoryStats;
  },

  /**
   * Lấy danh sách sản phẩm quản trị (Admin Product Management Table)
   * Hỗ trợ tìm kiếm, lọc danh mục, trạng thái tồn kho, nhà cung cấp và sắp xếp
   */
  fetchAdminProducts: async (params?: {
    search?: string;
    category?: string;
    stockStatus?: string;
    vendor?: string;
    sortBy?: string;
  }): Promise<AdminProductList> => {
    try {
      const response = await axiosClient.get<ApiResponse<AdminProductList>>(
        "/api/v1/admin/products",
        {
          params: {
            search: params?.search,
            category: params?.category,
            stock_status: params?.stockStatus,
            vendor: params?.vendor,
            sort_by: params?.sortBy,
          },
        }
      );
      if (response.data && response.data.data && response.data.data.products?.length > 0) {
        return response.data.data;
      }
    } catch {
      // Fallback to in-memory mock admin products
    }

    let filtered = [...mockAdminProductsState];

    // Search query filter
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.shop_name.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (params?.category && params.category !== "") {
      filtered = filtered.filter((p) => p.category_name.toLowerCase() === params.category!.toLowerCase());
    }

    // Stock status filter
    if (params?.stockStatus) {
      if (params.stockStatus === "in_stock") {
        filtered = filtered.filter((p) => p.stock > 10);
      } else if (params.stockStatus === "low_stock") {
        filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10);
      } else if (params.stockStatus === "out_of_stock") {
        filtered = filtered.filter((p) => p.stock === 0);
      }
    }

    // Vendor filter
    if (params?.vendor && params.vendor !== "") {
      filtered = filtered.filter((p) => p.shop_name.toLowerCase() === params.vendor!.toLowerCase());
    }

    // Sorting
    if (params?.sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params?.sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (params?.sortBy === "stock_desc") {
      filtered.sort((a, b) => b.stock - a.stock);
    } else if (params?.sortBy === "stock_asc") {
      filtered.sort((a, b) => a.stock - b.stock);
    }

    return {
      products: filtered,
      total: filtered.length,
    };
  },

  /**
   * Bật/Tắt trạng thái hoạt động của sản phẩm trong Admin Table
   */
  toggleAdminProductStatus: async (productId: number): Promise<AdminProductItem> => {
    try {
      const current = await productApi.fetchAdminProducts();
      const product = current.products.find((item) => item.id === productId);
      if (!product) throw new Error("Không tìm thấy sản phẩm");

      const response = await axiosClient.patch<ApiResponse<{ id: number; is_active: boolean }>>(
        `/api/v1/admin/products/${productId}/status`,
        { is_active: !product.is_active }
      );
      if (response.data && response.data.data) {
        return {
          ...product,
          is_active: response.data.data.is_active,
          status: response.data.data.is_active ? "ACTIVE" : "INACTIVE",
        };
      }
    } catch {
      // In-memory update
    }

    const index = mockAdminProductsState.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error("Không tìm thấy sản phẩm");

    const newActive = !mockAdminProductsState[index].is_active;
    mockAdminProductsState[index] = {
      ...mockAdminProductsState[index],
      is_active: newActive,
      status: newActive ? "ACTIVE" : "INACTIVE",
    };

    return mockAdminProductsState[index];
  },

  /**
   * Xóa sản phẩm trong Admin Table
   */
  deleteAdminProduct: async (productId: number): Promise<number> => {
    try {
      await axiosClient.delete(`/api/v1/admin/products/${productId}`);
    } catch {
      // In-memory delete
    }
    mockAdminProductsState = mockAdminProductsState.filter((p) => p.id !== productId);
    return productId;
  },

  /**
   * Thao tác hàng loạt (Bulk Actions: activate, deactivate, delete)
   */
  bulkAdminAction: async (
    action: string,
    productIds: number[]
  ): Promise<{ action: string; count: number }> => {
    if (!["activate", "deactivate", "delete"].includes(action)) {
      throw new Error("Thao tác không hợp lệ");
    }

    try {
      const response = await axiosClient.post<ApiResponse<{ action: string; count: number }>>(
        "/api/v1/admin/products/bulk",
        { action, product_ids: productIds }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory bulk action
    }

    if (action === "activate") {
      mockAdminProductsState = mockAdminProductsState.map((p) =>
        productIds.includes(p.id) ? { ...p, is_active: true, status: "ACTIVE" } : p
      );
    } else if (action === "deactivate") {
      mockAdminProductsState = mockAdminProductsState.map((p) =>
        productIds.includes(p.id) ? { ...p, is_active: false, status: "INACTIVE" } : p
      );
    } else if (action === "delete") {
      mockAdminProductsState = mockAdminProductsState.filter((p) => !productIds.includes(p.id));
    }

    return { action, count: productIds.length };
  },
};

export default productApi;
