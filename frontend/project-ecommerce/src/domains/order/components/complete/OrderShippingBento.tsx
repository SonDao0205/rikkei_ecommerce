import React from "react";
import { useTranslation } from "react-i18next";

interface OrderShippingBentoProps {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryNote?: string;
  carrierName?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: string;
  currentStepIndex?: number; // 0: Đơn hàng đã đặt, 1: Chờ xác nhận, 2: Chờ lấy đơn hàng, 3: Đang vận chuyển, 4: Giao hàng thành công
}

export const OrderShippingBento: React.FC<OrderShippingBentoProps> = ({
  recipientName,
  recipientPhone,
  deliveryAddress,
  deliveryNote,
  carrierName = "Giao hàng tiêu chuẩn",
  trackingCode = "GHN-VN-98234120",
  estimatedDeliveryDate,
  currentStepIndex = 1,
}) => {
  const { t } = useTranslation("customer");

  const effectiveDeliveryNote = deliveryNote || t("order_complete.shipping.default_delivery_note");

  const getCarrierDisplay = () => {
    const lower = (carrierName || "").toLowerCase();
    if (lower.includes("tiêu chuẩn") || lower.includes("standard")) {
      return t("order_complete.shipping.standard_delivery");
    }
    if (lower.includes("nhanh") || lower.includes("express")) {
      return t("order_complete.shipping.express_delivery");
    }
    return carrierName;
  };

  const getEstimatedDaysDisplay = () => {
    if (!estimatedDeliveryDate || estimatedDeliveryDate.includes("2-4") || estimatedDeliveryDate.includes("2–4")) {
      return t("order_complete.shipping.default_estimated_days");
    }
    return estimatedDeliveryDate;
  };

  const steps = [
    {
      title: t("order_complete.shipping.timeline.placed.title"),
      time: t("order_complete.shipping.timeline.placed.time"),
      note: t("order_complete.shipping.timeline.placed.note"),
      icon: "shopping_cart_checkout",
    },
    {
      title: t("order_complete.shipping.timeline.confirming.title"),
      time: t("order_complete.shipping.timeline.confirming.time"),
      note: t("order_complete.shipping.timeline.confirming.note"),
      icon: "pending_actions",
    },
    {
      title: t("order_complete.shipping.timeline.picking.title"),
      time: t("order_complete.shipping.timeline.picking.time"),
      note: t("order_complete.shipping.timeline.picking.note"),
      icon: "inventory_2",
    },
    {
      title: t("order_complete.shipping.timeline.shipping.title"),
      time: t("order_complete.shipping.timeline.shipping.time"),
      note: t("order_complete.shipping.timeline.shipping.note"),
      icon: "local_shipping",
    },
    {
      title: t("order_complete.shipping.timeline.delivered.title"),
      time: t("order_complete.shipping.timeline.delivered.time"),
      note: t("order_complete.shipping.timeline.delivered.note"),
      icon: "task_alt",
    },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* Left Bento: Shipping Address (5 of 12) */}
      <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/40 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <h2 className="font-bold text-sm sm:text-base text-on-surface">
                {t("order_complete.shipping.recipient_address")}
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>{t("order_complete.shipping.verified_recipient")}</span>
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="font-bold text-sm sm:text-base text-on-surface">
                {recipientName}
              </span>
              <span className="text-xs sm:text-sm text-outline ml-2">
                ({recipientPhone})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {deliveryAddress}
            </p>

            {effectiveDeliveryNote && (
              <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs flex items-start gap-2 border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  sticky_note_2
                </span>
                <span>
                  <strong>{t("order_complete.shipping.note_label")}</strong> {effectiveDeliveryNote}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px] text-primary">
              shield
            </span>
            <span>{t("order_complete.shipping.transit_insurance")}</span>
          </span>
          <span className="text-[11px] font-bold text-secondary uppercase">
            {t("order_complete.shipping.free_returns")}
          </span>
        </div>
      </div>

      {/* Right Bento: Delivery Timeline & Stepper (7 of 12) */}
      <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/40 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-outline font-bold block mb-0.5">
                {t("order_complete.shipping.estimated_delivery")}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-on-surface">
                  {getEstimatedDaysDisplay()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container text-xs font-bold">
                  {getCarrierDisplay()}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-xs text-primary font-bold">
              <span>{t("order_complete.shipping.tracking_code", { code: trackingCode })}</span>
            </div>
          </div>

          {/* 5-Step Stepper */}
          <div className="relative my-2">
            {/* Desktop Horizontal Timeline Track Bar (Centered exactly through circles center) */}
            <div
              className="absolute top-5 -translate-y-1/2 h-1 bg-outline-variant/35 rounded-full hidden md:block z-0"
              style={{ left: "20px", width: "calc(80% + 5px)" }}
            >
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (currentStepIndex / (steps.length - 1)) * 100))}%`,
                }}
              />
            </div>

            {/* Mobile Vertical Timeline Track Bar */}
            <div className="absolute top-5 bottom-8 left-5 -translate-x-1/2 w-0.5 bg-outline-variant/35 md:hidden z-0">
              <div
                className="w-full bg-emerald-600 transition-all duration-500"
                style={{
                  height: `${Math.min(100, Math.max(0, (currentStepIndex / (steps.length - 1)) * 100))}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-1 relative z-10">
              {steps.map((st, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={st.title}
                    className={`flex md:flex-col items-center md:items-start gap-3 md:gap-2 ${
                      idx > currentStepIndex ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-all ${
                        isPassed
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-primary text-on-primary ring-4 ring-primary/20 shadow-md"
                          : "bg-surface-container text-outline"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isCurrent ? "animate-pulse" : ""
                        }`}
                      >
                        {isPassed ? "check" : st.icon}
                      </span>
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary ring-2 ring-surface-container-lowest" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        {st.title}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {st.time}
                      </span>
                      <span className="text-[10px] text-outline hidden md:inline">
                        {st.note}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-xs border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              notifications_active
            </span>
            <span className="text-on-surface">
              {t("order_complete.shipping.sms_notice")}
            </span>
          </div>
          <span className="text-primary font-bold shrink-0">{t("order_complete.shipping.support_priority")}</span>
        </div>
      </div>
    </section>
  );
};

export default OrderShippingBento;
