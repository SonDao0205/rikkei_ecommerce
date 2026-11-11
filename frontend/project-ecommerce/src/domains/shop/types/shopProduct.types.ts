export type ShopProductStatusTab =
  | "all"
  | "active"
  | "low_stock"
  | "out_of_stock"
  | "pending"
  | "hidden";

export type ShopProductPriceRange = "all" | "under300" | "300-800" | "above800";

export type ShopProductStockFilter = "all" | "abundant" | "low" | "out";

export type ShopProductStockStatus =
  | "abundant"
  | "safe"
  | "low"
  | "critical"
  | "out";

export interface BackendSellerProductImage {
  url: string;
  is_primary: boolean;
}

export interface BackendSellerProductVariant {
  id?: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  attribute_value_ids: number[];
}

export interface BackendSellerProduct {
  id: number;
  shop_id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url?: string | null;
  price: number;
  status: string;
  images: BackendSellerProductImage[];
  variants: BackendSellerProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface BackendCategoryAttributeValue {
  id: number;
  value: string;
}

export interface BackendCategoryAttribute {
  id: number;
  name: string;
  required: boolean;
  values: BackendCategoryAttributeValue[];
}

export interface CreateSellerProductPayload {
  name: string;
  description?: string;
  category_id: number;
  brand_id?: number | null;
  price: number;
  video_url?: string | null;
  images: BackendSellerProductImage[];
  variants: Omit<BackendSellerProductVariant, "id">[];
}

export interface UpdateSellerProductPayload {
  name: string;
  description?: string;
  category_id: number;
  brand_id?: number | null;
  price: number;
  video_url?: string | null;
  images: BackendSellerProductImage[];
  variants: BackendSellerProductVariant[];
}

export interface ShopProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: number;
  categoryLabel: string;
  imageUrl: string;
  videoUrl?: string;
  imageAlt: string;
  soldCount: number;
  variationTitle: string;
  variationSubtitle: string;
  price: number;
  formattedPrice: string;
  costPrice?: number;
  formattedCostPrice?: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  priceNote?: string;
  stock: number;
  stockStatus: ShopProductStockStatus;
  stockStatusLabel: string;
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "PENDING" | "HIDDEN" | "DRAFT" | "REJECTED";
  rawVariants?: BackendSellerProductVariant[];
  rawImages?: BackendSellerProductImage[];
}

export interface ShopProductStats {
  totalInventoryValue: number;
  formattedInventoryValue: string;
  totalProductsCount: number;
  totalStockUnits: number;
  readinessRate: number;
  readinessChangeLabel: string;
  lowStockSkusCount: number;
  outOfStockSkusCount: number;
  activeSkusCount: number;
  statusTabCounts: {
    all: number;
    active: number;
    low_stock: number;
    out_of_stock: number;
    pending: number;
    hidden: number;
  };
}

export interface ShopProductFilterState {
  statusTab: ShopProductStatusTab;
  searchQuery: string;
  category: string;
  priceRange: ShopProductPriceRange;
  stockLevel: ShopProductStockFilter;
  currentPage: number;
  pageSize: number;
}

