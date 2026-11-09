import React, { useState } from "react";
import { formatCurrencyVND } from "@/shared/utils/currency";

interface OrderOverviewMetaProps {
  orderCode: string;
  orderTime: string;
  paymentMethodName: string;
  totalAmount: number;
  totalSavings?: number;
}

export const OrderOverviewMeta: React.FC<OrderOverviewMetaProps> = ({
  orderCode,
  orderTime,
  paymentMethodName,
  totalAmount,
  totalSavings = 0,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/40 p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-outline-variant/30">
        {/* Col 1: Order Code */}
        <div className="flex flex-col lg:px-6 first:pl-0">
          <span className="text-[11px] uppercase tracking-wider text-outline mb-1 font-bold">
            Mã đơn hàng
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-on-surface tracking-tight font-mono">
              {orderCode}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors flex items-center justify-center cursor-pointer"
                title="Sao chép mã đơn"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? "done" : "content_copy"}
                </span>
              </button>
              {copied && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] rounded shadow-md pointer-events-none whitespace-nowrap z-10 animate-fade-in">
                  Đã sao chép!
                </div>
              )}
            </div>
          </div>
          <span className="text-xs text-outline mt-1">Đơn mua sắm trực tuyến</span>
        </div>

        {/* Col 2: Order Time */}
        <div className="flex flex-col lg:px-6">
          <span className="text-[11px] uppercase tracking-wider text-outline mb-1 font-bold">
            Thời gian đặt
          </span>
          <span className="font-bold text-base sm:text-lg text-on-surface">
            {orderTime}
          </span>
          <span className="text-xs text-outline mt-1">Múi giờ ICT (GMT+7)</span>
        </div>

        {/* Col 3: Payment Method */}
        <div className="flex flex-col lg:px-6">
          <span className="text-[11px] uppercase tracking-wider text-outline mb-1 font-bold">
            Phương thức
          </span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              local_atm
            </span>
            <span className="font-bold text-base sm:text-lg text-on-surface">
              {paymentMethodName}
            </span>
          </div>
          <span className="text-xs text-outline mt-1">Thanh toán khi nhận hàng</span>
        </div>

        {/* Col 4: Total Amount */}
        <div className="flex flex-col lg:px-6 last:pr-0">
          <span className="text-[11px] uppercase tracking-wider text-outline mb-1 font-bold">
            Tổng thanh toán
          </span>
          <span className="font-bold text-xl sm:text-2xl text-primary tracking-tight">
            {formatCurrencyVND(totalAmount)}
          </span>
          {totalSavings > 0 ? (
            <span className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">savings</span>
              <span>Đã tiết kiệm {formatCurrencyVND(totalSavings)}</span>
            </span>
          ) : (
            <span className="text-xs text-outline mt-1">Đã bao gồm thuế VAT</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderOverviewMeta;

