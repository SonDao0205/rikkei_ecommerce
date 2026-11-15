import React from "react";
import { Link } from "react-router-dom";
import type { ShopOrderItem } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderDetailDrawerProps {
  order: ShopOrderItem | null;
  onClose: () => void;
  onConfirmOrder: (id: string) => void;
  onDispatchOrder: (id: string) => void;
}

export const ShopOrderDetailDrawer: React.FC<ShopOrderDetailDrawerProps> = ({
  order,
  onClose,
  onConfirmOrder,
  onDispatchOrder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between border-l border-outline-variant/30 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold font-headline-md text-headline-md text-on-surface">
                {order.id}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-xs font-bold">
                {order.statusLabel}
              </span>
            </div>
            <p className="text-xs text-outline mt-0.5">
              Tạo lúc {order.createdAt} {order.createdAtTime} • {order.timeAgo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Customer */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
            <div className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">person</span>
              Người nhận hàng
            </div>
            <div className="text-xs space-y-1 text-on-surface">
              <p className="font-semibold">{order.customer.name} • {order.customer.phone}</p>
              <p className="text-outline">{order.customer.address}</p>
              {order.customer.buyerNote && (
                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                  Ghi chú: {order.customer.buyerNote}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between">
              <span>Sản phẩm ({order.items.length})</span>
              <span className="text-xs text-outline">{order.totalQuantity} món</span>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-container-low/60 flex items-center justify-between gap-3 border border-outline-variant/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-outline-variant/30"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-on-surface line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-outline">{item.variant}</p>
                      <p className="text-[11px] text-outline font-mono">
                        {item.formattedPrice} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-on-surface whitespace-nowrap">
                    {item.formattedTotal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-outline">Đơn vị vận chuyển:</span>
              <span className="font-semibold text-on-surface">{order.shipping.courierLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Mã vận đơn:</span>
              <span className="font-mono font-bold text-primary">{order.shipping.trackingCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Phương thức thanh toán:</span>
              <span className="font-semibold text-on-surface">{order.financial.paymentMethod}</span>
            </div>
            <div className="border-t border-outline-variant/20 pt-2 flex items-center justify-between font-bold">
              <span className="text-on-surface">Thực nhận của Shop:</span>
              <span className="text-emerald-700 text-sm">{order.financial.formattedShopPayout}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between gap-3">
          <Link
            to={`/shop/orders/${order.orderCode}`}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold"
          >
            Mở toàn màn hình
          </Link>

          <div className="flex items-center gap-2">
            {order.status === "pending" && (
              <button
                type="button"
                onClick={() => {
                  onConfirmOrder(order.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận đơn ngay
              </button>
            )}

            {order.status === "packing" && (
              <button
                type="button"
                onClick={() => {
                  onDispatchOrder(order.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-label-md text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">{order.workflowStatus === "CONFIRMED" ? "inventory_2" : "local_shipping"}</span>
                {order.workflowStatus === "CONFIRMED" ? "Bắt đầu đóng gói" : "Bàn giao vận chuyển"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

