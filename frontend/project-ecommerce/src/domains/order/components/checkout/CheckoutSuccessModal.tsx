import React from "react";
import { formatCurrencyVND } from "@/shared/utils/currency";

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  orderCode: string;
  totalAmount: number;
  shopNames: string[];
  shippingCarrier?: string;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  isOpen,
  orderCode,
  totalAmount,
  shopNames,
  shippingCarrier = "Giao Hàng Tiết Kiệm (GHTK)",
  onViewOrders,
  onContinueShopping,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        {/* Title & Order Code */}
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-xl sm:text-2xl text-on-surface">
            Đặt hàng thành công!
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Mã đơn hàng: <strong className="text-primary font-mono">{orderCode}</strong>
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
          Hệ thống đã thông báo cho{" "}
          <strong>{shopNames.join(", ") || "các cửa hàng"}</strong>. Đơn hàng của bạn sẽ sớm được đóng gói và bàn giao cho <strong>{shippingCarrier}</strong>.
        </p>

        <div className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-on-surface-variant font-medium">
            Số tiền thanh toán khi nhận hàng:
          </span>
          <span className="font-bold text-primary text-base sm:text-lg">
            {formatCurrencyVND(totalAmount)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={onViewOrders}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary-container transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>Xem chi tiết đơn hàng</span>
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full h-11 rounded-xl bg-surface-container text-on-surface font-semibold text-xs sm:text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessModal;

