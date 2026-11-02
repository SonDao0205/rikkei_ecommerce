import React from "react";
import type { ShopFilterParams } from "../../../types/ecommerce";

interface ShopFilterBarProps {
  filters: ShopFilterParams;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCommissionChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onClearFilters: () => void;
}

export const ShopFilterBar: React.FC<ShopFilterBarProps> = ({
  filters,
  onSearchChange,
  onCategoryChange,
  onCommissionChange,
  onRatingChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.category !== "all" ||
    filters.commissionTier !== "all" ||
    filters.rating !== "all";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 border border-outline-variant/30">
      {/* Search box */}
      <div className="relative flex-1 min-w-[280px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
          search
        </span>
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Shop Name, Owner Email, Phone, or Business Tax ID..."
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Dropdowns & Reset */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Category */}
        <select
          value={filters.category || "all"}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer border border-transparent hover:border-outline-variant"
        >
          <option value="all">Category (All Categories)</option>
          <option value="Artisan Craft">Artisan Craft</option>
          <option value="Footwear">Footwear</option>
          <option value="Ceramics & Heritage">Ceramics & Heritage</option>
          <option value="Electronics">Electronics</option>
          <option value="Apparel">Apparel</option>
        </select>

        {/* Commission */}
        <select
          value={filters.commissionTier || "all"}
          onChange={(e) => onCommissionChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer border border-transparent hover:border-outline-variant"
        >
          <option value="all">Commission (All Tiers)</option>
          <option value="STANDARD">Standard (5%)</option>
          <option value="PREMIUM">Premium (8%)</option>
          <option value="MALL">Mall (12%)</option>
        </select>

        {/* Rating */}
        <select
          value={filters.rating || "all"}
          onChange={(e) => onRatingChange(e.target.value)}
          className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer border border-transparent hover:border-outline-variant"
        >
          <option value="all">Rating (All Ratings)</option>
          <option value="4.5">4.5★ &amp; above</option>
          <option value="4.0">4.0★ to 4.4★</option>
          <option value="unrated">Unrated / New</option>
          <option value="low">Flagged / Low (&lt; 3.0★)</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-md font-label-md transition-colors"
            title="Reset filters"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopFilterBar;
