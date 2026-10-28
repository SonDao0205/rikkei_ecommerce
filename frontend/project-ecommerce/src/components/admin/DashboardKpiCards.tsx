import React from "react";
import type {
  KpiCardRevenue,
  KpiCardOrders,
  KpiCardInventory,
  KpiCardCustomers,
} from "../../types/ecommerce";

interface DashboardKpiCardsProps {
  revenue: KpiCardRevenue;
  orders: KpiCardOrders;
  inventory: KpiCardInventory;
  customers: KpiCardCustomers;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  revenue,
  orders,
  inventory,
  customers,
}) => {
  // Generate sparkline path coordinates from data
  const renderSparkline = (data: number[]) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 280;
    const height = 36;
    const padding = 2;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const d = `M${points.join(" L")}`;
    const firstPoint = points[0].split(",");
    const lastPoint = points[points.length - 1].split(",");
    const areaD = `${d} L${lastPoint[0]},${height} L${firstPoint[0]},${height} Z`;

    return (
      <svg
        className="w-full h-9 overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sparklineGrad)" />
        <path d={d} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="3"
          fill="#059669"
          className="animate-pulse"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
      {/* Card 1: Revenue */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Revenue / GMV
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {revenue.formattedRevenue}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            {revenue.isPositive ? `+${revenue.changePercent}%` : `${revenue.changePercent}%`}{" "}
            {revenue.comparisonLabel}
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            Target: {revenue.targetRevenue}
          </span>
        </div>

        {/* Micro Sparkline Graph */}
        <div className="mt-3 w-full h-9 overflow-hidden">
          {renderSparkline(revenue.sparkline)}
        </div>
      </div>

      {/* Card 2: Orders */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Today's Orders
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {orders.totalOrders} Orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-label-sm font-label-sm mb-1.5">
            <span className="font-medium text-on-surface-variant">Payment Method Share</span>
            <span className="font-mono font-semibold text-secondary">
              {orders.codPercent}% COD
            </span>
          </div>
          {/* Segmented bar */}
          <div className="w-full h-2.5 rounded-full bg-surface-container flex overflow-hidden">
            <div
              className="h-full bg-secondary-container"
              style={{ width: `${orders.codPercent}%` }}
              title={`${orders.codCount} COD Orders`}
            />
            <div
              className="h-full bg-primary"
              style={{ width: `${orders.digitalPercent}%` }}
              title={`${orders.digitalCount} Digital MoMo/Card Orders`}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-label-sm font-label-sm">
          <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/50 text-on-secondary-fixed-variant font-mono font-medium">
            {orders.codCount} COD
          </span>
          <span className="text-outline">•</span>
          <span className="px-2 py-0.5 rounded-md bg-primary-fixed/60 text-on-primary-fixed-variant font-mono font-medium">
            {orders.digitalCount} Digital Payments
          </span>
        </div>
      </div>

      {/* Card 3: Inventory Alerts */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Active Inventory
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {inventory.totalSkus} SKUs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping shrink-0" />
            <span>{inventory.restockNeededCount} SKUs Restock Needed</span>
          </div>
        </div>

        <div className="mt-3 text-body-sm font-body-sm text-on-surface-variant truncate">
          {inventory.lowStockShops.map((shop, idx) => (
            <React.Fragment key={shop.shopName}>
              <span className="font-medium text-tertiary font-mono">{shop.shopName}</span> (
              {shop.count})
              {idx < inventory.lowStockShops.length - 1 ? ", " : " low stock"}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Card 4: New Users */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              New Customer Signups
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {customers.totalNew} Customers
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">group_add</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +{customers.changePercent}% {customers.comparisonLabel}
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            {customers.mobilePercent}% Mobile
          </span>
        </div>

        <div className="mt-3 text-body-sm font-body-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface font-mono">
            {customers.otpVerifiedCount}
          </span>{" "}
          OTP verified,{" "}
          <span className="font-semibold text-on-surface font-mono">
            {customers.firstPurchaseCount}
          </span>{" "}
          1st purchase completed
        </div>
      </div>
    </div>
  );
};

export default DashboardKpiCards;
