import React from "react";

interface ShopVoucherHeaderProps {
  onOpenCreateModal: () => void;
  totalVouchers: number;
}

export const ShopVoucherHeader: React.FC<ShopVoucherHeaderProps> = ({
  onOpenCreateModal,
  totalVouchers,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Quản lý Voucher Gian hàng
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {totalVouchers} mã
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Thiết lập mã giảm giá, trợ giá vận chuyển để kích cầu mua sắm và gia tăng doanh số gian hàng.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Tạo Voucher Mới</span>
        </button>
      </div>
    </div>
  );
};

