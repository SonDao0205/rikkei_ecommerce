/**
 * Admin Executive Dashboard Interfaces matching scriptDb.sql schema
 */
export type TimeRangeFilter = 'today' | '7d' | 'month' | 'ytd';
export type TrendMetricType = 'revenue' | 'volume';

export interface KpiCardRevenue {
  totalRevenue: number;
  formattedRevenue: string;
  changePercent: number;
  isPositive: boolean;
  comparisonLabel: string;
  targetRevenue: string;
  sparkline: number[];
}

export interface KpiCardOrders {
  totalOrders: number;
  codCount: number;
  codPercent: number;
  digitalCount: number;
  digitalPercent: number;
}

export interface KpiCardInventory {
  totalSkus: number;
  restockNeededCount: number;
  lowStockShops: { shopName: string; count: number }[];
}

export interface KpiCardCustomers {
  totalNew: number;
  changePercent: number;
  isPositive: boolean;
  comparisonLabel: string;
  mobilePercent: number;
  otpVerifiedCount: number;
  firstPurchaseCount: number;
}

export interface RevenueTrendItem {
  day: string;
  fullDate: string;
  codRevenue: number;
  digitalRevenue: number;
  totalRevenue: number;
  orderVolume: number;
  codHeight: number;
  digitalHeight: number;
  splineY: number;
  isToday?: boolean;
}

export interface CodSettlementItem {
  id: string;
  label: string;
  sublabel: string;
  count: number;
  amount: string;
  percentage: number;
  colorClass: string;
  dotColorClass: string;
  strokeDasharray: string;
  strokeDashoffset: string;
}

export interface OperationalAlertItem {
  id: string;
  type: 'shop_approval' | 'return_request' | 'inventory_warning' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  actionUrl?: string;
}

export interface MarketplaceActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  timeAgo: string;
  tag?: string;
  tagColor?: string;
}

export interface AdminDashboardData {
  kpis: {
    revenue: KpiCardRevenue;
    orders: KpiCardOrders;
    inventory: KpiCardInventory;
    customers: KpiCardCustomers;
  };
  revenueTrend: {
    weekLabel: string;
    points: RevenueTrendItem[];
    avgBasketValue: string;
    codVolumePercent: number;
    digitalVolumePercent: number;
  };
  codSettlement: {
    totalActiveBatch: number;
    slices: CodSettlementItem[];
    lastSynced: string;
  };
  operations: OperationalAlertItem[];
  activities: MarketplaceActivityItem[];
}
