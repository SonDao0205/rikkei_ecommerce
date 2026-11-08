import React from "react";
import type { ShopOrderFinancial } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderFinancialCardProps {
  financial: ShopOrderFinancial;
}

export const ShopOrderFinancialCard: React.FC<ShopOrderFinancialCardProps> = ({
  financial,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">payments</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Đối soát tài chính &amp; Doanh thu Shop
          </h2>
          <p className="font-body-sm text-body-sm text-outline">
            Dòng tiền thực nhận sau chiết khấu và phí sàn
          </p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-outline">
          <span>Tổng tiền hàng (Subtotal):</span>
          <span className="font-mono font-semibold text-on-surface">
            {financial.subtotal.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        {financial.shopDiscount > 0 && (
          <div className="flex items-center justify-between text-outline">
            <span>Giảm giá Voucher của Shop:</span>
            <span className="font-mono font-semibold text-error">
              -{financial.shopDiscount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-outline">
          <span>Phí vận chuyển khách thanh toán:</span>
          <span className="font-mono font-semibold text-on-surface">
            +{financial.shippingFee.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        {financial.platformDiscount > 0 && (
          <div className="flex items-center justify-between text-outline">
            <span>Mã giảm giá sàn tài trợ:</span>
            <span className="font-mono font-semibold text-secondary">
              -{financial.platformDiscount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 font-semibold text-on-surface">
          <span>Tổng người mua thanh toán:</span>
          <span className="font-mono font-bold text-primary">
            {financial.grandTotal.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        <div className="flex items-center justify-between text-outline text-xs">
          <span>Phí hoa hồng dịch vụ sàn (5%):</span>
          <span className="font-mono text-outline">
            -{financial.platformFee.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        {/* Shop Net Payout Box */}
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between mt-3">
          <div>
            <div className="font-bold text-xs sm:text-sm text-emerald-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-700">
                account_balance_wallet
              </span>
              Doanh thu thực nhận của Shop:
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Sẽ chuyển vào Ví Gian Hàng sau khi đơn giao thành công
            </div>
          </div>
          <span className="font-bold font-headline-lg text-lg sm:text-xl text-emerald-700 font-mono">
            {financial.formattedShopPayout}
          </span>
        </div>

        {/* Payment Method Badge */}
        <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface">Phương thức:</span>
            <span className="font-semibold px-2 py-0.5 rounded bg-surface-container-lowest text-primary shadow-2xs">
              {financial.paymentMethod}
            </span>
          </div>
          <span className="text-outline">{financial.paymentStatusLabel}</span>
        </div>
      </div>
    </div>
  );
};

