import React from "react";

export interface CartFreeShippingTrackerProps {
  totalItems: number;
  onGoBack?: () => void;
}

export const CartFreeShippingTracker: React.FC<CartFreeShippingTrackerProps> = ({
  totalItems,
  onGoBack,
}) => (
  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div className="flex flex-col gap-2">
      {onGoBack && (
        <button
          type="button"
          onClick={onGoBack}
          className="group inline-flex w-fit items-center gap-1.5 font-semibold text-on-surface-variant transition-colors hover:text-primary cursor-pointer"
          title="Quay lại trang trước"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          <span>Quay lại</span>
        </button>
      )}
      <div className="flex items-center gap-3">
        <h1 className="font-headline-xl text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Giỏ hàng của tôi
        </h1>
        <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed sm:text-sm">
          {totalItems} sản phẩm
        </span>
      </div>
    </div>
    <div className="flex w-full items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs md:max-w-md">
      <span className="material-symbols-outlined text-secondary">local_shipping</span>
      <p className="text-sm text-on-surface-variant">
        Chọn địa chỉ và phương thức vận chuyển để xem phí giao hàng chính xác.
      </p>
    </div>
  </div>
);

export default CartFreeShippingTracker;
