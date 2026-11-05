export type ShopDateFilter = "today" | "yesterday" | "7days" | "this_month";

export type ShopChartMetricTab = "revenue" | "volume";

export interface ShopOperationalInfo {
  shopName: string;
  category: string;
  shopCode: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  statusText: string;
  tierLevel: string;
  tierBadge: string;
  operationalRate: number;
  operationalStatusText: string;
  lastSyncTime: string;
}

export type UrgentActionBadgeType = "warning" | "info" | "error" | "neutral";

export interface ShopUrgentActionItem {
  id: string;
  title: string;
  badgeText: string;
  badgeType: UrgentActionBadgeType;
  count: number;
  countUnit: string;
  description: string;
  actionLabel: string;
  actionIcon?: string;
  actionPath: string;
}

export interface ShopKpiMetrics {
  todayRevenue: number;
  formattedRevenue: string;
  revenueChangePercent: number;
  isRevenuePositive: boolean;
  revenueChangeLabel: string;
  todayOrders: number;
  codOrdersCount: number;
  codOrdersPercent: number;
  digitalOrdersCount: number;
  digitalOrdersPercent: number;
  conversionRate: number;
  conversionChangePercent: number;
  conversionChangeLabel: string;
  walletBalance: number;
  formattedWalletBalance: string;
  pendingSettlement: number;
  formattedPendingSettlement: string;
}

export interface ShopSalesTrendPoint {
  dayLabel: string;
  dateStr: string;
  revenue: number;
  formattedRevenue: string;
  volume: number;
  isPeakDay?: boolean;
  peakNote?: string;
}

export interface ShopSalesTrendSummary {
  averageDailyRevenue: number;
  formattedAvgRevenue: string;
  averageOrderValue: number;
  formattedAov: string;
}

export interface ShopBestSellerProduct {
  id: number;
  rank: number;
  name: string;
  imageUrl: string;
  imageAlt: string;
  soldCount: number;
  stockQuantity: number;
  isLowStock?: boolean;
  stockWarning?: string;
}

export type OrderPaymentBadgeType = "cod" | "paid" | "online";
export type OrderStatusBadgeType = "warning" | "info" | "success" | "neutral";

export interface ShopUrgentOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  productSummary: string;
  productVariant: string;
  totalAmount: number;
  formattedTotalAmount: string;
  paymentMethod: string;
  paymentBadgeType: OrderPaymentBadgeType;
  status:
    | "PENDING_CONFIRMATION"
    | "PACKING"
    | "HANDED_OVER"
    | "DELIVERING"
    | "COMPLETED"
    | "CANCELLED";
  statusLabel: string;
  statusBadgeType: OrderStatusBadgeType;
  actionType: "confirm" | "print" | "track";
  actionLabel: string;
}

export interface ShopDashboardData {
  shopInfo: ShopOperationalInfo;
  urgentActions: ShopUrgentActionItem[];
  kpiMetrics: ShopKpiMetrics;
  salesTrend: {
    points: ShopSalesTrendPoint[];
    summary: ShopSalesTrendSummary;
  };
  bestSellers: ShopBestSellerProduct[];
  urgentOrders: ShopUrgentOrder[];
}

