import React from "react";
import { useTranslation } from "react-i18next";

export const OrderGuaranteesStrip: React.FC = () => {
  const { t } = useTranslation("customer");

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Guarantee 1 */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">fact_check</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            {t("order_complete.guarantees.co_check.title")}
          </span>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {t("order_complete.guarantees.co_check.desc")}
          </p>
        </div>
      </div>

      {/* Guarantee 2 */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">
            published_with_changes
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            {t("order_complete.guarantees.free_return.title")}
          </span>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {t("order_complete.guarantees.free_return.desc")}
          </p>
        </div>
      </div>

      {/* Guarantee 3: Support Contact */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">support_agent</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            {t("order_complete.guarantees.support.title")}
          </span>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {t("order_complete.guarantees.support.desc_prefix")}{" "}
            <strong className="text-on-surface">{t("order_complete.guarantees.support.hotline")}</strong>{" "}
            {t("order_complete.guarantees.support.desc_suffix")}
          </p>
          <a
            href="#"
            className="mt-1.5 text-primary text-xs font-bold flex items-center gap-1 hover:underline"
          >
            <span>{t("order_complete.guarantees.support.chat_link")}</span>
            <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default OrderGuaranteesStrip;
