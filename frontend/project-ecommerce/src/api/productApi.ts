import type { Category, ProductItem, AdminProductItem, InventoryStats } from "../types/ecommerce";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    parent_id: null,
    name: "Tất cả",
    slug: "all",
    image_url: null,
    sort_order: 1,
    is_active: 1,
  },
  {
    id: 2,
    parent_id: null,
    name: "Giày & Sneakers",
    slug: "shoes-sneakers",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqVk-lBkAA4USyZO0R0_HY-FbaMP7NsI74OjtCcPgT_KkDyoj6C9_MHm1Jq8Tx3tc7-c8B8yku8KesRJDNKvkKJ7Zzdb_ZPMhYTpGvc0WDcAXWxN9LtLLcoxdtPh8xt_urWfsV5Gf6kA-9PxrWHT3z0zJnsC-NHUsE3_iFD6Gi24ZdDXwhWKXYGYC0EWvicm_kOyuy_e-FY2Nj51bwy_hdqv_p8Pvd1-DZRbd1Xr1-ZOX16wLOZwSz",
    sort_order: 2,
    is_active: 1,
  },
  {
    id: 3,
    parent_id: null,
    name: "Thời trang",
    slug: "fashion",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGqeWsOSGJB-59Hbs43pb4fqcZNi7PwMfHt7WG66WlZqaJTtspBZAN1eObVrCPaMiEUIDs6tVXX7I63cCoQ1rUNgg2ad-0gCeHvaEGHjeaxvWO0FVxdAu6UqFZFHBzPQWzTETn48GK9ePeqeFmTX6qMUJ7HL4Nl9TXU_9s875AImYx19ZGjeX8b1Vx4uGgC-cUFZ502tD2EJiJUkjhAdjDmP0EEFZpvHO0CIWYKveDRNVvch0GZcA",
    sort_order: 3,
    is_active: 1,
  },
  {
    id: 4,
    parent_id: null,
    name: "Công nghệ",
    slug: "technology",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnQyZyuNWZZUPb_k3XM-ruGr3dvkO4wS5NBMkP3ogp_WLnd1ybVsfrraJt68lWuotdKeMu4egh2O7f-l4D2KfJegXS0OqNKhicRwyQ8cquxLg63AJjkFEWJh0cvs3oecyR6zREK4QCuq2e7wgnUZI_ibqEkiieTUZvSGr4gcFtbIHyy5l9UhBN7OPKUXnrSPdCNt0iKHPWH4T6LtocsXMy4sa6dVbi3BVx2IJ5iGgS8zZCM300g0wl",
    sort_order: 4,
    is_active: 1,
  },
  {
    id: 5,
    parent_id: null,
    name: "Túi & Phụ kiện",
    slug: "bags-accessories",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEgHtCqlhutCLIQeAPrUQ6z8T4LNYDhol_IwHnzx6VC4SbLlCcHCyKqLxuAbMlXEE77KGZNel8F9aP3JOlxy6tHFZqo_mZrzew2bVZXC6rzMPwS17MLVfEM1mH5lxT9rfH_llb3BxdFFfASPWLmWSj38wI35RXkm2lawjFjpUTCepwPoS3myFo_ikMbGhwfk5xyY-g8xodJdXrwJDtIfm0TbhtqIMjAJsf9S49z2LYmMc9DJig6Ezw",
    sort_order: 5,
    is_active: 1,
  },
  {
    id: 6,
    parent_id: null,
    name: "Gốm & Thủ công",
    slug: "ceramics-crafts",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_lUHQFUIemftdU5or3cXphetJcZ383ap0u9O9zBjHp373bbT25SwI1fQIJH0fB6bvKYoZDnpDW4Cn9taa20Rf7bNQFsvjiHK8qOzQR8m5Lgd_ygw3adOmT-6Rc4dMSq-UhQq7g2GfRD8xiSzGgPcVy5GS5SP7oWgkmQraW6QsCrCp8vIPEyL1cUW1Ix6abCS_A9tIbLiTpeyieozNz1PxSce2mnogeixselK_Y8KM4klrbeFvPdIk",
    sort_order: 6,
    is_active: 1,
  },
  {
    id: 7,
    parent_id: null,
    name: "Trang sức & Bạc",
    slug: "jewelry-silver",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnrCOmzIYBDKjjhCBpOIg2ppWNzdmO_Kxm-AcWniec5TKz9zawLSjlIhqBmCMZao2O0FdxA1yFqgYs3hvL1g3fXAciA5qfJFdDwSnWKgzxoqD-SgzMwNN7AqDkY6zFXPa5WAlPtZDC94EgScnW8XxPGlvP2jwVHUgKtuJBqZgmcIdQg_WpPoy4Xpj4ZKXOl8SxD-7aar7h4c5p9LumBpT7PmOEvEBdb7Lj2ftRjIM58egp9DBMWKCV",
    sort_order: 7,
    is_active: 1,
  },
  {
    id: 8,
    parent_id: null,
    name: "Nước hoa & Nến",
    slug: "perfumes-candles",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAv8pR4zCIsUyVYGZt2-fJC6qdClbMdRcNjkTw1jvWiVmsKcXi_oDwvRKxRF21YqQ6ssyJDdqoFNtn6maP79Uc6_zRQyrfve8tazbChfGQNso8gVMbo-HKfGtKWfflBxY90hfqpj1G_AH4o_CinZmwAi9Yia8zuw--RFP7vYEy9GrwpxsBF7u5J0bGgwcv7xxx0l52C2Mn95HOzbN_bdipc3mCucqOHmwmdV-B2GCexz78SXketW-kf",
    sort_order: 8,
    is_active: 1,
  },
];

