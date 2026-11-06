import React, { useState } from "react";
import type { Category } from "@/shared/types";

interface ProductFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: string;
  vendorFilter: string;
  sortBy: string;
  selectedCount: number;
  categories?: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  onApplyBulkAction: (action: "activate" | "deactivate" | "delete" | "approve") => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  categoryFilter,
  stockStatusFilter,
  vendorFilter,
  sortBy,
  selectedCount,
  categories,
  onSearchChange,
  onCategoryChange,
  onStockStatusChange,
  onVendorChange,
  onSortChange,
  onClearFilters,
  onApplyBulkAction,
}) => {
  const [bulkAction, setBulkAction] = useState<
    "activate" | "deactivate" | "delete" | "approve" | ""
  >("");

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
            {categories && categories.length > 0
              ? categories
                  .filter((c) => c.id !== 0)
                  .map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
              : (
                <>
                  <option value="Thời trang">Thời trang</option>
                  <option value="Áo và phụ kiện">Áo và phụ kiện</option>
                  <option value="Nhà cửa và đời sống">Nhà cửa và đời sống</option>
                  <option value="Thực phẩm và đồ uống">Thực phẩm và đồ uống</option>
                  <option value="Điện thoại và phụ kiện">Điện thoại và phụ kiện</option>
                </>
              )}
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

          <input
            type="text"
            value={vendorFilter}
            onChange={(e) => onVendorChange(e.target.value)}
            placeholder="Filter Shop / Vendor..."
            className="h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container transition-all flex-1 min-w-[140px]"
          />

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
              onChange={(e) =>
                setBulkAction(
                  e.target.value as "activate" | "deactivate" | "delete" | "approve" | ""
                )
              }
              className="h-9 px-3 bg-surface-container text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
            >
              <option value="">Choose Bulk Action...</option>
              <option value="approve">Duyệt đã chọn (Approve)</option>
              <option value="activate">Activate Selected</option>
              <option value="deactivate">Deactivate Selected</option>
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Bộ lọc đang bật:</span>
          {!hasActiveFilters && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
              Tất cả kho hàng
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center gap-1">
              <span>Tìm: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:opacity-80 cursor-pointer"
                aria-label="Xóa từ khóa"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          {categoryFilter && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
              <span>{categoryFilter}</span>
              <button
                type="button"
                onClick={() => onCategoryChange("")}
                className="hover:text-error cursor-pointer"
                aria-label="Xóa danh mục"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          {stockStatusFilter && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
              <span>
                {stockStatusFilter === "in_stock"
                  ? "Còn hàng (>5)"
                  : stockStatusFilter === "low_stock"
                  ? "Sắp hết hàng (≤5)"
                  : "Hết hàng (0)"}
              </span>
              <button
                type="button"
                onClick={() => onStockStatusChange("")}
                className="hover:text-error cursor-pointer"
                aria-label="Xóa trạng thái tồn kho"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          {vendorFilter && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1">
              <span>Shop: {vendorFilter}</span>
              <button
                type="button"
                onClick={() => onVendorChange("")}
                className="hover:text-error cursor-pointer"
                aria-label="Xóa gian hàng"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}
          {sortBy !== "newest" && (
            <button
              type="button"
              onClick={() => onSortChange("newest")}
              className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Sort: {sortBy.replaceAll("_", " ")}</span>
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-primary hover:underline font-label-sm text-label-sm ml-2 cursor-pointer font-semibold"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
