import React from "react";
import type { OrderDetailFinancial } from "../../../../types/ecommerce";

interface OrderFinancialCardProps {
  financial: OrderDetailFinancial;
}

export const OrderFinancialCard: React.FC<OrderFinancialCardProps> = ({
  financial,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + " ₫";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Bảng Tính tiền &amp; Đối soát Thanh toán
            </h3>
            <p className="text-xs text-slate-500">
              Chi tiết phân bổ dòng tiền, phí vận chuyển và công nợ COD
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
          Hình thức: COD (Thu tiền khi nhận)
        </span>
      </div>

      {/* Breakdown & Grand Total Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: Detailed Line Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1 text-slate-600">
            <span>Tạm tính tiền hàng (Subtotal):</span>
            <span className="font-bold text-slate-900 tabular-nums text-sm">
              {formatCurrency(financial.subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Phí vận chuyển nội thành:</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                {financial.shippingRegion}
              </span>
            </div>
            <span className="font-semibold text-slate-800 tabular-nums">
              + {formatCurrency(financial.shippingFee)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Phí bảo hiểm hàng hóa:</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                {financial.insuranceLabel}
              </span>
            </div>
            <span className="font-semibold text-slate-800 tabular-nums">
              + {formatCurrency(financial.insuranceFee)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span>Voucher sàn trợ giá:</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">
                {financial.voucherCode}
              </span>
            </div>
            <span className="font-medium text-slate-400 tabular-nums">
              {financial.voucherDiscount > 0
                ? `- ${formatCurrency(financial.voucherDiscount)}`
                : "- 0 ₫ (Không áp dụng)"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-600">
            <span>Chiết khấu đối tác thương mại:</span>
            <span className="font-medium text-slate-400 tabular-nums">
              {formatCurrency(financial.partnerDiscount)}
            </span>
          </div>
        </div>

        {/* Right: Highlighted Grand Total Card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-white border border-indigo-100/80 flex flex-col justify-between gap-4 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              TỔNG TIỀN THU HỘ COD (GRAND TOTAL)
            </span>
            <div className="font-display text-3xl font-extrabold text-indigo-700 tabular-nums tracking-tight mt-1">
              {formatCurrency(financial.grandTotal)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {financial.paymentNote ||
                "Đơn vị vận chuyển GHTK chịu trách nhiệm thu hộ và đối soát chu kỳ T+2 vào tài khoản định danh sàn."}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Trạng thái thanh toán:</span>
            <span
              className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded ${
                financial.paymentStatusType === "emerald"
                  ? "text-emerald-700 bg-emerald-50"
                  : financial.paymentStatusType === "rose"
                  ? "text-rose-700 bg-rose-50"
                  : "text-amber-700 bg-amber-50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  financial.paymentStatusType === "emerald"
                    ? "bg-emerald-500"
                    : financial.paymentStatusType === "rose"
                    ? "bg-rose-500"
                    : "bg-amber-500"
                }`}
              />
              {financial.paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFinancialCard;
