import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "@/domains/storefront/components/home/ProductCard";
import type { ProductItem } from "@/shared/types";

interface FlashSaleSectionProps {
  products: ProductItem[];
  categoryName?: string;
  loading?: boolean;
  onQuickAdd?: (product: ProductItem) => void | Promise<void>;
  onSelectProduct?: (product: ProductItem) => void;
  onSelectShop?: (shopId: number) => void;
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products,
  categoryName,
  loading = false,
  onQuickAdd,
  onSelectProduct,
  onSelectShop,
}) => {
  const { t } = useTranslation("customer");

  return (
    <section className="w-full max-w-[1440px] mx-auto px-margin-lg pb-space-xl">
      <div className="flex items-center justify-between gap-space-md mb-space-lg p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            {t("home.featured.title")}
          </h2>
          <p className="text-on-surface-variant">
            {categoryName
              ? t("home.featured.subtitle_category", { category: categoryName })
              : t("home.featured.subtitle_all")}
          </p>
        </div>
        <Link className="flex items-center gap-1 text-primary font-label-md font-bold hover:underline" to="#catalog">
          {t("home.featured.view_catalog")} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex flex-col rounded-2xl bg-surface-container-lowest p-3 border border-outline-variant/40 animate-pulse h-80"
            >
              <div className="w-full h-48 rounded-xl bg-surface-container mb-3" />
              <div className="h-4 bg-surface-container rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface-container rounded w-1/2 mb-4" />
              <div className="mt-auto h-6 bg-surface-container rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-on-surface-variant">
          {categoryName
            ? t("home.featured.empty_category", { category: categoryName })
            : t("home.featured.empty_all")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickAdd={onQuickAdd}
              onClick={onSelectProduct}
              onShopClick={onSelectShop}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FlashSaleSection;
