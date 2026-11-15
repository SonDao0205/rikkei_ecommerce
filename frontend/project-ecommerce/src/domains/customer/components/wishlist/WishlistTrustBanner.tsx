import React from "react";
import { useTranslation } from "react-i18next";

export const WishlistTrustBanner: React.FC = () => {
  const { t } = useTranslation("customer");

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 border border-outline-variant/40">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">price_change</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            {t("wishlist.trust.price_alert_title")}
          </h4>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {t("wishlist.trust.price_alert_desc")}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">lock_clock</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            {t("wishlist.trust.save_cloud_title")}
          </h4>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {t("wishlist.trust.save_cloud_desc")}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">verified</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            {t("wishlist.trust.verified_shops_title")}
          </h4>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {t("wishlist.trust.verified_shops_desc")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WishlistTrustBanner;
