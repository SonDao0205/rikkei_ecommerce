import React, { useState } from "react";
import type { CartSummary, PlatformVoucher } from "@/domains/customer/types/cart.types";
import { formatCurrencyVND } from "@/shared/utils/currency";

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
          Order Summary
        </h2>
        <span className="text-xs sm:text-sm text-secondary font-bold">
          {summary.selected_count} items selected
        </span>
      </div>

      {/* Platform Voucher Section */}
      <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              redeem
            </span>
            <span>Platform Voucher</span>
          </span>
          {platformVoucher?.is_applied && (
            <span className="text-xs text-primary font-bold">1 Đã áp dụng</span>
          )}
        </div>

        <form onSubmit={handleApply} className="flex items-center gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã RETRO50, MP100..."
            className="flex-1 h-9 px-3 rounded-lg bg-surface-container-lowest text-xs sm:text-sm text-on-surface uppercase font-bold focus:outline-none border border-outline-variant/60 focus:border-primary"
          />
          <button
            type="submit"
            disabled={isApplying || !couponCode.trim()}
            className="h-9 px-3.5 rounded-lg bg-surface-container-high text-xs sm:text-sm text-primary font-bold hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50"
          >
            {isApplying ? "..." : "Apply"}
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-error font-medium">{errorMsg}</p>
        )}

        {platformVoucher?.is_applied && (
          <div className="flex items-center justify-between text-xs text-secondary font-bold pt-1">
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

      {/* Price Calculations */}
      <div className="flex flex-col gap-2.5 text-xs sm:text-sm pt-1">
        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant">
            Items Subtotal ({summary.selected_count} món)
          </span>
          <span className="text-on-surface font-bold">
            {formatCurrencyVND(summary.items_subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant">Estimated Shipping (final at checkout)</span>
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
              <span>Shipping Discount</span>
            </span>
            <span className="font-bold">
              -{formatCurrencyVND(summary.shipping_discount)}
            </span>
          </div>
        )}

        {summary.store_vouchers_discount > 0 && (
          <div className="flex items-center justify-between text-secondary">
            <span>Store Vouchers</span>
            <span className="font-bold">
              -{formatCurrencyVND(summary.store_vouchers_discount)}
            </span>
          </div>
        )}

        {summary.platform_voucher_discount > 0 && (
          <div className="flex items-center justify-between text-secondary">
            <span>Platform Voucher</span>
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
              Estimated Total
            </span>
            <span className="text-[11px] text-outline">Final total confirmed in checkout quote</span>
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
              You save a total of {formatCurrencyVND(summary.total_savings)} on this purchase!
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
            ? "Đang tải báo giá..."
            : "Chọn giao hàng, thanh toán & xem báo giá"}
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
            100% Escrow Protection
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[20px]">
            sync_alt
          </span>
          <span className="text-[10px] leading-tight font-bold">
            7-Day Free Returns
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[20px]">
            package_2
          </span>
          <span className="text-[10px] leading-tight font-bold">
            Inspect Before Pay
          </span>
        </div>
      </div>

      {/* Payment Methods Accepted */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-outline text-center tracking-wider">
          Accepted Payment Options
        </span>
        <p className="text-center text-[11px] text-on-surface-variant">
          Chọn phương thức đang được hệ thống hỗ trợ ở bước checkout.
        </p>
      </div>
    </div>
  );
};

export default CartOrderSummary;

