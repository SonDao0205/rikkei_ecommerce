import React from "react";
import { formatCurrencyVND } from "../../utils/currency";

export interface CartFreeShippingTrackerProps {
  totalItems: number;
  freeShippingThreshold: number;
  progress: number;
  amountLeft: number;
  isEligible: boolean;
  onGoBack?: () => void;
}

export const CartFreeShippingTracker: React.FC<CartFreeShippingTrackerProps> = ({
  totalItems,
  freeShippingThreshold,
  progress,
  amountLeft,
  isEligible,
  onGoBack,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col gap-2">
        {onGoBack && (
          <div>
            <button
              type="button"
              onClick={onGoBack}
              className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md font-semibold transition-colors cursor-pointer group w-fit"
              title="Quay lại trang trước"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Quay lại</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
            Giỏ hàng của tôi
          </h1>
          <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs sm:text-sm font-bold">
            {totalItems} {totalItems === 1 ? "sản phẩm" : "sản phẩm"}
          </span>
        </div>
      </div>

      {/* Free Shipping Progress Tracker */}
      <div className="flex flex-col gap-1.5 w-full md:max-w-md bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/60 shadow-xs">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-bold text-on-surface">
            <span className="material-symbols-outlined text-secondary text-[18px]">
              local_shipping
            </span>
            {isEligible ? (
              <span className="text-secondary font-bold">
                🎉 Bạn đã đủ điều kiện được Miễn phí giao hàng!
              </span>
            ) : (
              <span>
                Mua thêm{" "}
                <strong className="text-primary font-bold">
                  {formatCurrencyVND(amountLeft)}
                </strong>{" "}
                để nhận Freeship
              </span>
            )}
          </div>
          <span className="text-outline text-xs font-semibold">
            Đơn từ {formatCurrencyVND(freeShippingThreshold)}
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isEligible
                ? "bg-gradient-to-r from-secondary to-green-500"
                : "bg-primary-container"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CartFreeShippingTracker;
