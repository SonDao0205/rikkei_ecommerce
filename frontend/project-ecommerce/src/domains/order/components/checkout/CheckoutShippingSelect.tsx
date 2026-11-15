import React from "react";
import { useTranslation } from "react-i18next";
import type { CheckoutMethod } from "@/domains/customer/api/cartApi";
import { formatCurrencyVND } from "@/shared/utils/currency";

interface CheckoutShippingSelectProps {
  shippingMethods: CheckoutMethod[];
  selectedShippingId: number;
  onSelectShipping: (id: number) => void;
}

export const CheckoutShippingSelect: React.FC<CheckoutShippingSelectProps> = ({
  shippingMethods,
  selectedShippingId,
  onSelectShipping,
}) => {
  const { t } = useTranslation("customer");

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            local_shipping
          </span>
          <span className="font-bold text-xs sm:text-sm text-on-surface uppercase tracking-wide">
            {t("checkout.shipping.title")}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
          {t("checkout.shipping.nationwide_badge")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {shippingMethods.map((method) => {
          const isSelected = method.id === selectedShippingId;
          const isExpress = method.code === "EXPRESS";
          const methodName = isExpress
            ? t("checkout.shipping.express.name", { defaultValue: method.name })
            : t("checkout.shipping.standard.name", { defaultValue: method.name });
          const methodEstimated = isExpress
            ? t("checkout.shipping.express.estimated", { defaultValue: method.estimated_days || "1–2 ngày" })
            : t("checkout.shipping.standard.estimated", { defaultValue: method.estimated_days || "2–4 ngày" });
          const methodNote = isExpress
            ? t("checkout.shipping.express.note", { defaultValue: "Ưu tiên xử lý & giao hỏa tốc" })
            : t("checkout.shipping.standard.note", { defaultValue: "Tiết kiệm chi phí, an toàn" });

          return (
            <div
              key={method.id}
              onClick={() => onSelectShipping(method.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? "bg-primary/5 border-primary ring-1 ring-primary shadow-xs"
                  : "bg-surface-container-low/40 border-outline-variant/60 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-surface-container-lowest"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                      {methodName}
                    </h4>
                    {method.estimated_days && (
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">
                          schedule
                        </span>
                        <span>
                          {t("checkout.shipping.estimated_prefix", { defaultValue: "Dự kiến:" })}{" "}
                          {methodEstimated}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <span className="font-bold text-xs sm:text-sm text-primary shrink-0">
                  {formatCurrencyVND(method.base_fee ?? 0)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/30">
                <span className="material-symbols-outlined text-[14px] text-teal-600">
                  verified
                </span>
                <span>{methodNote}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutShippingSelect;

