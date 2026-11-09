import React, { useState } from "react";
import type { PlatformVoucher } from "@/domains/customer/types/cart.types";
import type { CheckoutQuote } from "@/domains/customer/api/cartApi";
import { formatCurrencyVND } from "@/shared/utils/currency";
import { AVAILABLE_PLATFORM_VOUCHERS } from "@/domains/customer/data/availableVouchers";

interface CheckoutOrderSummaryProps {
  quote: CheckoutQuote | null;
  fallbackSubtotal: number;
  fallbackShippingFee: number;
  fallbackShopDiscount: number;
  fallbackPlatformDiscount: number;
  fallbackTotal: number;
  platformVoucher: PlatformVoucher | null;
  onApplyPlatformVoucher: (code: string) => Promise<void>;
  onRemovePlatformVoucher: () => void;
  onSubmitOrder: () => void;
  isCalculating?: boolean;
  isSubmitting?: boolean;
  selectedPaymentCode?: string;
  errorMessage?: string | null;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  quote,
  fallbackSubtotal,
  fallbackShippingFee,
  fallbackShopDiscount,
  fallbackPlatformDiscount,
  fallbackTotal,
  platformVoucher,
  onApplyPlatformVoucher,
  onRemovePlatformVoucher,
  onSubmitOrder,
  isCalculating = false,
  isSubmitting = false,
  selectedPaymentCode = "COD",
  errorMessage = null,
}) => {
  const [customCode, setCustomCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const subtotal = quote ? quote.subtotal : fallbackSubtotal;
  const shippingFee = quote ? quote.shipping_fee : fallbackShippingFee;
  const shopDiscount = quote ? quote.shop_discount : fallbackShopDiscount;
  const platformDiscount = quote ? quote.platform_discount : fallbackPlatformDiscount;
  const total = quote ? quote.total : fallbackTotal;

  const handleCustomApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim()) return;
    try {
      setIsApplying(true);
      setLocalError(null);
      await onApplyPlatformVoucher(customCode.trim());
      setCustomCode("");
    } catch (err: unknown) {
      setLocalError(
        typeof err === "string" ? err : err instanceof Error ? err.message : "Mã ưu đãi không hợp lệ"
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-md flex flex-col gap-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-on-surface">
            Tóm tắt đơn hàng
          </h3>
          <span className="text-xs text-on-surface-variant">Chi tiết thanh toán & Ưu đãi</span>
        </div>
        <span className="material-symbols-outlined text-primary text-[20px]">
          receipt_long
        </span>
      </div>

      {/* Platform Vouchers Section */}
      <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">
              redeem
            </span>
            <span>Mã giảm giá Toàn Sàn</span>
          </span>
          {platformVoucher?.is_applied && (
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Đang áp dụng
            </span>
          )}
        </div>

        {/* Available Platform Vouchers List */}
        <div className="flex flex-col gap-1.5">
          {AVAILABLE_PLATFORM_VOUCHERS.map((v) => {
            const isApplied =
              platformVoucher?.is_applied && platformVoucher.code === v.code;
            const isEligible = subtotal >= v.minOrderValue;

            return (
              <div
                key={v.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isApplied
                    ? "bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs"
                    : isEligible
                    ? "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/50"
                    : "bg-surface-container-low/40 border-outline-variant/30 opacity-70"
                }`}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isApplied
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
                  {isApplied ? (
                    <button
                      type="button"
                      onClick={onRemovePlatformVoucher}
                      disabled={isCalculating || isApplying}
                      className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Bỏ chọn
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isCalculating || isApplying || !isEligible}
                      onClick={async () => {
                        try {
                          setIsApplying(true);
                          setLocalError(null);
                          await onApplyPlatformVoucher(v.code);
                        } catch (err: unknown) {
                          setLocalError(
                            typeof err === "string"
                              ? err
                              : err instanceof Error
                              ? err.message
                              : "Mã ưu đãi không hợp lệ"
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
        <div className="pt-1.5 border-t border-outline-variant/30">
          <form onSubmit={handleCustomApply} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-outline absolute left-2 top-1.5 text-[16px]">
                sell
              </span>
              <input
                type="text"
                placeholder="Nhập mã ưu đãi khác"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                className="w-full h-8 pl-7 pr-2 rounded-lg bg-surface-container-lowest text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/60 uppercase font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={isApplying || isCalculating || !customCode.trim()}
              className="h-8 px-3 rounded-lg bg-surface-container-high text-xs text-primary font-bold hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50"
            >
              {isApplying ? "..." : "Áp dụng"}
            </button>
          </form>

          {localError && (
            <p className="text-xs text-error font-medium mt-1">{localError}</p>
          )}

          {platformVoucher?.is_applied && (
            <div className="flex items-center justify-between text-xs text-emerald-700 font-bold pt-1.5">
              <span>Mã '{platformVoucher.code}' đã áp dụng:</span>
              <span>-{formatCurrencyVND(platformDiscount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Financial Calculations */}
      <div className="flex flex-col gap-2.5 py-3 px-3.5 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 text-xs sm:text-sm">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Tổng tiền hàng</span>
          <span className="font-semibold text-on-surface">
            {formatCurrencyVND(subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-on-surface-variant">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-on-surface">
            {formatCurrencyVND(shippingFee)}
          </span>
        </div>

        {shopDiscount > 0 && (
          <div className="flex justify-between items-center text-secondary font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">store</span>
              <span>Giảm giá từ Shop</span>
            </span>
            <span>-{formatCurrencyVND(shopDiscount)}</span>
          </div>
        )}

        {platformDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">redeem</span>
              <span>Voucher Sàn ({platformVoucher?.code || "Ưu đãi"})</span>
            </span>
            <span>-{formatCurrencyVND(platformDiscount)}</span>
          </div>
        )}

        {/* Total Amount Row */}
        <div className="pt-3 mt-1 border-t border-outline-variant/40 flex justify-between items-baseline">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-on-surface">Tổng thanh toán</span>
            <span className="text-[11px] text-on-surface-variant">
              {selectedPaymentCode === "COD"
                ? "Thanh toán khi nhận hàng • Đã gồm VAT"
                : "Chuyển khoản ngân hàng • Đã gồm VAT"}
            </span>
          </div>

          <div className="text-right">
            <span className="font-headline-md text-xl sm:text-2xl text-primary font-bold tracking-tight">
              {formatCurrencyVND(total)}
            </span>
            {isCalculating && (
              <span className="block text-[10px] text-on-surface-variant animate-pulse">
                Đang cập nhật báo giá...
              </span>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Place Order CTA Button */}
      <button
        type="button"
        onClick={onSubmitOrder}
        disabled={isSubmitting || isCalculating}
        className="w-full h-13 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[20px]">lock</span>
        <span>
          {isSubmitting
            ? "Đang xử lý đơn hàng..."
            : `Đặt hàng (${selectedPaymentCode}) — ${formatCurrencyVND(total)}`}
        </span>
      </button>

      <p className="text-[11px] text-on-surface-variant text-center px-1 leading-normal">
        Bằng việc bấm đặt hàng, bạn đồng ý với điều khoản sử dụng và kiểm tra gói hàng trước khi thanh toán cho đơn vị vận chuyển.
      </p>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[18px]">
            verified
          </span>
          <span className="text-[10px] text-on-surface font-semibold leading-tight">
            100% Chính hãng
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[18px]">
            replay_7
          </span>
          <span className="text-[10px] text-on-surface font-semibold leading-tight">
            7 Ngày đổi trả
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[18px]">
            fact_check
          </span>
          <span className="text-[10px] text-on-surface font-semibold leading-tight">
            Đồng kiểm VIP
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;

