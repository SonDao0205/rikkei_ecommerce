import React, { useState } from "react";

interface ProductFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: string;
  vendorFilter: string;
  sortBy: string;
  selectedCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  onApplyBulkAction: (action: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  categoryFilter,
  stockStatusFilter,
  vendorFilter,
  sortBy,
  selectedCount,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange,
  onVendorChange,
  onSortChange,
  onClearFilters,
  onApplyBulkAction,
}) => {
  const [bulkAction, setBulkAction] = useState("");

  const handleApplyBulk = () => {
    if (!bulkAction) {
      alert("Please choose a bulk action first.");
      return;
    }
    if (selectedCount === 0) {
      alert("Please select at least one product row to apply bulk actions.");
      return;
    }
    onApplyBulkAction(bulkAction);
    setBulkAction("");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(categoryFilter) ||
    Boolean(stockStatusFilter) ||
    Boolean(vendorFilter) ||
    sortBy !== "newest";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm mb-5 flex flex-col gap-4">
      {/* Search & Filter Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="productSearchInput"
            placeholder="Search by product name, SKU, or shop..."
            className="w-full h-11 pl-11 pr-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="lg:col-span-8 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer flex-1"
          >
            <option value="">All Categories</option>
            <option value="Footwear">Footwear</option>
            <option value="Fashion & Apparel">Apparel & Textiles</option>
            <option value="Accessories">Accessories</option>
            <option value="Artisan Craft">Artisan Crafts</option>
            <option value="Home & Living">Home & Living</option>
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => onStockStatusChange(e.target.value)}
            className="h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer flex-1"
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock (&gt;5)</option>
            <option value="low_stock">Low Stock (≤5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          <select
            value={vendorFilter}
            onChange={(e) => onVendorChange(e.target.value)}
            className="h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer flex-1"
          >
            <option value="">All Vendors</option>
            <option value="UrbanStep">UrbanStep</option>
            <option value="Crafted Saigon">Crafted Saigon</option>
            <option value="Terra Living Lab">Terra Living Lab</option>
            <option value="Vietnam Silk Co.">Vietnam Silk Co.</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container transition-all cursor-pointer flex-1"
          >
            <option value="newest">Newest First</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Selection & Bulk Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Bulk Controls:
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="h-9 px-3 bg-surface-container text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
            >
              <option value="">Choose Bulk Action...</option>
              <option value="deactivate">Deactivate Selected</option>
              <option value="activate">Activate Selected</option>
              <option value="category">Assign Category</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              type="button"
              onClick={handleApplyBulk}
              className="h-9 px-4 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-lg transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>

          {selectedCount > 0 && (
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {selectedCount} SKU{selectedCount > 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        {/* Active Filters Display */}
        <div className="flex items-center gap-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing active filters:</span>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
            All Warehouses
            <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error">
              close
            </span>
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-primary hover:underline font-label-sm text-label-sm ml-2 cursor-pointer font-semibold"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
