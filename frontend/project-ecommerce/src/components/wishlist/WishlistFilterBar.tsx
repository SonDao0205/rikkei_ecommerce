import React from "react";
import type {
  WishlistFilterType,
  WishlistSortType,
} from "../../types/wishlist/wishlist.types";

export interface WishlistFilterBarProps {
  activeFilter: WishlistFilterType;
  counts: {
    all: number;
    sale: number;
    inStock: number;
    outOfStock: number;
  };
  onFilterChange: (filter: WishlistFilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: WishlistSortType;
  onSortChange: (sort: WishlistSortType) => void;
}

export const WishlistFilterBar: React.FC<WishlistFilterBarProps> = ({
  activeFilter,
  counts,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="p-2 sm:p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border border-outline-variant/60">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
            activeFilter === "all"
              ? "bg-primary-container text-on-primary shadow-sm"
              : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
        >
          <span>Tất cả</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === "all"
                ? "bg-white/20 text-white"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange("sale")}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
            activeFilter === "sale"
              ? "bg-primary-container text-on-primary shadow-sm"
              : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-tertiary">
            local_fire_department
          </span>
          <span>Đang giảm giá</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === "sale"
                ? "bg-white/20 text-white"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            {counts.sale}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange("in-stock")}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
            activeFilter === "in-stock"
              ? "bg-primary-container text-on-primary shadow-sm"
              : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Còn hàng</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === "in-stock"
                ? "bg-white/20 text-white"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            {counts.inStock}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange("out-of-stock")}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
            activeFilter === "out-of-stock"
              ? "bg-primary-container text-on-primary shadow-sm"
              : "bg-surface-container-low text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-outline"></span>
          <span>Tạm hết</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === "out-of-stock"
                ? "bg-white/20 text-white"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            {counts.outOfStock}
          </span>
        </button>
      </div>

      {/* Search Filter + Sort Dropdown */}
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
        <div className="relative flex items-center w-full sm:w-60 h-10 rounded-lg bg-surface-container-low focus-within:bg-surface-container-lowest border border-outline-variant/60 focus-within:border-primary transition-all">
          <span className="material-symbols-outlined text-outline pl-3 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm trong mục yêu thích..."
            className="w-full bg-transparent pl-2 pr-3 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="pr-2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>

        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as WishlistSortType)}
            className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface text-xs sm:text-sm font-bold appearance-none focus:outline-none cursor-pointer w-full hover:bg-surface-container transition-colors border border-outline-variant/60"
          >
            <option value="recent">Sắp xếp: Mới thêm gần đây</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="discount">Mức giảm giá nhiều nhất</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-[18px] text-outline">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
};

export default WishlistFilterBar;

