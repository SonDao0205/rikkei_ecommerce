import React, { useState } from "react";
import type {
  ShopChartMetricTab,
  ShopSalesTrendPoint,
  ShopSalesTrendSummary,
} from "@/domains/shop/types/shopDashboard.types";

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
  const [hoveredIndex, setHoveredIndex] = useState<number>(5); // Default to Saturday peak

  const activePoint = salesTrend[hoveredIndex] || salesTrend[salesTrend.length - 1];

  // Grid labels
  const gridLines =
    activeTab === "revenue"
      ? ["30M ₫", "24M ₫", "18M ₫", "12M ₫", "6M ₫", "0 ₫"]
      : ["50 SP", "40 SP", "30 SP", "20 SP", "10 SP", "0 SP"];

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between">
      <div>
        {/* Header & Tabs matching RevenueTrendChart */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                Biểu đồ xu hướng bán hàng
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary-fixed text-on-primary-fixed-variant">
                7 Ngày qua
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Hiệu suất luân chuyển doanh số và sản lượng tiêu thụ thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 rounded-lg bg-surface-container text-label-sm font-label-sm">
              <button
                type="button"
                onClick={() => onTabChange("revenue")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "revenue"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Doanh thu (₫)
              </button>
              <button
                type="button"
                onClick={() => onTabChange("volume")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "volume"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Sản lượng (SP)
              </button>
            </div>
          </div>
        </div>

        {/* Highlight Peak Floating Tag */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Điểm nổi bật:
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md font-mono">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              {activePoint.dayLabel}: {activeTab === "revenue" ? activePoint.formattedRevenue : `${activePoint.volume} SP`}
              {activePoint.peakNote ? ` (${activePoint.peakNote})` : ""}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline font-mono">
            Đỉnh ca: Thứ 7 (20:00 - 22:30)
          </span>
        </div>

        {/* SVG Chart Workspace */}
        <div className="relative mt-4 h-64 w-full select-none">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {gridLines.map((label, idx) => (
              <div
                key={label}
                className={`w-full flex items-center justify-between text-label-sm font-label-sm text-outline font-mono ${
                  idx === gridLines.length - 1 ? "border-b border-outline-variant/40" : ""
                }`}
              >
                <div className="w-full border-b border-dashed border-outline-variant/20" />
                <span className="pl-3 shrink-0 text-[11px] text-outline-variant">{label}</span>
              </div>
            ))}
          </div>

          {/* SVG Vector Canvas */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="salesGradAdmin" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4338ca" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <polygon
              fill="url(#salesGradAdmin)"
              points="50,190 50,130 150,110 250,140 350,85 450,70 550,20 650,60 650,190"
            />

            {/* Smooth Trend Line */}
            <polyline
              fill="none"
              points="50,130 150,110 250,140 350,85 450,70 550,20 650,60"
              stroke="#2a14b4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />

            {/* Interactive Points */}
            {[
              { x: 50, y: 130, idx: 0 },
              { x: 150, y: 110, idx: 1 },
              { x: 250, y: 140, idx: 2 },
              { x: 350, y: 85, idx: 3 },
              { x: 450, y: 70, idx: 4 },
              { x: 550, y: 20, idx: 5 },
              { x: 650, y: 60, idx: 6 },
            ].map((pt) => {
              const isHovered = hoveredIndex === pt.idx;
              return (
                <g key={pt.idx} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(pt.idx)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    className={`transition-all ${
                      isHovered
                        ? "fill-primary stroke-surface-container-lowest stroke-2 shadow-lg"
                        : "fill-surface-container-lowest stroke-primary stroke-2"
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Day Labels below chart */}
        <div className="grid grid-cols-7 text-center font-label-md text-label-md text-on-surface-variant pt-2 border-t border-outline-variant/20 font-mono">
          {salesTrend.map((pt, idx) => (
            <button
              key={pt.dayLabel}
              type="button"
              onClick={() => setHoveredIndex(idx)}
              className={`transition-colors cursor-pointer py-1 ${
                hoveredIndex === idx ? "text-primary font-bold" : "hover:text-on-surface"
              }`}
            >
              {pt.dayLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Footer Under Chart matching Admin Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-outline-variant/30">
        <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">calendar_view_week</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Doanh thu trung bình ngày
            </p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface font-mono mt-0.5">
              {summary.formattedAvgRevenue}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Giá trị trung bình đơn (AOV)
            </p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface font-mono mt-0.5">
              {summary.formattedAov}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSalesChart;
