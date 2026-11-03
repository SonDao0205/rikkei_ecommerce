import React from "react";
import type { ShopProductStats } from "../../../types/shop/shopProduct.types";

interface ShopProductStatsCardsProps {
  stats: ShopProductStats;
  onFilterLowStock?: () => void;
  onFilterOutOfStock?: () => void;
}

export const ShopProductStatsCards: React.FC<ShopProductStatsCardsProps> = ({
  stats,
  onFilterLowStock,
  onFilterOutOfStock,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
      {/* Card 1: Tổng giá trị kho hàng */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Tổng giá trị kho hàng
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {stats.formattedInventoryValue}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">store</span>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 font-mono">
          {stats.totalProductsCount} sản phẩm / {stats.totalStockUnits} kiện tồn
        </p>
      </div>

      {/* Card 2: Tỷ lệ sẵn sàng mở bán */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Tỷ lệ sẵn sàng mở bán
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono tracking-tight">
                {stats.readinessRate}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                {stats.readinessChangeLabel}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
          </div>
        </div>
        <div className="w-full bg-surface-container rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            className="bg-secondary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.readinessRate}%` }}
          />
        </div>
      </div>

      {/* Card 3: Cảnh báo hết hàng (<5) */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Cảnh báo hết hàng (&lt;5)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg font-bold text-tertiary font-mono tracking-tight">
                {stats.lowStockSkusCount} SKUs
              </span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-mono">
                Ưu tiên
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Cần nhập xưởng gấp
          </p>
          {onFilterLowStock && (
            <button
              type="button"
              onClick={onFilterLowStock}
              className="font-label-sm text-label-sm font-semibold text-primary hover:underline cursor-pointer"
            >
              Lọc danh sách
            </button>
          )}
        </div>
      </div>

      {/* Card 4: Hết hàng / Tạm ngừng */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Hết hàng / Tạm ngừng
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono tracking-tight">
                {stats.outOfStockSkusCount} SKUs
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">block</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-outline">
            Đã ngắt luồng mua tự động
          </p>
          {onFilterOutOfStock && (
            <button
              type="button"
              onClick={onFilterOutOfStock}
              className="font-label-sm text-label-sm font-semibold text-primary hover:underline cursor-pointer"
            >
              Xem ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopProductStatsCards;

