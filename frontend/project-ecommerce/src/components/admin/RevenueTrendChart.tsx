import React, { useState } from "react";
import type {
  RevenueTrendItem,
  TrendMetricType,
} from "../../types/ecommerce";

interface RevenueTrendChartProps {
  weekLabel: string;
  points: RevenueTrendItem[];
  avgBasketValue: string;
  codVolumePercent: number;
  digitalVolumePercent: number;
  metricType: TrendMetricType;
  onMetricTypeChange: (metric: TrendMetricType) => void;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  weekLabel,
  points,
  avgBasketValue,
  codVolumePercent,
  digitalVolumePercent,
  metricType,
  onMetricTypeChange,
}) => {
  // Default to today (Sunday) or the last point
  const defaultHoverIndex = points.findIndex((p) => p.isToday) >= 0
    ? points.findIndex((p) => p.isToday)
    : points.length - 1;
  const [hoveredIndex, setHoveredIndex] = useState<number>(defaultHoverIndex);

  const activePoint = points[hoveredIndex] || points[points.length - 1];

  // Calculate coordinates for spline curve
  const pathD = React.useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((acc, curr, idx) => {
      const x = 35 + idx * 100 + 14;
      const y = metricType === "revenue" ? curr.splineY : Math.max(30, 240 - curr.orderVolume * 5);
      if (idx === 0) return `M${x},${y}`;
      const prevX = 35 + (idx - 1) * 100 + 14;
      const prevPoint = points[idx - 1];
      const prevY = metricType === "revenue" ? prevPoint.splineY : Math.max(30, 240 - prevPoint.orderVolume * 5);
      const cp1X = prevX + 50;
      const cp1Y = prevY;
      const cp2X = x - 50;
      const cp2Y = y;
      return `${acc} C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${x},${y}`;
    }, "");
  }, [points, metricType]);

  const areaD = React.useMemo(() => {
    if (!pathD || points.length < 2) return "";
    const firstX = 35 + 14;
    const lastX = 35 + (points.length - 1) * 100 + 14;
    return `${pathD} L${lastX},240 L${firstX},240 Z`;
  }, [pathD, points]);

  // Grid line labels depending on metric
  const gridLines =
    metricType === "revenue"
      ? ["50M ₫", "40M ₫", "30M ₫", "20M ₫", "10M ₫", "0 ₫"]
      : ["50 Orders", "40 Orders", "30 Orders", "20 Orders", "10 Orders", "0 Orders"];

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                Revenue &amp; Order Trends
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary-fixed text-on-primary-fixed-variant">
                {weekLabel}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Daily breakdown between Cash-on-Delivery collections and Digital Payment checkout
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 rounded-lg bg-surface-container text-label-sm font-label-sm">
              <button
                type="button"
                onClick={() => onMetricTypeChange("revenue")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  metricType === "revenue"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Gross Revenue
              </button>
              <button
                type="button"
                onClick={() => onMetricTypeChange("volume")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  metricType === "volume"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Order Volume
              </button>
            </div>
          </div>
        </div>

        {/* SVG Chart Workspace */}
        <div className="relative mt-6 h-72 w-full select-none">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {gridLines.map((label, idx) => (
              <div
                key={label}
                className={`w-full flex items-center justify-between text-label-sm font-label-sm text-outline font-mono ${
                  idx === gridLines.length - 1
                    ? "border-b border-outline-variant/50"
                    : "border-b border-dashed border-outline-variant/30"
                }`}
              >
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* SVG Graphic & Stacked Columns */}
          <div className="absolute inset-0 pl-14 pr-4 pt-2 pb-6">
            <svg
              className="w-full h-full overflow-visible"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 700 240"
            >
              <defs>
                <linearGradient id="areaGlow" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity="0.3" />
                  <stop offset="80%" stopColor="#4338ca" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Stacked Bar Graphics for Days */}
              {points.map((p, idx) => {
                const x = 35 + idx * 100;
                const isHovered = hoveredIndex === idx;

                // Heights based on metric
                const codH =
                  metricType === "revenue"
                    ? p.codHeight
                    : Math.max(10, Math.round((p.orderVolume * 0.89) * 4));
                const digH =
                  metricType === "revenue"
                    ? p.digitalHeight
                    : Math.max(4, Math.round((p.orderVolume * 0.11) * 4));

                const codY = 240 - codH;
                const digY = codY - digH;

                return (
                  <g
                    key={p.day}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredIndex(idx)}
                  >
                    {/* COD Bar */}
                    <rect
                      x={x}
                      y={codY}
                      width={28}
                      height={codH}
                      rx={4}
                      fill="#5bb8fe"
                      opacity={isHovered ? 1 : 0.85}
                    />
                    {/* Digital Payment Bar */}
                    <rect
                      x={x}
                      y={digY}
                      width={28}
                      height={digH}
                      rx={3}
                      fill="#4338ca"
                      opacity={isHovered ? 1 : 0.9}
                    />
                  </g>
                );
              })}

              {/* Area Fill Under Spline */}
              {areaD && <path d={areaD} fill="url(#areaGlow)" />}

              {/* Smooth Curve Line Layer */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#2a14b4"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Glowing Active Data Point */}
              {activePoint && (
                <>
                  <circle
                    cx={35 + hoveredIndex * 100 + 14}
                    cy={
                      metricType === "revenue"
                        ? activePoint.splineY
                        : Math.max(30, 240 - activePoint.orderVolume * 5)
                    }
                    r="7"
                    fill="#4338ca"
                    className="animate-pulse"
                  />
                  <circle
                    cx={35 + hoveredIndex * 100 + 14}
                    cy={
                      metricType === "revenue"
                        ? activePoint.splineY
                        : Math.max(30, 240 - activePoint.orderVolume * 5)
                    }
                    r="3.5"
                    fill="#ffffff"
                  />
                </>
              )}
            </svg>

            {/* Floating Interactive Tooltip Hover Card */}
            {activePoint && (
              <div
                className="absolute top-0 -translate-y-4 bg-inverse-surface text-inverse-on-surface px-3 py-2.5 rounded-xl shadow-xl flex flex-col gap-0.5 z-20 pointer-events-none border border-surface-variant/20 transition-all duration-150"
                style={{
                  left: `${Math.min(
                    85,
                    Math.max(12, ((35 + hoveredIndex * 100 + 14) / 700) * 100)
                  )}%`,
                  transform:
                    hoveredIndex >= points.length - 2
                      ? "translate(-95%, -16px)"
                      : "translate(-20%, -16px)",
                }}
              >
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-surface-variant/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">{activePoint.fullDate}</span>
                </div>
                <span className="font-label-lg text-label-lg font-mono font-bold text-white tracking-tight">
                  {metricType === "revenue"
                    ? `${(activePoint.totalRevenue / 1000).toLocaleString("vi-VN")} ₫`
                    : `${activePoint.orderVolume} Orders`}
                </span>
                <span className="font-body-sm text-[11px] text-surface-variant/70">
                  {activePoint.orderVolume} Orders:{" "}
                  {Math.round(activePoint.orderVolume * 0.89)} COD /{" "}
                  {Math.max(1, Math.round(activePoint.orderVolume * 0.11))} MoMo
                </span>
              </div>
            )}
          </div>

          {/* X-Axis Labels */}
          <div className="absolute bottom-0 left-14 right-4 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant font-medium pt-2">
            {points.map((p, idx) => (
              <button
                key={p.day}
                type="button"
                onClick={() => setHoveredIndex(idx)}
                className={`w-10 text-center cursor-pointer transition-colors ${
                  p.isToday || hoveredIndex === idx
                    ? "font-bold text-primary font-mono"
                    : "hover:text-on-surface"
                }`}
              >
                {p.isToday ? `${p.day} (Today)` : p.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Footer Legend & Aggregate Stats */}
      <div className="mt-8 pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-label-sm font-label-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-secondary-container" />
            <span className="text-on-surface font-medium">
              COD Cash Volume ({codVolumePercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-primary-container" />
            <span className="text-on-surface font-medium">
              Digital MoMo / Cards ({digitalVolumePercent}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-label-sm font-label-sm text-on-surface-variant">
          <span>Avg. Basket Value:</span>
          <span className="font-mono font-bold text-on-surface px-2 py-0.5 rounded bg-surface-container">
            {avgBasketValue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
