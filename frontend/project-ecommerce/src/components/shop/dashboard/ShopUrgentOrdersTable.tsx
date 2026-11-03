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
  activeStatusFilter = "ALL",
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 space-y-5 mt-6">
      {/* Table Header matching Admin Tables */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              Đơn hàng khẩn cấp cần xử lý ngay
            </h2>
            {activeStatusFilter !== "ALL" && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-primary/10 text-primary">
                Lọc: {activeStatusFilter}
              </span>
            )}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Danh sách các đơn cần duyệt hoặc giao trước mốc ca nhận hàng của đơn vị vận chuyển
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onStatusFilterToggle}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors border border-outline-variant/30 cursor-pointer"
          >
            Lọc theo trạng thái
          </button>
          <Link
            to="/shop/orders"
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
          >
            Xem tất cả đơn (124)
          </Link>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider font-semibold border-b border-outline-variant/30">
              <th className="py-3 px-4 rounded-l-lg">Mã đơn hàng</th>
              <th className="py-3 px-4">Khách hàng</th>
              <th className="py-3 px-4">Sản phẩm &amp; Qty</th>
              <th className="py-3 px-4">Tổng tiền &amp; Thanh toán</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 rounded-r-lg text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm text-on-surface">
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
                  ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                  : isPacking
                  ? "bg-sky-50 text-sky-700 border border-sky-200/50"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/50";

                const dotBg = isPending
                  ? "bg-amber-500"
                  : isPacking
                  ? "bg-sky-500"
                  : "bg-emerald-500";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-low/60 transition-colors"
                  >
                    {/* Order Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {order.orderCode}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">
                        {order.customerName}
                      </div>
                      <div className="font-body-sm text-xs text-on-surface-variant font-mono">
                        {order.customerPhone} • {order.customerCity}
                      </div>
                    </td>

                    {/* Products & Qty */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-on-surface">
                        {order.productSummary}
                      </div>
                      <div className="text-xs text-outline font-medium">
                        {order.productVariant}
                      </div>
                    </td>

                    {/* Total Amount & Payment */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-on-surface">
                        {order.formattedTotalAmount}
                      </div>
                      {order.paymentBadgeType === "cod" ? (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-surface-container font-mono text-[10px] text-on-surface-variant font-semibold">
                          COD
                        </span>
                      ) : (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-mono text-[10px] font-semibold">
                          {order.paymentMethod}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold ${badgeBg}`}
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
                          className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
                        >
                          Xác nhận ngay
                        </button>
                      )}

                      {isPacking && (
                        <button
                          type="button"
                          onClick={() => onPrintLabel(order.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors border border-outline-variant/30 cursor-pointer"
                        >
                          In vận đơn
                        </button>
                      )}

                      {isHandedOver && (
                        <button
                          type="button"
                          onClick={() => window.alert(`Mã vận đơn ${order.orderCode} đang được ĐVVC vận chuyển!`)}
                          className="px-3 py-1.5 rounded-lg text-secondary hover:bg-secondary-fixed/30 font-label-md text-label-md font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
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
