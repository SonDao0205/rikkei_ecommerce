import React from 'react';
import type { UserOrder } from '@/shared/types';

interface OrderDetailPriceSummaryProps {
  order: UserOrder;
  onContactSupport?: () => void;
}

export const OrderDetailPriceSummary: React.FC<OrderDetailPriceSummaryProps> = ({
  order,
  onContactSupport,
}) => {
  const formatCurrency = (val: number) => `${val.toLocaleString('vi-VN')} ₫`;

  // Calculate total items
  const totalItemsCount = (order.items || []).reduce((acc, curr) => acc + curr.quantity, 0);

  // Subtotal of items
  const subtotal = (order.items || []).reduce(
    (acc, curr) => acc + (curr.unitPrice ?? 0) * curr.quantity,
    0
  );

  const shippingFee = order.shippingFee || 30000;
  const shippingDiscount = order.shippingDiscount || (shippingFee > 0 ? 25000 : 0);
  const shopDiscount = order.shopDiscount || 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Policies & Assurance Box (Left 5 Cols) */}
      <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">policy</span>
            Quyền lợi người mua MarketPulse
          </h3>
          <ul className="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                check_circle
              </span>
              <span>
                <strong>Đồng kiểm khi nhận:</strong> Quý khách được mở hộp kiểm tra số lượng và mẫu mã trước khi thanh toán cho shipper.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                published_with_changes
              </span>
              <span>
                <strong>15 ngày đổi trả miễn phí:</strong> Đổi trả nhanh chóng nếu sản phẩm có lỗi từ nhà sản xuất hoặc không vừa kích cỡ.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                shield_with_heart
              </span>
              <span>
                <strong>100% Chính hãng:</strong> Bồi thường gấp đôi nếu phát hiện hàng giả, hàng nhái từ gian hàng Official Mall.
              </span>
            </li>
          </ul>
        </div>
        <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
          <span className="font-label-md text-label-md text-outline">Cần hỗ trợ đơn này?</span>
          <button
            type="button"
            onClick={onContactSupport}
            className="font-label-md text-label-md text-primary font-bold hover:underline"
          >
            Liên hệ tổng đài viên →
          </button>
        </div>
      </div>

      {/* Financial Calculation (Right 7 Cols) */}
      <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
        <div className="flex flex-col gap-3.5">
          <h3 className="font-headline-md text-headline-md text-on-surface pb-2">Chi tiết thanh toán</h3>
          
          <div className="flex items-center justify-between font-body-md text-body-md">
            <span className="text-on-surface-variant">
              Tổng tiền hàng ({totalItemsCount} sản phẩm)
            </span>
            <span className="font-medium text-on-surface">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between font-body-md text-body-md">
            <span className="text-on-surface-variant">
              Phí vận chuyển ({order.shippingCarrier || 'GHN Tiêu chuẩn'})
            </span>
            <span className="font-medium text-on-surface">{formatCurrency(shippingFee)}</span>
          </div>

          {shippingDiscount > 0 && (
            <div className="flex items-center justify-between font-body-md text-body-md">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="material-symbols-outlined text-[18px]">local_activity</span>
                <span>Giảm giá vận chuyển (Freeship Extra)</span>
              </div>
              <span className="font-medium text-secondary">-{formatCurrency(shippingDiscount)}</span>
            </div>
          )}

          {shopDiscount > 0 && (
            <div className="flex items-center justify-between font-body-md text-body-md">
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="material-symbols-outlined text-[18px]">sell</span>
                <span>Voucher giảm giá gian hàng</span>
              </div>
              <span className="font-medium text-tertiary">-{formatCurrency(shopDiscount)}</span>
            </div>
          )}

          <div className="my-2 h-px bg-surface-container-high" />

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                {order.paymentMethod === 'COD' ? 'Tổng thanh toán COD:' : 'Tổng giá trị đơn hàng:'}
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Đã bao gồm VAT và không phát sinh thêm phụ phí
              </span>
            </div>
            <span className="font-display-lg-mobile sm:font-display-lg text-display-lg-mobile sm:text-display-lg text-primary font-bold tracking-tight">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
