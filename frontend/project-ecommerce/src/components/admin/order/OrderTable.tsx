import React from "react";
import { Link } from "react-router-dom";
import type { AdminOrderItem } from "../../../types/ecommerce";

interface OrderTableProps {
  orders: AdminOrderItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetail: (order: AdminOrderItem) => void;
  onPrintOrder: (order: AdminOrderItem) => void;
  onTrackOrder: (order: AdminOrderItem) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onViewDetail,
  onPrintOrder,
  onTrackOrder,
}) => {
  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));

  const renderStatusBadge = (status: AdminOrderItem["status"], label: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
            {label}
          </span>
        );
      case "shipping":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {label}
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            {label}
          </span>
        );
      case "packing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            {label}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            {label}
          </span>
        );
      default:
        return <span>{label}</span>;
    }
  };

  const renderPaymentBadge = (method: AdminOrderItem["paymentMethod"]) => {
    if (method === "COD") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold">
          <span className="material-symbols-outlined text-[15px] text-tertiary">payments</span>
          COD
        </span>
      );
    }
    if (method === "MOMO") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
          <span className="material-symbols-outlined text-[15px] text-secondary">
            account_balance_wallet
          </span>
          MoMo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
        <span className="material-symbols-outlined text-[15px] text-primary">credit_card</span>
        Visa
      </span>
    );
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md select-none border-b border-surface-container-high/60">
              <th className="py-4 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-4 px-3 min-w-[140px]">Mã Đơn / Order ID</th>
              <th className="py-4 px-3 min-w-[130px]">Thời Gian / Date</th>
              <th className="py-4 px-3 min-w-[180px]">Khách Hàng / Customer</th>
              <th className="py-4 px-3 min-w-[200px]">Cửa Hàng &amp; Sản Phẩm</th>
              <th className="py-4 px-3 min-w-[120px]">Thanh Toán</th>
              <th className="py-4 px-3 text-right min-w-[140px]">Tổng Tiền &amp; COD</th>
              <th className="py-4 px-3 text-center min-w-[140px]">Trạng Thái</th>
              <th className="py-4 pr-6 pl-3 text-right min-w-[180px]">Thao Tác / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/60 font-body-sm text-body-sm text-on-surface">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                  Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                const isCancelled = order.status === "cancelled";

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-surface-container-low transition-colors ${
                      isCancelled ? "opacity-75" : ""
                    } ${isSelected ? "bg-surface-container-low/60" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 pl-4 pr-2 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(order.id)}
                        className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Order ID */}
                    <td className="py-4 px-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/admin/orders/${order.id.replace('#', '')}`}
                            className="font-headline-md text-headline-md tracking-tight font-bold text-primary hover:underline cursor-pointer"
                          >
                            {order.id}
                          </Link>
                          {order.hasCodAlert && (
                            <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold scale-90 origin-left">
                              COD Alert
                            </span>
                          )}
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          {order.source}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {order.createdAt}
                        </span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>{" "}
                          {order.timeAgo}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">
                          {order.customer.name}
                        </span>
                        <span className="font-mono text-on-surface-variant text-[11px]">
                          {order.customer.phone}
                        </span>
                        <span
                          className="text-on-surface-variant font-label-sm text-label-sm truncate max-w-[200px]"
                          title={order.customer.address}
                        >
                          {order.customer.address}
                        </span>
                      </div>
                    </td>

                    {/* Shop & Product */}
                    <td className="py-4 px-3 align-middle">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-primary truncate">
                          {order.shopName}
                        </span>
                        <span className="text-on-surface-variant text-label-sm truncate max-w-[200px]">
                          {order.productSummary}
                        </span>
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-3 align-middle">
                      {renderPaymentBadge(order.paymentMethod)}
                    </td>

                    {/* Total Amount & COD */}
                    <td className="py-4 px-3 align-middle text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface font-mono">
                          {order.formattedTotal}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm font-medium ${
                            order.paymentMethod === "COD"
                              ? isCancelled
                                ? "text-error"
                                : order.status === "delivered"
                                ? "text-surface-tint"
                                : "text-tertiary"
                              : "text-secondary"
                          }`}
                        >
                          {order.paymentNote}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 align-middle text-center">
                      {renderStatusBadge(order.status, order.statusLabel)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onViewDetail(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-all cursor-pointer"
                          title="Xem nhanh chi tiết"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Xem nhanh</span>
                        </button>
                        <Link
                          to={`/admin/orders/${order.id.replace('#', '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:opacity-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          <span>Chi tiết</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onPrintOrder(order)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          title="In phiếu đơn"
                        >
                          <span className="material-symbols-outlined text-[18px]">print</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onTrackOrder(order)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          title={`Mã vận đơn: ${order.trackingCode || order.courierLabel}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            local_shipping
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
