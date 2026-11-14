import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface WishlistEmptyStateProps {
  isDemoView?: boolean;
  onExitDemoView?: () => void;
}

export const WishlistEmptyState: React.FC<WishlistEmptyStateProps> = ({
  isDemoView = false,
  onExitDemoView,
}) => {
  const { t } = useTranslation("customer");

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/60">
      <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-6">
        <span className="material-symbols-outlined text-[54px]">favorite_border</span>
      </div>

      <h3 className="font-headline-xl text-xl sm:text-2xl text-on-surface font-bold mb-2">
        {t("wishlist.empty.title")}
      </h3>

      <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mb-8">
        {t("wishlist.empty.desc")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="h-12 px-6 sm:px-8 rounded-xl bg-primary-container text-on-primary text-xs sm:text-sm font-bold hover:bg-primary transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span>{t("wishlist.empty.explore_btn")}</span>
        </Link>

        {isDemoView && onExitDemoView && (
          <button
            type="button"
            onClick={onExitDemoView}
            className="h-12 px-5 rounded-xl bg-surface-container text-on-surface text-xs sm:text-sm font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            {t("wishlist.empty.back_btn")}
          </button>
        )}
      </div>
    </div>
  );
};

export default WishlistEmptyState;
