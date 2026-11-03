import React from "react";
import type {
  ShopChartMetricTab,
  ShopSalesTrendPoint,
  ShopSalesTrendSummary,
} from "../../../types/shop/shopDashboard.types";

interface ShopSalesChartProps {
  salesTrend: ShopSalesTrendPoint[];
  summary: ShopSalesTrendSummary;
  activeTab: ShopChartMetricTab;
  onTabChange: (tab: ShopChartMetricTab) => void;
}

export const ShopSalesChart: React.FC<ShopSalesChartProps> = ({
  salesTrend,
  summary,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-lg">
      {/* Header & Metric Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Biểu đồ xu hướng bán hàng
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Hiệu suất luân chuyển doanh số 7 ngày gần nhất
          </p>
        </div>
        <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onTabChange("revenue")}
            className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
              activeTab === "revenue"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Doanh thu (₫)
          </button>
          <button
            type="button"
            onClick={() => onTabChange("volume")}
            className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
              activeTab === "volume"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Số lượng đã bán (SP)
          </button>
        </div>
      </div>

      {/* High-Fidelity SVG Chart Canvas */}
      <div className="relative pt-space-md">
        {/* Flash Sale Peak Highlight Tag */}
        <div className="absolute right-[18%] sm:right-[22%] top-0 flex items-center gap-1.5 bg-primary text-on-primary px-2.5 py-1 rounded-full shadow-md z-10 font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>
            {activeTab === "revenue" ? "Thứ 7: 26.500.000 ₫ (Flash Sale)" : "Thứ 7: 48 SP (Flash Sale)"}
          </span>
        </div>

        <div className="w-full h-64 flex flex-col justify-between">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 700 200"
          >
            <defs>
              <linearGradient id="salesGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4338ca" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1="0"
              x2="700"
              y1="40"
              y2="40"
            />
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1="0"
              x2="700"
              y1="90"
              y2="90"
            />
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth="1"
              x1="0"
              x2="700"
              y1="140"
              y2="140"
            />
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeWidth="1"
              x1="0"
              x2="700"
              y1="190"
              y2="190"
            />

            {/* Area Fill */}
            <polygon
              fill="url(#salesGrad)"
              points="50,190 50,130 150,110 250,140 350,85 450,70 550,20 650,60 650,190"
            />

            {/* Trend Line */}
            <polyline
              fill="none"
              points="50,130 150,110 250,140 350,85 450,70 550,20 650,60"
              stroke="#2a14b4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />

            {/* Point Markers */}
            <circle
              className="fill-surface-container-lowest stroke-primary stroke-2"
              cx="50"
              cy="130"
              r="4"
            />
            <circle
              className="fill-surface-container-lowest stroke-primary stroke-2"
              cx="150"
              cy="110"
              r="4"
            />
            <circle
              className="fill-surface-container-lowest stroke-primary stroke-2"
              cx="250"
              cy="140"
              r="4"
            />
            <circle
              className="fill-surface-container-lowest stroke-primary stroke-2"
              cx="350"
              cy="85"
              r="4"
            />
            <circle
              className="fill-surface-container-lowest stroke-primary stroke-2"
              cx="450"
              cy="70"
              r="4"
            />
            {/* Peak Saturday highlighted circle */}
            <circle
              className="fill-primary stroke-surface-container-lowest stroke-2 shadow-lg"
              cx="550"
              cy="20"
              r="6"
            />
            <circle
              className="fill-surface-container-lowest stroke-primary stroke-2"
              cx="650"
              cy="60"
              r="4"
            />
          </svg>

          {/* Day Labels */}
          <div className="grid grid-cols-7 text-center font-label-md text-label-md text-on-surface-variant pt-space-xs">
            {salesTrend.map((pt) => (
              <span
                key={pt.dayLabel}
                className={pt.isPeakDay ? "text-primary font-bold" : ""}
              >
                {pt.dayLabel}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Footer Under Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-md border-t border-outline-variant/30">
        <div className="flex items-center gap-space-md bg-surface-container-low p-space-md rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">calendar_view_week</span>
          </div>
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Doanh thu trung bình ngày
            </p>
            <p className="font-headline-md text-headline-md text-on-surface">
              {summary.formattedAvgRevenue}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-md bg-surface-container-low p-space-md rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Giá trị trung bình đơn (AOV)
            </p>
            <p className="font-headline-md text-headline-md text-on-surface">
              {summary.formattedAov}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShopSalesChart;
