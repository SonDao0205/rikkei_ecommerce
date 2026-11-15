import React from "react";
import { Link } from "react-router-dom";
import type { ShopOrderItem, ShopOrderStatus } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderTableProps {
  orders: ShopOrderItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onConfirmOrder: (id: string) => void;
  onDispatchOrder: (id: string) => void;
  onCancelOrder: (id: string) => void;
  onOpenQuickDetail: (order: ShopOrderItem) => void;
}

const getStatusBadge = (status: ShopOrderStatus, label: string) => {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error/10 text-error font-label-sm text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
          {label}
        </span>
      );
    case "packing":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-label-sm text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {label}
        </span>
      );
    case "shipping":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-label-sm text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          {label}
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {label}
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-label-sm text-[11px] font-bold">
          {label}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-outline font-label-sm text-[11px]">
          {label}
        </span>
      );
  }
};

export const ShopOrderTable: React.FC<ShopOrderTableProps> = ({
  orders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onConfirmOrder,
  onDispatchOrder,
  onCancelOrder,
  onOpenQuickDetail,
}) => {
  const safeOrders = orders ?? [];
  const isAllSelected = safeOrders.length > 0 && selectedIds.length === safeOrders.length;

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép: ${text}`);
  };

  if (safeOrders.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-[48px] text-outline mb-2">
          inventory
        </span>
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
          Không tìm thấy đơn hàng nào
        </h3>
        <p className="font-body-md text-body-md text-outline max-w-sm mt-1">
          Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
      <table className="w-full text-left font-body-sm text-body-sm">
        <thead>
          <tr className="bg-surface-container-low font-label-md text-label-md text-on-surface border-b border-outline-variant/30">
            <th className="py-3.5 px-4 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
              />
            </th>
            <th className="py-3.5 px-3 min-w-[140px]">Mã đơn &amp; Thời gian</th>
            <th className="py-3.5 px-3 min-w-[180px]">Người nhận &amp; Địa chỉ</th>
            <th className="py-3.5 px-3 min-w-[220px]">Sản phẩm &amp; Phân loại</th>
            <th className="py-3.5 px-3 min-w-[160px]">Đơn vị vận chuyển</th>
            <th className="py-3.5 px-3 min-w-[150px] text-right">Thực nhận / Tổng</th>
            <th className="py-3.5 px-3 text-center min-w-[130px]">Trạng thái</th>
            <th className="py-3.5 px-4 text-center min-w-[170px]">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 text-on-surface">
          {safeOrders.map((order) => {
            const isSelected = selectedIds.includes(order.id);
            const items = order.items ?? [];
            const firstItem = items[0];

            return (
              <tr
                key={order.id}
                className={`hover:bg-surface-container-low/60 transition-colors ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                {/* Checkbox */}
                <td className="py-4 px-4 align-top">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(order.id)}
                    className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer mt-1"
                  />
                </td>

                {/* Order Code & Time */}
                <td className="py-4 px-3 align-top">
                  <div className="flex flex-col gap-1">
                    <Link
                      to={`/shop/orders/${order.orderCode}`}
                      className="font-label-md text-label-md font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{order.id}</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </Link>
                    <span className="text-xs text-outline">{order.createdAt}</span>
                    <span className="text-[11px] text-outline-variant font-mono">
                      {order.timeAgo}
                    </span>
                  </div>
                </td>

                {/* Recipient */}
                <td className="py-4 px-3 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-on-surface text-sm">
                      {order.customer.name}
                    </span>
                    <span className="text-xs text-outline font-mono">
                      {order.customer.phone}
                    </span>
                    <span
                      className="text-xs text-outline line-clamp-2 max-w-[200px]"
                      title={order.customer.address}
                    >
                      {order.customer.address}
                    </span>
                    {order.customer.buyerNote && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 line-clamp-1">
                        Ghi chú: {order.customer.buyerNote}
                      </span>
                    )}
                  </div>
                </td>

                {/* Products */}
                <td className="py-4 px-3 align-top">
                  <div className="flex items-start gap-2.5 max-w-[260px]">
                    {firstItem && (
                      <img
                        src={firstItem.imageUrl}
                        alt={firstItem.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-outline-variant/30"
                      />
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-xs text-on-surface line-clamp-2">
                        {firstItem?.name}
                      </span>
                      <span className="text-[11px] text-outline truncate">
                        Phân loại: {firstItem?.variant}
                      </span>
                      <span className="text-xs font-mono text-outline">
                        x{firstItem?.quantity} {items.length > 1 && `(+${items.length - 1} món khác)`}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Courier & Tracking */}
                <td className="py-4 px-3 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-xs text-on-surface">
                      {order.shipping.courierLabel}
                    </span>
                    <div className="inline-flex items-center gap-1 font-mono text-xs text-primary bg-surface-container px-2 py-0.5 rounded-md w-max">
                      <span>{order.shipping.trackingCode}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, order.shipping.trackingCode)}
                        className="hover:text-primary-container"
                        title="Sao chép mã vận đơn"
                      >
                        <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-outline">
                      Dự kiến: {order.shipping.estimatedDeliveryDate}
                    </span>
                  </div>
                </td>

                {/* Financial: Payout & Total */}
                <td className="py-4 px-3 align-top text-right">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-emerald-700">
                      {order.financial.formattedShopPayout}
                    </span>
                    <span className="text-xs text-outline line-through">
                      Tổng: {order.financial.grandTotal.toLocaleString("vi-VN")} ₫
                    </span>
                    <span className="text-[11px] text-outline font-semibold">
                      {order.financial.paymentMethod}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-3 align-top text-center">
                  {getStatusBadge(order.status, order.statusLabel)}
                </td>

                {/* Actions */}
                <td className="py-4 px-4 align-top text-center">
                  <div className="flex flex-col gap-1.5 items-center">
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onConfirmOrder(order.id)}
                        className="w-full px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        Xác nhận đơn
                      </button>
                    )}

                    {order.status === "packing" && (
                      <button
                        type="button"
                        onClick={() => onDispatchOrder(order.id)}
                        className="w-full px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-label-sm text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">{order.workflowStatus === "CONFIRMED" ? "inventory_2" : "local_shipping"}</span>
                        {order.workflowStatus === "CONFIRMED" ? "Bắt đầu đóng gói" : "Bàn giao vận chuyển"}
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/shop/orders/${order.orderCode}`}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs transition-colors"
                      >
                        Xem chi tiết
                      </Link>

                      <button
                        type="button"
                        onClick={() => onOpenQuickDetail(order)}
                        className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
                        title="Xem nhanh"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>

                      {order.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => onCancelOrder(order.id)}
                          className="p-1 rounded-lg text-error hover:bg-error/10"
                          title="Huỷ đơn hàng"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

