import React from "react";
import type { AvailableVoucher } from "@/domains/customer/data/availableVouchers";
import { formatCurrencyVND } from "@/shared/utils/currency";

interface VoucherTicketCardProps {
  voucher: AvailableVoucher;
  isApplied: boolean;
  currentOrderAmount?: number;
  onApply: (code: string) => void;
  onRemove: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

export const VoucherTicketCard: React.FC<VoucherTicketCardProps> = ({
  voucher,
  isApplied,
  currentOrderAmount,
  onApply,
  onRemove,
  isLoading = false,
  compact = false,
}) => {
  const isEligible =
    currentOrderAmount === undefined || currentOrderAmount >= voucher.minOrderValue;
  const missingAmount =
    currentOrderAmount !== undefined && currentOrderAmount < voucher.minOrderValue
      ? voucher.minOrderValue - currentOrderAmount
      : 0;

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between gap-2 p-2 rounded-xl border text-xs transition-all ${
          isApplied
            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
            : isEligible
            ? "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/50 text-on-surface"
            : "bg-surface-container-low/40 border-outline-variant/30 text-outline opacity-75"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              isApplied
                ? "bg-emerald-600 text-white"
                : voucher.badge === "Freeship"
                ? "bg-teal-600 text-white"
                : "bg-primary text-on-primary"
            }`}
          >
            {voucher.highlightText}
          </span>
          <div className="min-w-0">
            <p className="font-bold truncate text-[12px]">{voucher.code}</p>
            <p className="text-[11px] text-on-surface-variant truncate">
              Đơn từ {formatCurrencyVND(voucher.minOrderValue)}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isApplied ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Đang dùng</span>
              <span className="material-symbols-outlined text-[13px]">check</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onApply(voucher.code)}
              disabled={isLoading || !isEligible}
              title={
                !isEligible
                  ? `Mua thêm ${formatCurrencyVND(missingAmount)} để áp dụng mã này`
                  : undefined
              }
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                isEligible
                  ? "bg-primary/10 text-primary hover:bg-primary hover:text-on-primary active:scale-95"
                  : "bg-surface-container text-outline cursor-not-allowed"
              }`}
            >
              {isLoading ? "..." : isEligible ? "Áp dụng" : "Chưa đủ ĐK"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-stretch rounded-2xl border overflow-hidden transition-all duration-200 shadow-xs ${
        isApplied
          ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400"
          : isEligible
          ? "bg-surface-container-lowest border-outline-variant/60 hover:border-primary/60 hover:shadow-sm"
          : "bg-surface-container-low/50 border-outline-variant/30 opacity-70"
      }`}
    >
      {/* Left Voucher Stub / Badge */}
      <div
        className={`w-24 sm:w-28 p-3 flex flex-col items-center justify-center text-center shrink-0 border-r border-dashed ${
          isApplied
            ? "bg-emerald-600 text-white border-emerald-400"
            : voucher.badge === "Freeship"
            ? "bg-teal-700 text-white border-teal-800"
            : voucher.badge === "Độc quyền"
            ? "bg-purple-700 text-white border-purple-800"
            : "bg-primary text-on-primary border-primary-container"
        }`}
      >
        <span className="material-symbols-outlined text-[24px] mb-0.5">
          {voucher.badge === "Freeship"
            ? "local_shipping"
            : voucher.discountType === "PERCENT"
            ? "percent"
            : "confirmation_number"}
        </span>
        <span className="font-bold text-[13px] sm:text-[14px] leading-tight tracking-tight">
          {voucher.highlightText}
        </span>
        {voucher.badge && (
          <span className="mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/20 uppercase tracking-widest">
            {voucher.badge}
          </span>
        )}
      </div>

      {/* Right Voucher Content */}
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono font-bold text-xs sm:text-sm text-primary tracking-wider uppercase">
                {voucher.code}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-on-surface line-clamp-1">
                {voucher.title}
              </h4>
            </div>
            {isApplied && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                <span>Đã áp dụng</span>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-on-surface-variant line-clamp-2 mt-1">
            {voucher.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant/30">
          <div className="text-[11px] text-on-surface-variant">
            <span>Đơn từ {formatCurrencyVND(voucher.minOrderValue)}</span>
            <span className="mx-1">•</span>
            <span>HSD: {voucher.endAt}</span>
            {!isEligible && (
              <p className="text-error text-[10px] font-semibold mt-0.5">
                Mua thêm {formatCurrencyVND(missingAmount)} để dùng
              </p>
            )}
          </div>

          <div>
            {isApplied ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl border border-emerald-400 text-emerald-700 bg-white hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Hủy áp dụng
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onApply(voucher.code)}
                disabled={isLoading || !isEligible}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isEligible
                    ? "bg-primary text-on-primary hover:bg-primary/90"
                    : "bg-surface-container text-outline cursor-not-allowed opacity-60"
                }`}
              >
                {isLoading ? "..." : "Áp dụng ngay"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherTicketCard;

