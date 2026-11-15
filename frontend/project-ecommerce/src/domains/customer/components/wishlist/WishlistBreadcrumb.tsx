import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface WishlistBreadcrumbProps {
  isEmptyViewActive?: boolean;
  onToggleEmptyView?: () => void;
}

export const WishlistBreadcrumb: React.FC<WishlistBreadcrumbProps> = () => {
  const { t } = useTranslation("customer");

  return (
    <div className="w-full bg-surface-container-lowest shadow-sm border-b border-outline-variant/40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-on-surface-variant">
          <Link
            to="/"
            className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>{t("wishlist.breadcrumb.home")}</span>
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline">
            chevron_right
          </span>
          <Link to="/profile" className="hover:text-primary transition-colors cursor-pointer">
            {t("wishlist.breadcrumb.account")}
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline">
            chevron_right
          </span>
          <span className="font-semibold text-on-surface">
            {t("wishlist.breadcrumb.wishlist")}
          </span>
        </nav>

        {/* Sync Status */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-secondary text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t("wishlist.breadcrumb.realtime_sync")}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default WishlistBreadcrumb;
