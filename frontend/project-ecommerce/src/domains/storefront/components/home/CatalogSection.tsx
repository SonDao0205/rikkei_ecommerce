import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/domains/storefront/components/home/ProductCard";
import type { ProductItem } from "@/shared/types";

interface CatalogSectionProps {
  products: ProductItem[];
  totalProducts: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onAddToCart?: (product: ProductItem) => void | Promise<void>;
  onLoadMore?: () => void;
  onSelectProduct?: (product: ProductItem) => void;
  onSelectShop?: (shopId: number) => void;
}

const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  totalProducts,
  sortBy,
  onSortChange,
  onAddToCart,
  onLoadMore,
  onSelectProduct,
  onSelectShop,
}) => {
  const { t } = useTranslation("customer");
  const [gridMode, setGridMode] = useState<"grid" | "list">("grid");

  const sortOptions = [
    "Relevance",
    "Best Selling",
    "Latest Arrivals",
    "Price: Low → High",
    "Price: High → Low",
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-margin-lg pb-space-xl" id="catalog">
      <div className="grid grid-cols-12 gap-gutter items-start">
        {/* Main Product Catalog Area */}
        <div className="col-span-12 flex flex-col gap-space-lg">
          {/* Sorting & Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md font-bold text-on-surface">{products.length}</span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {t("home.catalog.showing_count", { total: totalProducts })}
              </span>
              <span className="font-label-md text-label-md font-bold text-primary">
                {t("home.catalog.all_catalog")}
              </span>
            </div>

            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-1 text-body-sm font-body-sm text-on-surface-variant">
                <span>{t("home.catalog.sort_label")}</span>
                <div className="relative inline-block">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="appearance-none bg-surface-container-low pl-3 pr-8 py-1.5 rounded-lg font-label-md text-label-md text-on-surface font-semibold focus:outline-none cursor-pointer"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {t(`home.catalog.sort_options.${opt}`, { defaultValue: opt })}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-[16px] absolute right-2 top-2 pointer-events-none text-outline">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Grid Density Toggles */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-surface-container-low">
                <button
                  onClick={() => setGridMode("grid")}
                  aria-label="Grid view"
                  className={`p-1 rounded cursor-pointer ${
                    gridMode === "grid"
                      ? "bg-surface-container-lowest shadow-sm text-primary"
                      : "text-outline hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setGridMode("list")}
                  aria-label="List view"
                  className={`p-1 rounded cursor-pointer ${
                    gridMode === "list"
                      ? "bg-surface-container-lowest shadow-sm text-primary"
                      : "text-outline hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_agenda</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Catalog Grid */}
          <div
            className={`grid gap-gutter ${
              gridMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
            }`}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickAdd={onAddToCart}
                onClick={onSelectProduct}
                onShopClick={onSelectShop}
              />
            ))}
          </div>

          {products.length < totalProducts && onLoadMore && (
            <button
              onClick={onLoadMore}
              className="self-center px-space-lg py-2.5 rounded-lg bg-surface-container text-primary font-label-md font-bold cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              {t("home.catalog.load_more")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
