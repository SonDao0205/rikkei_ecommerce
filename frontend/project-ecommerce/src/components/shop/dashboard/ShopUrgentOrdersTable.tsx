import React from "react";
import { Link } from "react-router-dom";
import type { ShopUrgentOrder } from "../../../types/shop/shopDashboard.types";

interface ShopUrgentOrdersTableProps {
  orders: ShopUrgentOrder[];
  onConfirmOrder: (orderId: string) => void;
  onPrintLabel: (orderId: string) => void;
  onStatusFilterToggle?: () => void;
  activeStatusFilter?: string;
}

export const ShopUrgentOrdersTable: React.FC<ShopUrgentOrdersTableProps> = ({
  orders,
  onConfirmOrder,
  onPrintLabel,
  onStatusFilterToggle,
}) => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Đơn hàng khẩn cấp cần xử lý ngay
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Danh sách các đơn cần duyệt hoặc giao trước mốc ca nhận hàng
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={onStatusFilterToggle}
            className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors"
          >
            Lọc theo trạng thái
          </button>
          <Link
            to="/shop/orders"
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity"
          >
            Xem tất cả đơn (124)
          </Link>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
              <th className="py-3 px-4 rounded-l-lg">Mã đơn hàng</th>
              <th className="py-3 px-4">Khách hàng</th>
              <th className="py-3 px-4">Sản phẩm &amp; Qty</th>
              <th className="py-3 px-4">Tổng tiền &amp; Thanh toán</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 rounded-r-lg text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                  Không có đơn hàng khẩn cấp nào cần xử lý.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isPending = order.status === "PENDING_CONFIRMATION";
                const isPacking = order.status === "PACKING";
                const isHandedOver = order.status === "HANDED_OVER";

                const badgeBg = isPending
                  ? "bg-tertiary-fixed text-on-tertiary-fixed"
                  : isPacking
                  ? "bg-secondary-fixed text-on-secondary-fixed"
                  : "bg-surface-container-high text-on-surface";

                const dotBg = isPending
                  ? "bg-tertiary"
                  : isPacking
                  ? "bg-secondary"
                  : "bg-secondary";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-low/50 transition-colors"
                  >
                    {/* Order Code */}
                    <td className="py-3.5 px-4 font-semibold text-primary">
                      {order.orderCode}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">
                        {order.customerName}
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        {order.customerPhone} • {order.customerCity}
                      </div>
                    </td>

                    {/* Products & Qty */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium">
                        {order.productSummary}
                      </div>
                      <div className="font-body-sm text-body-sm text-outline">
                        {order.productVariant}
                      </div>
                    </td>

                    {/* Total Amount & Payment */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{order.formattedTotalAmount}</div>
                      {order.paymentBadgeType === "cod" ? (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-[10px] text-on-surface-variant">
                          COD
                        </span>
                      ) : (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px]">
                          {order.paymentMethod}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm ${badgeBg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />
                        {order.statusLabel}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onConfirmOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
                        >
                          Xác nhận ngay
                        </button>
                      )}

                      {isPacking && (
                        <button
                          type="button"
                          onClick={() => onPrintLabel(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
                        >
                          In vận đơn
                        </button>
                      )}

                      {isHandedOver && (
                        <button
                          type="button"
                          onClick={() => window.alert(`Mã vận đơn ${order.orderCode} đang được ĐVVC vận chuyển!`)}
                          className="px-3 py-1.5 rounded-lg text-secondary hover:bg-secondary-fixed/30 font-label-md text-label-md transition-colors flex items-center gap-1 ml-auto"
                        >
                          <span>Tra cứu lộ trình</span>
                          <span className="material-symbols-outlined text-[16px]">
                            open_in_new
                          </span>
                        </button>
                      )}
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
export default ShopUrgentOrdersTable;
