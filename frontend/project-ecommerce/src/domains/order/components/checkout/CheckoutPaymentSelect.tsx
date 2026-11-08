import React from "react";
import type { CheckoutMethod } from "@/domains/customer/api/cartApi";

interface CheckoutPaymentSelectProps {
  paymentMethods: CheckoutMethod[];
  selectedPaymentId: number;
  onSelectPayment: (id: number) => void;
}

export const CheckoutPaymentSelect: React.FC<CheckoutPaymentSelectProps> = ({
  paymentMethods,
  selectedPaymentId,
  onSelectPayment,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            payments
          </span>
          <span className="font-bold text-xs sm:text-sm text-on-surface uppercase tracking-wide">
            Phương thức thanh toán (Payment Method)
          </span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          An toàn 100%
        </span>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        {paymentMethods.map((method) => {
          const isSelected = method.id === selectedPaymentId;
          const isCOD = method.code === "COD";

          return (
            <div
              key={method.id}
              onClick={() => onSelectPayment(method.id)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                isSelected
                  ? "bg-primary/5 border-primary ring-1 ring-primary shadow-xs"
                  : "bg-surface-container-low/40 border-outline-variant/60 hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-surface-container-lowest"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      {isCOD ? "payments" : "account_balance"}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-on-surface">
                      {method.name}
                    </span>
                  </div>
                </div>

                {isCOD && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">
                    Khuyên dùng
                  </span>
                )}
              </div>

              <p className="text-xs text-on-surface-variant pl-7 leading-relaxed">
                {isCOD
                  ? "Thanh toán bằng tiền mặt khi nhận hàng tận nơi. Kiểm tra hàng trước khi thanh toán, hoàn toàn an tâm không rủi ro."
                  : "Chuyển khoản qua ngân hàng nội địa hoặc quét mã VietQR tự động xác nhận đơn hàng nhanh chóng."}
              </p>

              {isCOD && (
                <div className="pl-7 flex items-center gap-4 pt-1 text-[11px] text-secondary font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      verified_user
                    </span>
                    <span>Đồng kiểm cùng shipper (Co-Check)</span>
                  </span>
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">
                      receipt_long
                    </span>
                    <span>Hóa đơn VAT đầy đủ</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Coming soon payment methods like in checkout.html */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low/30 border border-outline-variant/30 opacity-65 flex flex-col gap-1 cursor-not-allowed">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full border border-outline-variant bg-surface-container-lowest"></span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[22px]">
                  credit_card
                </span>
                <span className="font-semibold text-xs sm:text-sm text-on-surface">
                  Thẻ tín dụng / Ghi nợ & Ví điện tử (MoMo, VNPay-QR, ZaloPay)
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              Sắp ra mắt
            </span>
          </div>

          <p className="text-[11px] text-on-surface-variant pl-7">
            Cổng thanh toán online thẻ Visa/Mastercard và ví MoMo, ZaloPay, VNPay đang được hoàn thiện tích hợp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaymentSelect;

