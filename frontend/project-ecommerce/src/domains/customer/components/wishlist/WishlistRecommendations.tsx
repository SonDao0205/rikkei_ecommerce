import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { WishlistRecommendation } from "@/domains/customer/types/wishlist.types";
import { formatCurrencyVND } from "@/shared/utils/currency";

export interface WishlistRecommendationsProps {
  recommendations: WishlistRecommendation[];
  onAddToWishlist: (item: WishlistRecommendation) => void;
}

export const WishlistRecommendations: React.FC<WishlistRecommendationsProps> = ({
  recommendations,
  onAddToWishlist,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("customer");

  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-surface-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 rounded-full bg-primary-container"></div>
          <h2 className="font-headline-lg text-lg sm:text-xl text-on-surface font-bold">
            {t("wishlist.recommendations.title")}
          </h2>
        </div>
        <Link
          to="/"
          className="text-xs sm:text-sm text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{t("wishlist.recommendations.view_all")}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {recommendations.map((reco) => (
          <div
            key={reco.id}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("button") || target.closest("a") || target.closest("input")) return;
              navigate(`/product/${reco.product_id || reco.id}`);
            }}
            className="group relative flex flex-col rounded-xl bg-surface-container-lowest p-3 shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-outline-variant/30 hover:border-primary/40 transition-all duration-300 ease-out overflow-hidden will-change-transform cursor-pointer"
          >
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-surface-container-low mb-3 cursor-pointer">
              <img
                src={reco.image_url}
                alt={reco.alt_text || reco.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              {reco.tag && (
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                    reco.tag.includes("%")
                      ? "bg-tertiary-container text-white"
                      : "bg-surface-container-lowest/90 text-on-surface"
                  }`}
                >
                  {reco.tag}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-secondary font-semibold mb-1">
              <span className="truncate">{reco.shop_name}</span>
            </div>

            <Link
              to={`/product/${reco.product_id || reco.id}`}
              className="text-xs sm:text-sm font-bold text-on-surface line-clamp-1 mb-1 group-hover:text-primary transition-colors cursor-pointer"
            >
              {reco.name}
            </Link>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-container/60">
              <span className="text-sm sm:text-base font-bold text-on-surface">
                {formatCurrencyVND(reco.price)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWishlist(reco);
                }}
                title={t("wishlist.recommendations.add_tooltip")}
                aria-label="Add recommendation to wishlist"
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-primary text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  favorite_border
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistRecommendations;
