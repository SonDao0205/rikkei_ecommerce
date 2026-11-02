import React from "react";
import { Link } from "react-router-dom";
import type { UserOrder } from "../../../../types/ecommerce";

export interface OrderDetailHeaderProps {
  order: UserOrder;
  onPrintInvoice?: () => void;
  onChatWithShop?: () => void;
  onChatShop?: () => void;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
  order,
  onPrintInvoice = () => window.print(),
  onChatWithShop,
  onChatShop,
}) => {
  const getStatusBadge = () => {
    switch (order.status) {
      case "pending":
        return "bg-amber-100 text-amber-900";
      case "packing":
        return "bg-blue-100 text-blue-900";
      case "shipping":
        return "bg-secondary-fixed text-on-secondary-fixed";
      case "completed":
        return "bg-emerald-100 text-emerald-900";
      case "cancelled":
        return "bg-surface-container-high text-on-surface-variant";
      case "returned":
        return "bg-purple-100 text-purple-900";
      default:
        return "bg-surface-container text-on-surface";
    }
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-outline font-label-md text-label-md flex-wrap"
        >
          <Link
            to="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Trang chủ</span>
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            to="/profile"
            className="hover:text-primary transition-colors"
          >
            Tài khoản của tôi
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            to="/profile/orders"
            className="hover:text-primary transition-colors"
          >
            Lịch sử đơn hàng
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-xs sm:max-w-md">
            Chi tiết đơn {order.orderCode}
          </span>
        </nav>

        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại danh sách đơn</span>
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Chi tiết đơn hàng {order.orderCode}
            </h1>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold shadow-xs uppercase tracking-wider ${getStatusBadge()}`}
            >
              {order.status === "shipping" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
              )}
              {order.status === "packing" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
              )}
              <span>{order.statusLabel}</span>
            </div>
          </div>

          <p className="font-body-md text-body-md text-outline flex items-center gap-2 flex-wrap text-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Đặt lúc {order.createdAt}</span>
            </span>
            <span>•</span>
            <span className="text-primary font-medium">
              {order.updatedAtText || "Cập nhật gần đây"}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onPrintInvoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>In hóa đơn VAT</span>
          </button>

          <button
            type="button"
            onClick={
              onChatWithShop ||
              onChatShop ||
              (() =>
                alert(
                  `Bắt đầu kết nối trò chuyện với người bán của đơn hàng ${order.orderCode}`
                ))
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Chat với Shop</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderDetailHeader;
