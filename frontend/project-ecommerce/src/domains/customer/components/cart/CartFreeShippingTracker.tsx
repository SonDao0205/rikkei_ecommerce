import React from "react";
import { useTranslation } from "react-i18next";

export interface CartFreeShippingTrackerProps {
  totalItems: number;
  onGoBack?: () => void;
}

export const CartFreeShippingTracker: React.FC<CartFreeShippingTrackerProps> = ({
  totalItems,
  onGoBack,
}) => {
  const { t } = useTranslation("customer");

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex flex-col gap-2">
        {onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="group inline-flex w-fit items-center gap-1.5 font-semibold text-on-surface-variant transition-colors hover:text-primary cursor-pointer"
            title={t("cart.header.back")}
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>{t("cart.header.back")}</span>
          </button>
        )}
        <div className="flex items-center gap-3">
          <h1 className="font-headline-xl text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            {t("cart.header.title")}
          </h1>
          <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed sm:text-sm">
            {t("cart.header.items_count", { count: totalItems })}
          </span>
        </div>
      </div>
      <div className="flex w-full items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs md:max-w-md">
        <span className="material-symbols-outlined text-secondary">local_shipping</span>
        <p className="text-sm text-on-surface-variant">
          {t("cart.header.shipping_notice")}
        </p>
      </div>
    </div>
  );
};

export default CartFreeShippingTracker;
