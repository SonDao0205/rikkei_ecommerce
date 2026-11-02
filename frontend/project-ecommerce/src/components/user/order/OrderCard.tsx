import React, { useState } from "react";
import { Link } from "react-router-dom";
import OrderItemRow from "./OrderItemRow";
import type { UserOrder } from "../../../types/ecommerce";

interface OrderCardProps {
  order: UserOrder;
  onCancelClick?: (order: UserOrder) => void;
  onConfirmReceived?: (orderId: number) => void;
  onRepurchase?: (order: UserOrder) => void;
  actionLoading?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancelClick,
  onConfirmReceived,
  onRepurchase,
  actionLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const isMultiShop = order.shops.length > 1;
  const displayedItems =
    isExpanded || order.items.length <= 2
      ? order.items
      : order.items.slice(0, 2);
  const remainingCount = order.items.length - 2;

  // Status badge styling
  const getStatusBadge = () => {
    switch (order.status) {
      case "pending":
        return "bg-amber-100 text-amber-900";
      case "packing":
        return "bg-blue-100 text-blue-900";
      case "shipping":
        return "bg-secondary-fixed text-on-secondary-fixed-variant";
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

  const cleanOrderCode = order.orderCode.replace(/^#/, "");
  const orderDetailUrl = `/profile/orders/${cleanOrderCode}`;

  return (
    <article className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md border border-outline-variant/40">
      {/* ================= CARD HEADER ================= */}
      <div className="p-4 bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20">
        {/* Left Side: Shop(s) Information */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0 flex-1">
          {isMultiShop ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[11px] font-bold flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[13px]">
                  hub
                </span>
                <span>Đơn đa gian hàng ({order.shops.length} Shops)</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {order.shops.map((shop) => (
                  <Link
                    key={shop.shopId}
                    to={`/shop/${shop.shopId}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-[11px] font-bold transition-colors border border-outline-variant/40"
                    title={`Đến xem gian hàng ${shop.shopName}`}
                  >
                    {shop.shopBadge && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          shop.shopBadge === "MALL"
                            ? "bg-tertiary-container text-on-tertiary"
                            : "bg-secondary-fixed text-on-secondary-fixed-variant"
                        }`}
                      >
                        {shop.shopBadge}
                      </span>
                    )}
                    <span className="truncate max-w-[120px]">{shop.shopName}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Single Shop Header */
            <div className="flex items-center gap-2.5 flex-wrap">
              {order.shops[0]?.shopBadge && (
                <span
                  className={`px-1.5 py-0.5 rounded font-label-sm text-[10px] font-bold tracking-wider ${
                    order.shops[0].shopBadge === "MALL"
                      ? "bg-tertiary-container text-on-tertiary"
                      : "bg-secondary-fixed text-on-secondary-fixed-variant"
                  }`}
                >
                  {order.shops[0].shopBadge}
                </span>
              )}
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                {order.shops[0]?.shopName || "Gian hàng đối tác"}
              </span>

              <button
                type="button"
                onClick={() =>
                  alert(`Bắt đầu chat với ${order.shops[0]?.shopName || "Shop"}`)
                }
                className="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px] text-primary">
                  chat
                </span>
                <span>Chat ngay</span>
              </button>

              {order.shops[0]?.shopId && (
                <Link
                  to={`/shop/${order.shops[0].shopId}`}
                  className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-[11px] transition-colors"
                >
                  Xem Shop
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Shipping status + Order status badge */}
        <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0 self-end sm:self-auto flex-wrap justify-end">
          {order.status === "shipping" && order.shippingInfoText && (
            <div className="flex items-center gap-1.5 text-secondary font-body-sm text-body-sm font-medium text-xs">
              <span className="material-symbols-outlined text-[18px]">
                local_shipping
              </span>
              <span>{order.shippingInfoText}</span>
            </div>
          )}

          {order.status === "completed" && order.shippingInfoText && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-body-sm text-body-sm font-medium text-xs">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              <span>{order.shippingInfoText}</span>
            </div>
          )}

          <span
            className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold uppercase tracking-wider whitespace-nowrap shadow-xs ${getStatusBadge()}`}
          >
            {order.statusLabel}
          </span>
        </div>
      </div>

      {/* ================= ITEMS BREAKDOWN ================= */}
      <div className="p-4 flex flex-col gap-1">
        {displayedItems.map((item, index) => (
          <OrderItemRow
            key={item.id || index}
            item={item}
            showShopHeader={isMultiShop}
          />
        ))}

        {/* EXPAND / COLLAPSE BUTTON FOR > 2 ITEMS */}
        {order.items.length > 2 && (
          <div className="pt-2">
            {!isExpanded ? (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low/70 hover:bg-surface-container text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-dashed border-primary/30 active:scale-99"
              >
                <span className="material-symbols-outlined text-[18px]">
                  keyboard_arrow_down
                </span>
                <span>
                  Xem thêm ({remainingCount} sản phẩm khác của đơn hàng này)
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-full py-2 px-4 rounded-xl bg-surface-container-low/40 hover:bg-surface-container text-on-surface-variant font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Thu gọn danh sách</span>
                <span className="material-symbols-outlined text-[18px]">
                  keyboard_arrow_up
                </span>
              </button>
            )}
          </div>
        )}

        {/* Cancellation Warning Banner (if cancelled) */}
        {order.status === "cancelled" && order.cancelReason && (
          <div className="mt-3 p-3 rounded-lg bg-tertiary-fixed/40 flex items-start gap-2.5 text-on-tertiary-fixed-variant">
            <span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5">
              info
            </span>
            <div className="flex flex-col text-body-sm font-body-sm">
              <span className="font-bold">Lý do hủy: {order.cancelReason}</span>
              <span className="text-[12px] opacity-90">
                {order.cancelledAt
                  ? `Hủy bởi Người mua lúc ${order.cancelledAt} • Đơn chưa bị trừ tiền.`
                  : "Đơn hàng đã được ghi nhận hủy thành công."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ================= CARD BOTTOM SUMMARY ================= */}
      <div className="px-4 py-3 bg-surface-container-low/20 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-outline-variant/20">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-outline text-[18px]">
            {order.paymentMethod === "COD" ? "payments" : "verified"}
          </span>
          <span>
            Thanh toán: <strong className="text-on-surface">{order.paymentStatusText}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Mã đơn:{" "}
            <Link
              to={orderDetailUrl}
              className="text-primary hover:underline font-bold font-mono"
              title="Bấm để xem chi tiết đơn hàng này"
            >
              {order.orderCode}
            </Link>
            {" | "}
            Thành tiền:
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-primary">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* ================= BOTTOM ACTION BUTTONS RAIL ================= */}
      <div className="p-4 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/15">
        {/* Left note / Order time */}
        {order.status === "pending" || order.status === "packing" ? (
          <span className="font-body-sm text-[12px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
            Người bán đang chuẩn bị đóng gói hàng
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-body-sm font-body-sm text-outline text-xs">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Đặt hàng lúc: {order.createdAt}</span>
          </div>
        )}

        {/* Right buttons rail */}
        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          {order.status === "shipping" && (
            <>
              <Link
                to={orderDetailUrl}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  location_searching
                </span>
                <span>Theo dõi đơn hàng</span>
              </Link>

              <button
                type="button"
                onClick={() =>
                  alert(`Liên hệ với bộ phận chăm sóc khách hàng về đơn ${order.orderCode}`)
                }
                className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Liên hệ Shop
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onConfirmReceived && onConfirmReceived(order.id)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Đã nhận được hàng
              </button>
            </>
          )}

          {order.status === "completed" && (
            <>
              <Link
                to={orderDetailUrl}
                className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1 cursor-pointer mr-2"
              >
                <span>Xem chi tiết hóa đơn VAT & đơn hàng</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>

              <button
                type="button"
                onClick={() => alert(`Mở đánh giá sản phẩm cho ${order.orderCode}`)}
                className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[16px] text-amber-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span>Đánh giá 5★</span>
              </button>

              <button
                type="button"
                onClick={() => onRepurchase && onRepurchase(order)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Mua lại</span>
              </button>
            </>
          )}

          {order.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => alert(`Yêu cầu đổi địa chỉ nhận hàng cho ${order.orderCode}`)}
                className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Thay đổi địa chỉ nhận
              </button>

              <button
                type="button"
                onClick={() => onCancelClick && onCancelClick(order)}
                className="px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-error-container hover:text-on-error-container text-error font-label-md text-label-md transition-colors cursor-pointer"
              >
                Hủy đơn hàng
              </button>

              <Link
                to={orderDetailUrl}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Chi tiết đơn hàng
              </Link>
            </>
          )}

          {order.status === "packing" && (
            <>
              <Link
                to={orderDetailUrl}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Chi tiết đơn hàng
              </Link>

              <button
                type="button"
                onClick={() =>
                  alert(`Liên hệ với bộ phận chăm sóc khách hàng về đơn ${order.orderCode}`)
                }
                className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Liên hệ Shop
              </button>

              <button
                type="button"
                onClick={() => onRepurchase && onRepurchase(order)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Mua lại</span>
              </button>
            </>
          )}

          {order.status === "cancelled" && (
            <>
              <Link
                to={orderDetailUrl}
                className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Xem chi tiết
              </Link>

              <button
                type="button"
                onClick={() => onRepurchase && onRepurchase(order)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Mua lại</span>
              </button>
            </>
          )}

          {order.status === "returned" && (
            <>
              <Link
                to={orderDetailUrl}
                className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                Xem chi tiết
              </Link>

              <button
                type="button"
                onClick={() => onRepurchase && onRepurchase(order)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Mua lại</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default OrderCard;
