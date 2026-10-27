import React from "react";
import type { InventoryStats } from "../../types/ecommerce";

interface ProductStatsCardsProps {
  stats: InventoryStats | null;
}

const ProductStatsCards: React.FC<ProductStatsCardsProps> = ({ stats }) => {
  const defaultStats: InventoryStats = {
    totalSkus: 124,
    newThisMonth: 12,
    activeListings: 118,
    activePercentage: 95.1,
    lowStockCount: 4,
    outOfStockCount: 2,
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 py-6">
      {/* Card 1: Total SKUs */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Total Products
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {data.totalSkus} SKUs
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">
              +{data.newThisMonth} this month
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[26px]">inventory</span>
        </div>
      </div>

      {/* Card 2: Active Listings */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Active Listings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {data.activeListings} Live
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {data.activePercentage}% catalog
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
          <span className="material-symbols-outlined text-[26px]">check_circle</span>
        </div>
      </div>

      {/* Card 3: Low Stock Warning */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
        <div className="flex flex-col gap-1 pl-1">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Low Stock Alert
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-amber-700">
              {data.lowStockCount} SKUs
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-label-sm font-semibold">
              Restock Urgent
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
          <span className="material-symbols-outlined text-[26px]">warning</span>
        </div>
      </div>

      {/* Card 4: Out of Stock */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error" />
        <div className="flex flex-col gap-1 pl-1">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Out of Stock
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg font-bold text-error">
              {data.outOfStockCount} SKUs
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
              Depleted
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-error">
          <span className="material-symbols-outlined text-[26px]">production_quantity_limits</span>
        </div>
      </div>
    </div>
  );
};

export default ProductStatsCards;
