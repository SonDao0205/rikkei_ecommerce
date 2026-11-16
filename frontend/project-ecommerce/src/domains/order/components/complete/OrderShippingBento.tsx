import React from "react";
import { useTranslation } from "react-i18next";
import type { UserOrderTimelineLog } from "@/domains/order/types/order.types";

interface OrderShippingBentoProps {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryNote?: string;
  carrierName?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: string;
  timeline: UserOrderTimelineLog[];
}

export const OrderShippingBento: React.FC<OrderShippingBentoProps> = ({
  recipientName,
  recipientPhone,
  deliveryAddress,
  deliveryNote,
  carrierName = "",
  trackingCode = "",
  estimatedDeliveryDate,
  timeline,
}) => {
  const { t } = useTranslation("customer");

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

  const events = timeline;
  const activeEventIndex = events.length ? 0 : -1;

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

            {deliveryNote && (
              <div className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs flex items-start gap-2 border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                  sticky_note_2
                </span>
                <span>
                  <strong>{t("order_complete.shipping.note_label")}</strong> {deliveryNote}
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
                  {estimatedDeliveryDate || "Chưa có dữ liệu"}
                </span>
                {carrierName && (
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container text-xs font-bold">
                  {getCarrierDisplay()}
                </span>
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-xs text-primary font-bold">
              {trackingCode && <span>{t("order_complete.shipping.tracking_code", { code: trackingCode })}</span>}
            </div>
          </div>

          {/* Events returned by the order detail API */}
          <div className="relative my-2">
            {events.length ? (
              <ol className="space-y-4">
                {events.map((event, idx) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${idx === activeEventIndex ? "text-primary" : "text-emerald-600"}`}>
                      {idx === activeEventIndex ? "pending_actions" : "check_circle"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface">{event.title}</p>
                      <p className="text-[11px] text-on-surface-variant">{event.time}</p>
                      {event.subtitle && <p className="text-[10px] text-outline">{event.subtitle}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-on-surface-variant">Chưa có cập nhật trạng thái vận chuyển.</p>
            )}
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
