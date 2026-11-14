import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserOrder } from "@/shared/types";

interface CancelOrderModalProps {
  order: UserOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: number | string, reason: string) => void;
  loading?: boolean;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmCancel,
  loading = false,
}) => {
  const { t } = useTranslation("customer");

  const reasons = [
    { key: "change_mind", label: t("profile.orders.cancel_modal.reasons.change_mind") },
    { key: "change_address", label: t("profile.orders.cancel_modal.reasons.change_address") },
    { key: "change_product", label: t("profile.orders.cancel_modal.reasons.change_product") },
    { key: "found_cheaper", label: t("profile.orders.cancel_modal.reasons.found_cheaper") },
    { key: "delivery_too_long", label: t("profile.orders.cancel_modal.reasons.delivery_too_long") },
    { key: "other", label: t("profile.orders.cancel_modal.reasons.other") },
  ];

  const [selectedReasonKey, setSelectedReasonKey] = useState("change_mind");
  const [customReason, setCustomReason] = useState("");

  if (!isOpen || !order) return null;

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (loading) return;

    const matchedReason = reasons.find((r) => r.key === selectedReasonKey);
    const finalReason =
      selectedReasonKey === "other" && customReason.trim()
        ? customReason.trim()
        : matchedReason?.label || "Lý do khác";

    onConfirmCancel(order.id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-outline-variant/40 flex flex-col">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                cancel
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {t("profile.orders.cancel_modal.title", { code: order.orderCode })}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t("profile.orders.cancel_modal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {t("profile.orders.cancel_modal.reason_label")}
            </span>
            <div className="flex flex-col gap-2">
              {reasons.map((reason) => (
                <label
                  key={reason.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    value={reason.key}
                    checked={selectedReasonKey === reason.key}
                    onChange={() => setSelectedReasonKey(reason.key)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="font-body-md text-body-md text-on-surface">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>

            {selectedReasonKey === "other" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder={t("profile.orders.cancel_modal.custom_placeholder")}
                rows={3}
                required
                className="w-full mt-2 p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:border-primary"
              />
            )}
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface-variant text-xs">
            {t("profile.orders.cancel_modal.warning_note")}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
            >
              {t("profile.orders.cancel_modal.keep_order")}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-error hover:bg-error/90 text-on-error font-label-md text-label-md font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>
                {loading
                  ? t("profile.orders.cancel_modal.cancelling")
                  : t("profile.orders.cancel_modal.confirm_cancel")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
