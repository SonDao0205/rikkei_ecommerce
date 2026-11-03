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

export interface ShopProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryLabel: string;
  imageUrl: string;
  imageAlt: string;
  soldCount: number;
  variationTitle: string;
  variationSubtitle: string;
  price: number;
  formattedPrice: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  priceNote?: string;
  stock: number;
  stockStatus: ShopProductStockStatus;
  stockStatusLabel: string;
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "PENDING" | "HIDDEN";
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

