import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export type ShopTabKey = "all" | "new" | "bestseller" | "sale" | "reviews";
export type ShopSortKey = "popular" | "newest" | "sales" | "price_asc" | "price_desc";

interface ShopCatalogToolbarProps {
  totalCount: number;
  activeTab: ShopTabKey;
  onTabChange: (tab: ShopTabKey) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onSearchSubmit: () => void;
  sortKey: ShopSortKey;
  onSortChange: (sort: ShopSortKey) => void;
}

export const ShopCatalogToolbar: React.FC<ShopCatalogToolbarProps> = ({
  totalCount,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  sortKey,
  onSortChange,
}) => {
  const { t } = useTranslation("customer");
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  const getPriceLabel = () => {
    if (sortKey === "price_asc") return t("public_shop.toolbar.sort.price_asc");
    if (sortKey === "price_desc") return t("public_shop.toolbar.sort.price_desc");
    return t("public_shop.toolbar.sort.price_default");
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-lg pt-4">
      <div className="sticky top-20 z-20 flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-md border border-outline-variant/30">
        {/* Top Row: Catalog View Tabs */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange("all")}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              <span>{t("public_shop.toolbar.tabs.all")}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                  activeTab === "all"
                    ? "bg-white/20 text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("new")}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer ${
                activeTab === "new"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              {t("public_shop.toolbar.tabs.new")}
            </button>

            <button
              type="button"
              onClick={() => onTabChange("bestseller")}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer ${
                activeTab === "bestseller"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              {t("public_shop.toolbar.tabs.bestseller")}
            </button>

            <button
              type="button"
              onClick={() => onTabChange("sale")}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === "sale"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                bolt
              </span>
              <span>{t("public_shop.toolbar.tabs.sale")}</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("reviews")}
              className={`h-10 px-4 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              {t("public_shop.toolbar.tabs.reviews")}
            </button>
          </div>
        </div>

        {/* Bottom Row: In-store Search & Sort Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2 border-t border-outline-variant/30">
          {/* In-store search */}
          <div className="relative flex-1 max-w-md">
            <div className="relative flex items-center w-full h-10 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px] mr-2">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("public_shop.toolbar.search_placeholder")}
                className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    onSearchSubmit();
                  }}
                  className="text-outline hover:text-on-surface p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Sort Chips */}
          <div className="flex items-center gap-2 overflow-x-auto shrink-0 pb-1 lg:pb-0 scrollbar-none">
            <span className="font-label-md text-label-md text-outline shrink-0 mr-1">
              {t("home.catalog.sort_label", { defaultValue: "Sắp xếp theo:" })}
            </span>

            <button
              type="button"
              onClick={() => onSortChange("popular")}
              className={`h-8 px-3 rounded-lg font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
                sortKey === "popular"
                  ? "bg-primary-fixed text-primary font-bold shadow-xs"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              {t("public_shop.toolbar.sort.popular")}
            </button>

            <button
              type="button"
              onClick={() => onSortChange("newest")}
              className={`h-8 px-3 rounded-lg font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
                sortKey === "newest"
                  ? "bg-primary-fixed text-primary font-bold shadow-xs"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              {t("public_shop.toolbar.sort.newest")}
            </button>

            <button
              type="button"
              onClick={() => onSortChange("sales")}
              className={`h-8 px-3 rounded-lg font-label-sm text-label-sm font-semibold transition-all cursor-pointer ${
                sortKey === "sales"
                  ? "bg-primary-fixed text-primary font-bold shadow-xs"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              {t("public_shop.toolbar.sort.sales")}
            </button>

            {/* Dropdown Price Filter */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                className={`h-8 px-3 rounded-lg font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer ${
                  sortKey === "price_asc" || sortKey === "price_desc"
                    ? "bg-primary-fixed text-primary font-bold shadow-xs"
                    : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                }`}
              >
                <span>{getPriceLabel()}</span>
                <span className="material-symbols-outlined text-[16px]">
                  unfold_more
                </span>
              </button>

              {isPriceDropdownOpen && (
                <div className="absolute right-0 top-10 w-44 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/60 py-1.5 z-40 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange("price_asc");
                      setIsPriceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-surface-container flex items-center justify-between ${
                      sortKey === "price_asc" ? "text-primary font-bold" : "text-on-surface"
                    }`}
                  >
                    <span>{t("public_shop.toolbar.sort.price_asc")}</span>
                    {sortKey === "price_asc" && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange("price_desc");
                      setIsPriceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-surface-container flex items-center justify-between ${
                      sortKey === "price_desc" ? "text-primary font-bold" : "text-on-surface"
                    }`}
                  >
                    <span>{t("public_shop.toolbar.sort.price_desc")}</span>
                    {sortKey === "price_desc" && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCatalogToolbar;
