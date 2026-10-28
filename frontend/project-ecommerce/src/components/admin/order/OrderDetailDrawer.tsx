import React from "react";
import type { AdminOrderItem } from "../../../types/ecommerce";

interface OrderDetailDrawerProps {
  order: AdminOrderItem | null;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onPrint: (order: AdminOrderItem) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  onClose,
  onConfirm,
  onCancel,
  onPrint,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-surface-container-high/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {order.id}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                  {order.courierLabel}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {order.source} • {order.createdAt} ({order.timeAgo})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
            {/* Status Card */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  Trạng Thái Hiện Tại
                </span>
                <p className="font-headline-sm text-lg font-bold text-on-surface mt-1">
                  {order.statusLabel}
                </p>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  Mã Vận Đơn
                </span>
                <p className="font-mono text-sm font-bold text-primary mt-1">
                  {order.trackingCode || "Chưa tạo mã"}
                </p>
              </div>
            </div>

            {/* Customer & Address Card */}
            <div className="flex flex-col gap-2">
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                Thông Tin Người Nhận
              </h3>
              <div className="p-4 rounded-xl bg-surface-container-low/50 border border-surface-container-high/40 flex flex-col gap-2">
                <div className="flex justify-between items-center text-body-md text-on-surface">
                  <span className="font-bold">{order.customer.name}</span>
                  <span className="font-mono text-primary font-semibold">
                    {order.customer.phone}
                  </span>
                </div>
                <div className="text-body-sm text-on-surface-variant flex items-start gap-1.5 pt-1 border-t border-surface-container-high/40">
                  <span className="material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5">
                    location_on
                  </span>
                  <span>{order.customer.address}</span>
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="flex flex-col gap-2">
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  shopping_cart
                </span>
                Chi Tiết Sản Phẩm ({order.shopName})
              </h3>
              <div className="divide-y divide-surface-container-high/50 border border-surface-container-high/50 rounded-xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {item.name}
                      </span>
                      {item.sku && (
                        <span className="font-mono text-[11px] text-outline">{item.sku}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-body-md font-bold text-on-surface">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </span>
                      <span className="text-outline text-xs block font-mono">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Financial Summary */}
            <div className="flex flex-col gap-2">
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  receipt_long
                </span>
                Chi Phí &amp; Thanh Toán
              </h3>
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2.5">
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Phương thức</span>
                  <span className="font-semibold text-on-surface">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Tình trạng COD</span>
                  <span className="font-medium text-tertiary">{order.paymentNote}</span>
                </div>
                <div className="flex justify-between text-body-sm text-on-surface-variant">
                  <span>Phí vận chuyển ({order.courierLabel})</span>
                  <span className="font-mono font-medium text-on-surface">Miễn phí</span>
                </div>
                <div className="pt-2 border-t border-surface-container-high/60 flex justify-between items-baseline">
                  <span className="font-label-lg font-bold text-on-surface">Tổng cộng</span>
                  <span className="font-headline-md font-bold text-primary font-mono text-xl">
                    {order.formattedTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="p-6 border-t border-surface-container-high/60 bg-surface-container-low/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPrint(order)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                In phiếu
              </button>
              {order.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => onCancel(order.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl hover:bg-error-container text-error font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Hủy đơn
                </button>
              )}
            </div>

            {order.status === "pending" && (
              <button
                type="button"
                onClick={() => onConfirm(order.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Xác nhận đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailDrawer;
