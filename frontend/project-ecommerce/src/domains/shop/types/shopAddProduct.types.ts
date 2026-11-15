export interface AddProductVariantRow {
  id: string;
  color: string;
  size: string;
  colorHex?: string;
  sku: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock";
}

export interface AddProductColorItem {
  id: string;
  name: string;
  hex: string;
}

export interface AddProductDetailImage {
  id: string;
  url: string;
  tag: string;
}

export interface AddProductFormData {
  name: string;
  categoryId: number;
  categoryPath: string[];
  brand: string;
  brandId?: number | null;
  isBrandVerified: boolean;
  origin: string;
  description: string;
  coverImage: string;
  detailImages: AddProductDetailImage[];
  videoUrl?: string;
  hasVariants: boolean;
  colors: AddProductColorItem[];
  sizes: string[];
  variants: AddProductVariantRow[];
  // Simple / single SKU fields when hasVariants is false
  singleSku: string;
  singleCostPrice: number;
  singleSellPrice: number;
  singleStock: number;
  // Shipping info
  weightGram: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface AddProductCategoryOption {
  id: number;
  name: string;
  parentPath: string[];
  suggestedSizes: string[];
  suggestedColors: AddProductColorItem[];
}

