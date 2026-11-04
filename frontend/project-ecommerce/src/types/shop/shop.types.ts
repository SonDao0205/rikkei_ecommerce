
export interface ShopProfilePayload {
  name: string;
  description: string;
  logo_url?: string | null;
  banner_url?: string | null;
  phone: string;
  warehouse_address: string;
}

export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  warehouse_address: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  reject_reason: string | null;
  follower_count: number;
  badge?: 'OFFICIAL' | 'MALL' | 'ARTISAN';
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PublicShop {
  id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  follower_count: number;
  approved_at: string | null;
}

export interface ShopFollowState {
  following: boolean;
  follower_count: number;
}

export type ShopTier = "STANDARD" | "PREMIUM" | "MALL" | "OFFICIAL";

export type AdminShopStatus =
  | "all"
  | "active"
  | "pending"
  | "suspended"
  | "rejected"
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "REJECTED";

export interface AdminShopItem {
  id: number;
  code: string; // e.g. "#VN-8821"
  name: string;
  description?: string;
  logo_url: string | null;
  tier: ShopTier;
  category: string;
  category_icon?: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  location: string;
  sku_count: number;
  sku_label?: string; // e.g. "12 Draft SKUs", "86 SKUs", "24 SKUs (Frozen)"
  order_count: number;
  order_label?: string; // e.g. "0 orders (New Registration)", "1,420 orders"
  rating_avg: number;
  rating_count: number;
  commission_rate: number; // e.g. 5, 8, 12
  commission_tier_label: string; // e.g. "8% Tier", "12% Mall Tier", "5% Standard"
  available_balance: number;
  settlement_cycle: string; // e.g. "Bi-weekly", "Weekly", "Escrow: 4.800.000 ₫"
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  status_label: string;
  is_live: boolean;
  tax_id?: string;
  identity_card?: string;
  business_license_url?: string;
  reject_reason?: string | null;
  created_at: string;
}

export interface ShopMetricStats {
  totalShops?: number;
  activeShops?: number;
  activeRateText?: string;
  pendingKycCount?: number;
  pendingActionRequired?: number;
  suspendedCount?: number;
  suspendedNote?: string;
  totalGmvFormatted?: string;
  totalGmvChange?: string;
  statusCounts?: {
    all: number;
    active: number;
    pending: number;
    suspended: number;
  };
  totalActive?: number;
  activeGrowth?: string;
  pendingKyc?: number;
  suspended?: number;
  totalGmv?: number;
  formattedGmv?: string;
  gmvGrowth?: string;
}

export interface ShopFilterParams {
  search?: string;
  statusTab?: AdminShopStatus;
  category?: string;
  commissionTier?: string;
  rating?: string;
  page?: number;
  pageSize?: number;
}