export const MOCK_FLASH_SALE_PRODUCTS: ProductItem[] = [
  {
    id: 101,
    shop_id: 1,
    category_id: 3,
    brand_id: 1,
    name: "Komorebi Heavyweight Boxy Tee - Vintage Black",
    slug: "komorebi-heavyweight-boxy-tee-vintage-black",
    description: "High quality studio lookbook heavyweight vintage black boxy t-shirt.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGqeWsOSGJB-59Hbs43pb4fqcZNi7PwMfHt7WG66WlZqaJTtspBZAN1eObVrCPaMiEUIDs6tVXX7I63cCoQ1rUNgg2ad-0gCeHvaEGHjeaxvWO0FVxdAu6UqFZFHBzPQWzTETn48GK9ePeqeFmTX6qMUJ7HL4Nl9TXU_9s875AImYx19ZGjeX8b1Vx4uGgC-cUFZ502tD2EJiJUkjhAdjDmP0EEFZpvHO0CIWYKveDRNVvch0GZcA",
    price: 390000,
    original_price: 600000,
    discount_percent: 35,
    sold_count: 1200,
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
    category_id: 2,
    brand_id: 2,
    name: "Retro Runner V2 Sneaker - Off White / Forest Green",
    slug: "retro-runner-v2-sneaker-off-white-forest-green",
    description: "Retro styled premium lifestyle running sneakers in off-white leather.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqVk-lBkAA4USyZO0R0_HY-FbaMP7NsI74OjtCcPgT_KkDyoj6C9_MHm1Jq8Tx3tc7-c8B8yku8KesRJDNKvkKJ7Zzdb_ZPMhYTpGvc0WDcAXWxN9LtLLcoxdtPh8xt_urWfsV5Gf6kA-9PxrWHT3z0zJnsC-NHUsE3_iFD6Gi24ZdDXwhWKXYGYC0EWvicm_kOyuy_e-FY2Nj51bwy_hdqv_p8Pvd1-DZRbd1Xr1-ZOX16wLOZwSz",
    price: 1250000,
    original_price: 1750000,
    discount_percent: 28,
    sold_count: 840,
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
    category_id: 5,
    brand_id: 3,
    name: "Minimalist Vegetable Tanned Leather Cardholder",
    slug: "minimalist-vegetable-tanned-leather-cardholder",
    description: "Artisanal hand stitched vegetable tanned natural caramel leather card wallet.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCiK1ACxrAqhJiusftQGXjV28yO9xncYI8nmoNuSVCRN-Gzmth_r5wrAv4KrBl3FNt0heMuUEh_PkfyoD4mcPOXcsRzwDkv50guWn5pRUdW9kAWPyX-xH8QUpMog04jCpi3AKzigHRFYGaOYYMXviB5xYglRb7qqtjd6gMvFsxP92i13gQ6obpzW4SEvpYZOE73GP6Hf1UjjOJAEOx9gpv3NfAfFsO7YyddWczovXZS7YtCAQqPDerH",
    price: 240000,
    original_price: 400000,
    discount_percent: 40,
    sold_count: 430,
    rating_avg: 5.0,
    rating_count: 430,
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
    category_id: 4,
    brand_id: 4,
    name: "Over-Ear ANC Studio Wireless Headphones - Matte Slate",
    slug: "over-ear-anc-studio-wireless-headphones-matte-slate",
    description: "High tech matte slate grey over ear wireless noise cancelling headphones.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnQyZyuNWZZUPb_k3XM-ruGr3dvkO4wS5NBMkP3ogp_WLnd1ybVsfrraJt68lWuotdKeMu4egh2O7f-l4D2KfJegXS0OqNKhicRwyQ8cquxLg63AJjkFEWJh0cvs3oecyR6zREK4QCuq2e7wgnUZI_ibqEkiieTUZvSGr4gcFtbIHyy5l9UhBN7OPKUXnrSPdCNt0iKHPWH4T6LtocsXMy4sa6dVbi3BVx2IJ5iGgS8zZCM300g0wl",
    price: 2190000,
    original_price: 2920000,
    discount_percent: 25,
    sold_count: 2100,
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

export const MOCK_CATALOG_PRODUCTS: ProductItem[] = [
  {
    id: 201,
    shop_id: 5,
    category_id: 5,
    brand_id: 5,
    name: "Minimalist Heavy Canvas Day Tote - Khaki Cream",
    slug: "minimalist-heavy-canvas-day-tote-khaki-cream",
    description: "Structured canvas tote bag in natural raw cotton with brown full grain leather straps.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEgHtCqlhutCLIQeAPrUQ6z8T4LNYDhol_IwHnzx6VC4SbLlCcHCyKqLxuAbMlXEE77KGZNel8F9aP3JOlxy6tHFZqo_mZrzew2bVZXC6rzMPwS17MLVfEM1mH5lxT9rfH_llb3BxdFFfASPWLmWSj38wI35RXkm2lawjFjpUTCepwPoS3myFo_ikMbGhwfk5xyY-g8xodJdXrwJDtIfm0TbhtqIMjAJsf9S49z2LYmMc9DJig6Ezw",
    price: 450000,
    sold_count: 184,
    rating_avg: 4.9,
    rating_count: 184,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Mộc Atelier • Saigon",
    tag: "NEW IN",
    badge_info: "COD Verified",
  },
  {
    id: 202,
    shop_id: 6,
    category_id: 6,
    brand_id: 6,
    name: "Hand-thrown Wood Ash Ceramic Tumbler (Set of 2)",
    slug: "hand-thrown-wood-ash-ceramic-tumbler-set-of-2",
    description: "Contemporary handcrafted ceramic tea tumbler set with reactive wood ash glaze.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_lUHQFUIemftdU5or3cXphetJcZ383ap0u9O9zBjHp373bbT25SwI1fQIJH0fB6bvKYoZDnpDW4Cn9taa20Rf7bNQFsvjiHK8qOzQR8m5Lgd_ygw3adOmT-6Rc4dMSq-UhQq7g2GfRD8xiSzGgPcVy5GS5SP7oWgkmQraW6QsCrCp8vIPEyL1cUW1Ix6abCS_A9tIbLiTpeyieozNz1PxSce2mnogeixselK_Y8KM4klrbeFvPdIk",
    price: 320000,
    sold_count: 92,
    rating_avg: 5.0,
    rating_count: 92,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Bat Trang Craft Lab",
    tag: "ARTISAN",
    badge_info: "Handmade",
  },
  {
    id: 203,
    shop_id: 7,
    category_id: 3,
    brand_id: 7,
    name: "Tactical Parachute Cargo Pants - Sage Olive",
    slug: "tactical-parachute-cargo-pants-sage-olive",
    description: "Relaxed cut olive green tactical cargo trousers with utilitarian geometric flap pockets.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyTzIcNZctXPuwkxN6qS0buY1MKDd_WaT60shV1lQBzAdqScOsLZF9BmjoM4yjwGOgZMhXK2KDtpvf3oVOtAzQ8Z-y8a4SFoElyiTsUxAHiOPHSI8VAcayyCroo73-ArBwbCNANVQKIvynItFI51RuJaoRRKn1WG1tBFq3ONnxgmcFVFr-XEwrrh3ByDEOrPGrb_kxkyoR11W4eGK12UcBHDAOjkDxy5Qak1LdrCh-WRFaHpJJsWVk",
    price: 680000,
    original_price: 850000,
    discount_percent: 20,
    sold_count: 610,
    rating_avg: 4.8,
    rating_count: 610,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "District 1 Streetwear",
    tag: "-20%",
    badge_info: "Fast Moving",
  },
  {
    id: 204,
    shop_id: 8,
    category_id: 4,
    brand_id: 8,
    name: "Linear Touch-Dimming Studio Desk Bar - Space Black",
    slug: "linear-touch-dimming-studio-desk-bar-space-black",
    description: "Sleek anodized aluminum desk lamp in matte black with warm LED light strip.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCh7c9Wmqd9Mqq0BWHRpqJm9nMvOg70gi72thfKkzxkU_WkEx7G1rjNCSrFK2LhFUF33Zv2uXj51ECEmiHWgJ5i81EBwdtBWQUNyBQNj-NTWoyG49OmeTzZrZnEtRxWrMqW86pdvD5CD0n5lr4DmswW5lAK9koTBo09YVvVV02RxKBl3MWL8rpI4qqgoc-TNsVOAEZm1edBLKzVZZF5cJfoMuzCMska0UdSI8VQS08mTvvbWGbqOFgT",
    price: 1150000,
    sold_count: 320,
    rating_avg: 4.9,
    rating_count: 320,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Lumens Industrial VN",
    tag: "TECH",
    badge_info: "Official 1Y Gar",
  },
  {
    id: 205,
    shop_id: 9,
    category_id: 7,
    brand_id: 9,
    name: "Hammered Compass Signet Ring in Solid 925 Silver",
    slug: "hammered-compass-signet-ring-in-solid-925-silver",
    description: "Solid 925 sterling silver hammered signet ring with engraved geometric compass motif.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnrCOmzIYBDKjjhCBpOIg2ppWNzdmO_Kxm-AcWniec5TKz9zawLSjlIhqBmCMZao2O0FdxA1yFqgYs3hvL1g3fXAciA5qfJFdDwSnWKgzxoqD-SgzMwNN7AqDkY6zFXPa5WAlPtZDC94EgScnW8XxPGlvP2jwVHUgKtuJBqZgmcIdQg_WpPoy4Xpj4ZKXOl8SxD-7aar7h4c5p9LumBpT7PmOEvEBdb7Lj2ftRjIM58egp9DBMWKCV",
    price: 590000,
    sold_count: 140,
    rating_avg: 5.0,
    rating_count: 140,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "SilverForge Hanoi",
    tag: "SILVER 925",
    badge_info: "Custom Size",
  },
  {
    id: 206,
    shop_id: 10,
    category_id: 5,
    brand_id: 10,
    name: "Utility Crossbody Sling w/ Magnetic Fidlock - Terracotta",
    slug: "utility-crossbody-sling-magnetic-fidlock-terracotta",
    description: "Water-repellent Cordura nylon crossbody sling bag in clay terracotta with Fidlock buckle.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjlxE1_gJkEaDcn6FUNSUrj0Kx7JjRaNK1DU6ES62aDZHTa4kn9oBrKmI80BlM59ySTTLfzwQSBDOnboF8Ci6Yzv2U9u8o2uHTjUdXp8lGNbflrH1pZfozoAwFrzTwziCldjIZgEybl3owXN-snp-JFGbvxQwtyO0LKyavOe78MGdcw7bjEDbAeyXg7tLiWKg_i4_uaTYaaUzH6fseRo8dz2afzzpDJ2BCvEh-RU7HzWXcz-dIFbBK",
    price: 510000,
    original_price: 600000,
    discount_percent: 15,
    sold_count: 420,
    rating_avg: 4.8,
    rating_count: 420,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "NOMAD Packworks",
    tag: "-15%",
    badge_info: "Cordura 500D",
  },
  {
    id: 207,
    shop_id: 11,
    category_id: 2,
    brand_id: 11,
    name: "Track 6 Low Top Vulcanized Canvas Sneaker - Raw Linen",
    slug: "track-6-low-top-vulcanized-canvas-sneaker-raw-linen",
    description: "Low top canvas sneakers with vulcanized off-white rubber sole and raw linen upper.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK4UarBaVhWmPtmjQNS1A4cjK61SFDsLw8jf7QOH1K1oTQ5V3Tnv6efkTB8q6E130NVUfw4tAPT8sDen7ndaZg271GgyGR6-SPnjrnXy1amf2Y5rhzXU5ZZzRg1Y5hewc-PymTEYnByi-nZIsi-iomAcDK8bpsHIeXHR6TC6WhR9OD7K7T3Gn33WHdkIwcH4W99D4P_2ubXt6KirDq2axOwC8PebCgc9IQCoHry0sKfMkWSkfJpyyk",
    price: 750000,
    sold_count: 1800,
    rating_avg: 4.9,
    rating_count: 1800,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Ananas Collective",
    tag: "BEST SELLER",
    badge_info: "Ortholite Sole",
  },
  {
    id: 208,
    shop_id: 12,
    category_id: 8,
    brand_id: 12,
    name: "Artisanal Pine & Smoky Hinoki Amber Scented Candle",
    slug: "artisanal-pine-smoky-hinoki-amber-scented-candle",
    description: "Architectural glass and amber soy wax scented candle with engraved brass lid.",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAv8pR4zCIsUyVYGZt2-fJC6qdClbMdRcNjkTw1jvWiVmsKcXi_oDwvRKxRF21YqQ6ssyJDdqoFNtn6maP79Uc6_zRQyrfve8tazbChfGQNso8gVMbo-HKfGtKWfflBxY90hfqpj1G_AH4o_CinZmwAi9Yia8zuw--RFP7vYEy9GrwpxsBF7u5J0bGgwcv7xxx0l52C2Mn95HOzbN_bdipc3mCucqOHmwmdV-B2GCexz78SXketW-kf",
    price: 360000,
    sold_count: 310,
    rating_avg: 4.9,
    rating_count: 310,
    status: "ACTIVE",
    reject_reason: null,
    is_deleted: 0,
    shop_name: "Dalat Botanics",
    tag: "SCENTS",
    badge_info: "55h Burn Time",
  },
];

export const MOCK_INVENTORY_STATS: InventoryStats = {
  totalSkus: 124,
  newThisMonth: 12,
  activeListings: 118,
  activePercentage: 95.1,
  lowStockCount: 4,
  outOfStockCount: 2,
};

export const MOCK_ADMIN_PRODUCTS: AdminProductItem[] = [
  {
    id: 1,
    name: "Retro Runner V2 Sneaker",
    sku: "SKU-VN-8841",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbF_gW6K2oNWgAqEIbWZJMbSTMyLoNXTO-QAVEiv8Ujt9tYLKraFTmhg43ZBTayq4KGdwys1Yi5a5B8z8qtxAiuM1QdPp_lHbv3h5eJ3PG1W5gJjsCJ9k40QBYEyiGDKnS0S2R2PQs0mMDmfECpZvOGY6gIoDbHtCHRzblusHhQhCLo9dtK78iyTOzRgekYMZ10rYmg7wknMtOYcVDI6mkYZSR8tGaE_0AjQVJzHS0iv8BhG1O2FIm",
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
    name: "Cushioned Bamboo Athletic Socks",
    sku: "SKU-SOX-102",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK-JFdB_64SlYHfC6mKpGa4elPAoJ68RZ-jKJS8WDId1iCsZ62DUKXE47e2OE7AapWzAs8aKrglf2IYcas8NPqcZZDstr5L8v7enTpwCxqZx_6JfdRf13JMzq9jJho6Xcq1FKu71ogmN8YBbURHir3YkSR2AsZUU02BgZF6SpfH4u_dPdacZJIz_0zegk45v_x_ejHtenZ7cDZYpOq34wJK2add2612crmxelm7owLXJAuPf4JZl0H",
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
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBe3_BArY2ZqxL9i2URLB7FWT1g4AXxpzQjjM-2pc23C7HcEJ0URIdkh2ssnWH-6mZhEWD-1n_36CgjWQoEpRXrRdKaOsSdHp79LAF2W8pX7OBAApLvrLF3wlHScjxdzBcAasyWTfzTyh2nc5fU5NkOpEku6vdojPfw_e2PyRnHOjw0HXn2RcLLtJY3EQqqsHIxZza86F1S3KbTvCJclpQ6icLZKmHvAuP-MImmRVuJrCJtv7uChXm4",
    shop_name: "Crafted Saigon",
    shop_badge: "ARTISAN",
    category_name: "Artisan Craft",
    price: 450000,
    stock: 0,
    status: "INACTIVE",
    is_active: false,
  },
  {
    id: 4,
    name: "Canvas Everyday Tote",
    sku: "SKU-TOT-509",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPa170i9EmnYBnZ5YLeBkflsNNloX6dKRBe2sYZXQWKMJItXYNUeR-DcB1u4gv_tbO_3a7oaphNcdTHUkqRt5b0uRbPkBrxSRICYbWr1h8chJMFchOTvRva_kCFcl-4Sb2PCMJhXGKNcVY3ojHNwlkiyTLUP6dgx8ozQ-QqSc2sbT7GcXXVirYcT7BU42CWEi9hriilmZK5kIOEhUOQCxFItS3qftB32QFDSIKHuioVS92bEkGel1o",
    shop_name: "Terra Living Lab",
    shop_badge: "VERIFIED",
    category_name: "Accessories",
    price: 240000,
    stock: 42,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 5,
    name: "Ceramic Handcrafted Cup",
    sku: "SKU-POT-312",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHfI2XHBqQkikm4tBWF1j-qaaA48-4cug5C9ocsFJvcszHXMV3fxx9v8maU2AqwjMmxD_XKdGtaN8dcba4Zuw8axlO5pFhMSBTfo9T3KrUz4s34-3fyWUYP_Te9ZlpRoeI5wgfqvpcMRHoeSao9Xcl7bGzehtqm_ojxQXTJNot9ydw7s4aeDrKVqmhgCGPI9-kQhtI9q-TOU4sM1tq_rEvoy5eS9XoMOwcWAXs2S7BtGhgYdU2N8WT",
    shop_name: "Crafted Saigon",
    shop_badge: "ARTISAN",
    category_name: "Home & Living",
    price: 195000,
    stock: 2,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 6,
    name: "Embroidered Linen Shirt",
    sku: "SKU-LIN-404",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPGfFo1UG5IYgytBrJv-NIaJwbHxxKZhSr_Ljyz9OvqljbXP-9CAZdZ_8bZaY8acSAjEMawrWReKfeTq3QfXtcGLBZ1KEDsdqGreRigmH9xbZ-K1YzbX-xc0UjtQWR8tZTV8nNv3v2oEuory-mGZoBU4-dgrQLXYkuy1oP6YUEn6YC6OPHdvO6zBMSB1bQ2w2D_L6WUXvrmd0Ls5DsTvd8Za1wNp8UH4eUHID3fZ6LQQ30AjSqAONj",
    shop_name: "Vietnam Silk Co.",
    shop_badge: "MALL",
    category_name: "Fashion & Apparel",
    price: 680000,
    stock: 64,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 7,
    name: "Handmade Leather Chelsea Boots",
    sku: "SKU-BOT-901",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkRylgtdCsmjJ5vQXYndgs9OMMrXvX6iQNUu2p20aa7VXy3SixRJOGUFDzR44Xo66v8e-YRF2sT-q-1mvXTJxfG1oih4xB19YqhLYhJp26ODNaoi79ER_O7lF_k79Wpg1VWzY1vgEMMs6Z3bq8DyMN7mWm3PTpGqCNqFIxVOha4ajPCror-ZmUZZmstgqFQY9O81vo_SXYRInd4a_I9HDd033z4uGfQNWzT2_BBr1yBQf064NCXI65",
    shop_name: "UrbanStep",
    shop_badge: "MALL",
    category_name: "Footwear",
    price: 1890000,
    stock: 18,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 8,
    name: "Natural Soy Scented Candle",
    sku: "SKU-CND-019",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRIf6hJDLkbby9qVlgQUdm4NSTjjgobeN9xr0GmZeUeIPThtQLBr1iW4qKAka_9Bv5IC2AV8cJ8TVW5KuX9oAkbNmiVRpR9z-O9wD1liJBhtVjMw6P3rZDa-qpkmxe-PThI-J84Fe-_3Zfc6muwofkb5T0Kta0TUX5G2UTeaYHF7zqC7AIqDx9am0lVMVQjsQkwpbZ_x5ETva5vvKTFy3OfDrckBN8efKIqzN_ck2oVsYa_AulrD78",
    shop_name: "Terra Living Lab",
    shop_badge: "VERIFIED",
    category_name: "Home & Living",
    price: 280000,
    stock: 120,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 9,
    name: "Woven Bamboo Table Lamp",
    sku: "SKU-LMP-812",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCGnhZgEcWv91tsXngHyrHDZecZhtJzz2jh574dS80eV813bYUVbPRxCPXn55QY-R2MYGIwO0uZ87sgFhOqq9sa69oNgqZxJhJepY9uPPnvEgdJa_KMew0KzN4Q3ql5FX4jVbtUsFoTDDxjtUTVd_4jz-yaBZoDe0JDXhjUmr0aR0R-xL2DH8Xx_uKAmd-Em2iraWA-8c3ORCL0c7T1CoG0HazbUBFuNzh84o-QIGSn_H6e3Z6P1hV",
    shop_name: "Crafted Saigon",
    shop_badge: "ARTISAN",
    category_name: "Artisan Craft",
    price: 850000,
    stock: 4,
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: 10,
    name: "Organic Arabica Coffee Beans",
    sku: "SKU-COF-250",
    thumbnail_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqkt6rkZcRHRuQmgjTJS37tJJgAQT4CcqEu__38PaaQ77AoTBEQxIQBTL-CgvuqeKh8l76oyWJV_DhEmViXrhHNTTesKLiJURCy6J_DlrV6kAw07zKGH5xie5VSMXvMiIRMxu_jhY8pvxhf2Wt_c2TycjV2gxvXvlXhzofNawxLh6hsicv6ZWsCd6pQGAfykiny4ketG-W48DksTHleb3HO7HMQX-MAEthBA8Zj20WY1PDWdx33BdJ",
    shop_name: "Terra Living Lab",
    shop_badge: "VERIFIED",
    category_name: "Home & Living",
    price: 210000,
    stock: 0,
    status: "INACTIVE",
    is_active: false,
  },
];

let adminProductsState: AdminProductItem[] = [...MOCK_ADMIN_PRODUCTS];

export const productApi = {
  fetchCategories: async (): Promise<Category[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CATEGORIES), 100);
    });
  },

  fetchFlashSaleProducts: async (): Promise<ProductItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_FLASH_SALE_PRODUCTS), 150);
    });
  },

  fetchCatalogProducts: async (params?: {
    categoryId?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductItem[]; total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...MOCK_CATALOG_PRODUCTS];
        if (params?.categoryId && params.categoryId !== 1) {
          results = results.filter((p) => p.category_id === params.categoryId);
        }

        if (params?.sort === "Price: Low → High") {
          results.sort((a, b) => a.price - b.price);
        } else if (params?.sort === "Price: High → Low") {
          results.sort((a, b) => b.price - a.price);
        } else if (params?.sort === "Best Selling") {
          results.sort((a, b) => b.sold_count - a.sold_count);
        }

        resolve({
          products: results,
          total: 428,
        });
      }, 150);
    });
  },

  fetchInventoryStats: async (): Promise<InventoryStats> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_INVENTORY_STATS), 100);
    });
  },

  fetchAdminProducts: async (params?: {
    search?: string;
    category?: string;
    stockStatus?: string;
    vendor?: string;
    sortBy?: string;
  }): Promise<{ products: AdminProductItem[]; total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...adminProductsState];

        if (params?.search) {
          const q = params.search.toLowerCase().trim();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.shop_name.toLowerCase().includes(q)
          );
        }

        if (params?.category) {
          list = list.filter((p) => p.category_name === params.category);
        }

        if (params?.stockStatus) {
          if (params.stockStatus === "in_stock") {
            list = list.filter((p) => p.stock > 5);
          } else if (params.stockStatus === "low_stock") {
            list = list.filter((p) => p.stock > 0 && p.stock <= 5);
          } else if (params.stockStatus === "out_of_stock") {
            list = list.filter((p) => p.stock === 0);
          }
        }

        if (params?.vendor) {
          list = list.filter((p) => p.shop_name.includes(params.vendor!));
        }

        if (params?.sortBy) {
          if (params.sortBy === "stock_asc") {
            list.sort((a, b) => a.stock - b.stock);
          } else if (params.sortBy === "stock_desc") {
            list.sort((a, b) => b.stock - a.stock);
          } else if (params.sortBy === "price_desc") {
            list.sort((a, b) => b.price - a.price);
          } else if (params.sortBy === "newest") {
            list.sort((a, b) => b.id - a.id);
          }
        }

        resolve({
          products: list,
          total: 124,
        });
      }, 120);
    });
  },

  toggleAdminProductStatus: async (productId: number): Promise<AdminProductItem> => {
    return new Promise((resolve, reject) => {
      const idx = adminProductsState.findIndex((p) => p.id === productId);
      if (idx !== -1) {
        const nextActive = !adminProductsState[idx].is_active;
        adminProductsState[idx] = {
          ...adminProductsState[idx],
          is_active: nextActive,
          status: nextActive ? "ACTIVE" : "INACTIVE",
        };
        resolve(adminProductsState[idx]);
      } else {
        reject(new Error("Product not found"));
      }
    });
  },

  deleteAdminProduct: async (productId: number): Promise<number> => {
    return new Promise((resolve) => {
      adminProductsState = adminProductsState.filter((p) => p.id !== productId);
      resolve(productId);
    });
  },

  bulkAdminAction: async (
    action: string,
    productIds: number[]
  ): Promise<{ action: string; count: number }> => {
    return new Promise((resolve) => {
      if (action === "activate") {
        adminProductsState = adminProductsState.map((p) =>
          productIds.includes(p.id)
            ? { ...p, is_active: true, status: "ACTIVE" }
            : p
        );
      } else if (action === "deactivate") {
        adminProductsState = adminProductsState.map((p) =>
          productIds.includes(p.id)
            ? { ...p, is_active: false, status: "INACTIVE" }
            : p
        );
      } else if (action === "delete") {
        adminProductsState = adminProductsState.filter(
          (p) => !productIds.includes(p.id)
        );
      }
      resolve({ action, count: productIds.length });
    });
  },
};

