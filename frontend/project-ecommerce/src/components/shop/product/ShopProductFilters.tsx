import React from "react";
import type {
  ShopProductStatusTab,
  ShopProductPriceRange,
  ShopProductStockFilter,
  ShopProductStats,
} from "../../../types/shop/shopProduct.types";

interface ShopProductFiltersProps {
  currentTab: ShopProductStatusTab;
  onTabChange: (tab: ShopProductStatusTab) => void;
  tabCounts: ShopProductStats["statusTabCounts"];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriceRange: ShopProductPriceRange;
  onPriceRangeChange: (priceRange: ShopProductPriceRange) => void;
  selectedStockLevel: ShopProductStockFilter;
  onStockLevelChange: (stockLevel: ShopProductStockFilter) => void;
  onResetFilters: () => void;
  selectedCount: number;
  onBulkDelete?: () => void;
}

export const ShopProductFilters: React.FC<ShopProductFiltersProps> = ({
  currentTab,
  onTabChange,
  tabCounts,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedStockLevel,
  onStockLevelChange,
  onResetFilters,
  selectedCount,
  onBulkDelete,
}) => {
  const tabs: { id: ShopProductStatusTab; label: string; count: number; dotColor?: string }[] = [
    { id: "all", label: "Tất cả", count: tabCounts.all },
    { id: "active", label: "Đang bán", count: tabCounts.active, dotColor: "bg-secondary" },
    { id: "low_stock", label: "Sắp hết hàng", count: tabCounts.low_stock, dotColor: "bg-tertiary" },
    { id: "out_of_stock", label: "Hết hàng", count: tabCounts.out_of_stock },
    { id: "pending", label: "Chờ duyệt", count: tabCounts.pending },
    { id: "hidden", label: "Đã ẩn", count: tabCounts.hidden },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 flex flex-col mt-6">
      {/* Status Tabs Header */}
      <div className="flex items-center overflow-x-auto px-4 pt-2 gap-2 border-b border-outline-variant/30 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-3 font-label-md text-label-md flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              {tab.dotColor && <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />}
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                  isActive
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 bg-surface-container-low/40 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Search & Select Matrix */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm theo tên sản phẩm, mã SKU, Barcode xưởng gốm..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline shadow-sm border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                aria-label="Xoá tìm kiếm"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Category Select */}
          <div className="relative min-w-[190px]">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none px-3.5 py-2 pr-9 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Ngành hàng: Tất cả</option>
              <option value="art">Gốm nghệ thuật &amp; Hỏa biến</option>
              <option value="tea">Trà cụ &amp; Ấm chén Tử Sa</option>
              <option value="dining">Phụ kiện bàn ăn Ceramic</option>
              <option value="lighting">Đèn trang trí &amp; Tinh dầu</option>
              <option value="vases">Lọ hoa Wabi Sabi</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              arrow_drop_down
            </span>
          </div>

          {/* Price Range Select */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedPriceRange}
              onChange={(e) => onPriceRangeChange(e.target.value as ShopProductPriceRange)}
              className="w-full appearance-none px-3.5 py-2 pr-9 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Mức giá: Tất cả</option>
              <option value="under300">&lt; 300.000 ₫</option>
              <option value="300-800">300.000 - 800.000 ₫</option>
              <option value="above800">&gt; 800.000 ₫</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              arrow_drop_down
            </span>
          </div>

          {/* Stock Level Select */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedStockLevel}
              onChange={(e) => onStockLevelChange(e.target.value as ShopProductStockFilter)}
              className="w-full appearance-none px-3.5 py-2 pr-9 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Tồn kho: Tất cả</option>
              <option value="abundant">Còn hàng dồi dào (&gt;20)</option>
              <option value="low">Sắp hết hàng (1 - 5)</option>
              <option value="out">Hết hàng (0)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              arrow_drop_down
            </span>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={onResetFilters}
            className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
          </button>
        </div>

        {/* Bulk Action Controls */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 pt-2 xl:pt-0 shrink-0">
            <span className="font-label-sm text-label-sm font-semibold text-primary font-mono">
              Đã chọn {selectedCount} mục
            </span>
            {onBulkDelete && (
              <button
                type="button"
                onClick={onBulkDelete}
                className="px-3.5 py-2 rounded-xl bg-error/10 hover:bg-error/20 text-error font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Xoá mục đã chọn</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProductFilters;

