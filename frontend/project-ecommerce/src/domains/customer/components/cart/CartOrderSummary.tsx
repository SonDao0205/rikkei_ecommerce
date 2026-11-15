import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CartSummary, PlatformVoucher } from "@/domains/customer/types/cart.types";
import { formatCurrencyVND } from "@/shared/utils/currency";
import { AVAILABLE_PLATFORM_VOUCHERS } from "@/domains/customer/data/availableVouchers";

export interface CartOrderSummaryProps {
  summary: CartSummary;
  platformVoucher: PlatformVoucher | null;
  onApplyPlatformVoucher: (code: string) => Promise<void>;
  onRemovePlatformVoucher?: () => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  summary,
  platformVoucher,
  onApplyPlatformVoucher,
  onRemovePlatformVoucher,
  onCheckout,
  isCheckingOut = false,
}) => {
  const { t } = useTranslation("customer");
  const [couponCode, setCouponCode] = useState(
    platformVoucher?.code || "RETRO50"
  );
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setIsApplying(true);
      setErrorMsg(null);
      await onApplyPlatformVoucher(couponCode.trim());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Mã không hợp lệ");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="sticky top-28 bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-outline-variant/60">
      {/* Summary Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold">
          {t("cart.summary.title")}
        </h2>
        <span className="text-xs sm:text-sm text-secondary font-bold">
          {t("cart.summary.selected_items", { count: summary.selected_count })}
        </span>
      </div>

      {/* Platform Voucher Section with Available Vouchers */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">
              redeem
            </span>
            <span>{t("cart.summary.platform_voucher_title")}</span>
          </span>
          {platformVoucher?.is_applied && (
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check</span>
              <span>{t("cart.summary.voucher_applied")}</span>
            </span>
          )}
        </div>

        {/* List of Available Platform Vouchers */}
        <div className="flex flex-col gap-1.5">
          {AVAILABLE_PLATFORM_VOUCHERS.map((v) => {
            const isThisApplied =
              platformVoucher?.is_applied && platformVoucher.code === v.code;
            const isEligible = summary.items_subtotal >= v.minOrderValue;

            return (
              <div
                key={v.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isThisApplied
                    ? "bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs"
                    : isEligible
                    ? "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/50"
                    : "bg-surface-container-low/40 border-outline-variant/30 opacity-70"
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isThisApplied
                        ? "bg-emerald-600 text-white"
                        : v.badge === "Freeship"
                        ? "bg-teal-600 text-white"
                        : "bg-primary text-on-primary"
                    }`}
                  >
                    {v.highlightText}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-[11px] text-on-surface truncate">
                      {v.code}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      Đơn từ {formatCurrencyVND(v.minOrderValue)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isThisApplied ? (
                    <button
                      type="button"
                      onClick={onRemovePlatformVoucher}
                      disabled={isApplying}
                      className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Bỏ chọn
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isApplying || !isEligible}
                      onClick={async () => {
                        try {
                          setIsApplying(true);
                          setErrorMsg(null);
                          await onApplyPlatformVoucher(v.code);
                        } catch (err: unknown) {
                          setErrorMsg(
                            typeof err === "string"
                              ? err
                              : err instanceof Error
                              ? err.message
                              : "Mã voucher không hợp lệ"
                          );
                        } finally {
                          setIsApplying(false);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isEligible
                          ? "bg-primary text-on-primary hover:bg-primary/90"
                          : "bg-surface-container text-outline cursor-not-allowed"
                      }`}
                      title={
                        !isEligible
                          ? `Đơn hàng cần đạt tối thiểu ${formatCurrencyVND(v.minOrderValue)}`
                          : undefined
                      }
                    >
                      {isApplying ? "..." : isEligible ? "Áp dụng" : "Chưa đủ ĐK"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Voucher Input */}
        <div className="pt-1 border-t border-outline-variant/30">
          <form onSubmit={handleApply} className="flex items-center gap-1.5">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher khác..."
              className="flex-1 h-8 px-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface uppercase font-bold focus:outline-none border border-outline-variant/60 focus:border-primary"
            />
            <button
              type="submit"
              disabled={isApplying || !couponCode.trim()}
              className="h-8 px-3 rounded-lg bg-surface-container-high text-xs text-primary font-bold hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50"
            >
              {isApplying ? "..." : "Áp dụng"}
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-error font-medium mt-1">{errorMsg}</p>
          )}

          {platformVoucher?.is_applied && (
            <div className="flex items-center justify-between text-xs text-emerald-700 font-bold pt-1.5">
              <span className="flex items-center gap-1">
                <span>{platformVoucher.description || `Mã '${platformVoucher.code}'`}</span>
                {onRemovePlatformVoucher && (
                  <button
                    type="button"
                    onClick={onRemovePlatformVoucher}
                    className="text-outline hover:text-error transition-colors"
                    title="Hủy voucher"
                  >
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                  </button>
                )}
              </span>
              <span>-{formatCurrencyVND(summary.platform_voucher_discount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price Calculations */}
      <div className="flex flex-col gap-2.5 text-xs sm:text-sm pt-1">
        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant">
            {t("cart.summary.items_subtotal", { count: summary.selected_count })}
          </span>
          <span className="text-on-surface font-bold">
            {formatCurrencyVND(summary.items_subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant">{t("cart.summary.estimated_shipping")}</span>
          <span className="text-on-surface">
            {summary.estimated_shipping > 0
              ? formatCurrencyVND(summary.estimated_shipping)
              : "0 ₫"}
          </span>
        </div>

        {summary.shipping_discount > 0 && (
          <div className="flex items-center justify-between text-secondary">
            <span className="flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">
                local_shipping
              </span>
              <span>{t("cart.summary.shipping_discount")}</span>
            </span>
            <span className="font-bold">
              -{formatCurrencyVND(summary.shipping_discount)}
            </span>
          </div>
        )}

        {summary.store_vouchers_discount > 0 && (
          <div className="flex items-center justify-between text-secondary">
            <span>{t("cart.summary.store_vouchers")}</span>
            <span className="font-bold">
              -{formatCurrencyVND(summary.store_vouchers_discount)}
            </span>
          </div>
        )}

        {summary.platform_voucher_discount > 0 && (
          <div className="flex items-center justify-between text-secondary">
            <span>{t("cart.summary.platform_voucher")}</span>
            <span className="font-bold">
              -{formatCurrencyVND(summary.platform_voucher_discount)}
            </span>
          </div>
        )}
      </div>

      {/* Total Calculation Row */}
      <div className="pt-3 pb-1 flex flex-col gap-1 border-t border-surface-container">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-sm sm:text-base font-bold text-on-surface block">
              {t("cart.summary.estimated_total")}
            </span>
            <span className="text-[11px] text-outline">{t("cart.summary.final_total_notice")}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl text-primary-container font-black leading-none block">
              {formatCurrencyVND(summary.grand_total)}
            </span>
          </div>
        </div>

        {summary.total_savings > 0 && (
          <div className="p-2 rounded-lg bg-surface-container text-primary text-xs font-bold flex items-center justify-center gap-1 mt-2 text-center">
            <span className="material-symbols-outlined text-[16px]">savings</span>
            <span>
              {t("cart.summary.savings_notice", { amount: formatCurrencyVND(summary.total_savings) })}
            </span>
          </div>
        )}
      </div>

      {/* Checkout CTA */}
      <button
        type="button"
        disabled={summary.selected_count === 0 || isCheckingOut}
        onClick={onCheckout}
        className={`w-full py-3.5 px-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer ${
          summary.selected_count === 0
            ? "bg-surface-container text-outline cursor-not-allowed"
            : "bg-primary-container text-on-primary hover:bg-primary active:scale-[0.99]"
        }`}
      >
        <span>
          {isCheckingOut
            ? t("cart.summary.loading_quote")
            : t("cart.summary.checkout_btn")}
        </span>
        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </button>

      {/* Buyer Protection Guarantees */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-on-surface-variant">
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[20px]">
            shield_with_heart
          </span>
          <span className="text-[10px] leading-tight font-bold">
            {t("cart.summary.protection_guarantee")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[20px]">
            sync_alt
          </span>
          <span className="text-[10px] leading-tight font-bold">
            {t("cart.summary.free_returns")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[20px]">
            package_2
          </span>
          <span className="text-[10px] leading-tight font-bold">
            {t("cart.summary.inspect_before_pay")}
          </span>
        </div>
      </div>

      {/* Payment Methods Accepted */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-outline text-center tracking-wider">
          {t("cart.summary.accepted_payments_title")}
        </span>
        <p className="text-center text-[11px] text-on-surface-variant">
          {t("cart.summary.accepted_payments_notice")}
        </p>
      </div>
    </div>
  );
};

export default CartOrderSummary;

