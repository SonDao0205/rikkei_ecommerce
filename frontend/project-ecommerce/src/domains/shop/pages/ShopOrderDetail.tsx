import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ShopLayout from "@/app/layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchShopOrderDetailThunk,
  confirmShopOrderThunk,
  startPackingShopOrderThunk,
  dispatchShopOrderThunk,
  cancelShopOrderThunk,
} from "@/domains/shop/state/shopOrderSlice";
import {
  ShopOrderItemsCard,
  ShopOrderFinancialCard,
  ShopOrderCustomerCard,
  ShopOrderShippingCard,
} from "@/domains/shop/components/order";

export const ShopOrderDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orderId = id ? (id.startsWith("#") ? id : `#${id}`) : "#ORD-9821";

  const { currentOrderDetail, isDetailLoading, error } = useAppSelector(
    (state) => state.shopOrder
  );

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    dispatch(fetchShopOrderDetailThunk(orderId));
  }, [dispatch, orderId]);

  const handleConfirm = async () => {
    if (!currentOrderDetail) return;
    const res = await dispatch(confirmShopOrderThunk(currentOrderDetail.id));
    if (confirmShopOrderThunk.fulfilled.match(res)) {
      showToast(`Đã xác nhận đơn hàng ${currentOrderDetail.id}!`);
    } else {
      showToast("Lỗi xác nhận đơn hàng", true);
    }
  };

  const handleDispatch = async () => {
    if (!currentOrderDetail) return;
    if (currentOrderDetail.workflowStatus === "CONFIRMED") {
      const res = await dispatch(startPackingShopOrderThunk(currentOrderDetail.id));
      if (startPackingShopOrderThunk.fulfilled.match(res)) showToast("Đơn hàng đã chuyển sang đóng gói.");
      else showToast("Không thể bắt đầu đóng gói đơn hàng.", true);
      return;
    }
    const carrier = window.prompt("Nhập mã đơn vị vận chuyển (GHN, GHTK, SPX, VIETTEL_POST):", currentOrderDetail.shipping.courier || "GHN");
    if (!carrier) return;
    const trackingCode = window.prompt("Nhập mã vận đơn:", currentOrderDetail.shipping.trackingCode || "");
    if (!trackingCode) return;
    const res = await dispatch(dispatchShopOrderThunk({ orderId: currentOrderDetail.id, carrier: carrier.trim(), trackingCode: trackingCode.trim() }));
    if (dispatchShopOrderThunk.fulfilled.match(res)) {
      showToast(`Đã giao kiện hàng cho ${currentOrderDetail.shipping.courierLabel}!`);
    } else {
      showToast("Lỗi cập nhật trạng thái", true);
    }
  };

  const handleCancel = async () => {
    if (!currentOrderDetail) return;
    const reason = window.prompt("Nhập lý do huỷ đơn hàng:", "Hết hàng hoặc người mua yêu cầu huỷ");
    if (reason && reason.trim()) {
      const res = await dispatch(
        cancelShopOrderThunk({ orderId: currentOrderDetail.id, reason })
      );
      if (cancelShopOrderThunk.fulfilled.match(res)) {
        showToast(`Đã huỷ đơn hàng ${currentOrderDetail.id}. Lý do: ${reason}`);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isDetailLoading && !currentOrderDetail) {
    return (
      <ShopLayout>
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-outline font-medium">Đang tải chi tiết đơn hàng...</span>
        </div>
      </ShopLayout>
    );
  }

  if (error && !currentOrderDetail) {
    return (
      <ShopLayout>
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <h2 className="text-lg font-bold text-on-surface">Không thể tải thông tin đơn hàng</h2>
          <p className="text-sm text-outline">{error}</p>
          <Link
            to="/shop/orders"
            className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            Quay lại danh sách đơn
          </Link>
        </div>
      </ShopLayout>
    );
  }

  const order = currentOrderDetail;
  if (!order) return null;

  return (
    <ShopLayout>
      <div className="flex flex-col w-full pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <Link to="/shop/dashboard" className="hover:text-primary transition-colors">
              Kênh Người bán
            </Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <Link to="/shop/orders" className="hover:text-primary transition-colors">
              Đơn hàng &amp; Giao vận
            </Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-semibold text-on-surface">Chi tiết {order.id}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/shop/orders")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại danh sách đơn</span>
          </button>
        </div>

        {/* Master Header Toolbar */}
        <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                Chi tiết đơn hàng {order.id}
              </h1>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-xs font-bold">
                {order.statusLabel}
              </span>
              {order.isUrgent && (
                <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">alarm</span>
                  Giao gấp (SLA)
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-outline mt-1">
              Đặt lúc {order.createdAt} {order.createdAtTime} ({order.timeAgo}) • Kênh bán: MarketPulse Official Shop
            </p>
          </div>

          {/* Action Buttons for Seller */}
          <div className="flex flex-wrap items-center gap-2.5">
            {order.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-error/10 text-error font-label-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  Huỷ đơn hàng
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Xác nhận đơn ngay
                </button>
              </>
            )}

            {order.status === "packing" && (
              <button
                type="button"
                onClick={handleDispatch}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-label-md text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                <span>Giao cho ĐVVC</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30 font-label-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>In phiếu giao &amp; Vận đơn</span>
            </button>
          </div>
        </div>

        {/* Cancelled Banner if cancelled */}
        {order.status === "cancelled" && (
          <div className="p-4 my-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs sm:text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            <span>
              <strong>Đơn hàng đã bị huỷ: </strong>
              {order.cancelReason || "Người mua hoặc Shop yêu cầu huỷ đơn."}
            </span>
          </div>
        )}

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          {/* Left Column (8 cols): Items, Financial, Shipping */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Products Card */}
            <ShopOrderItemsCard
              items={order.items}
              buyerNote={order.customer.buyerNote}
            />

            {/* Financial Card */}
            <ShopOrderFinancialCard financial={order.financial} />

            {/* Shipping & Journey Card */}
            <ShopOrderShippingCard shipping={order.shipping} />
          </div>

          {/* Right Column (4 cols): Customer Info, Help / SLA Notes */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Customer Info Card */}
            <ShopOrderCustomerCard customer={order.customer} />

            {/* SLA Merchant Guarantee Box */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold text-xs text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                Chính sách xử lý đơn của Shop
              </div>
              <ul className="text-xs text-outline space-y-2 list-disc pl-4">
                <li>Xác nhận và chuẩn bị hàng trong vòng <strong>24 giờ</strong> kể từ lúc tạo đơn.</li>
                <li>Đóng gói chống sốc và dán mã vận đơn <strong>{order.shipping.trackingCode}</strong> lên mặt bưu kiện.</li>
                <li>Tiền hàng sẽ giải ngân tự động sau khi người mua xác nhận đã nhận hàng thành công.</li>
              </ul>
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
                <span>Hỗ trợ kỹ thuật sàn:</span>
                <span className="font-semibold text-primary">1900 6868</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
              toastMessage.isError
                ? "bg-error-container text-on-error-container border border-error/30"
                : "bg-inverse-surface text-inverse-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                toastMessage.isError ? "text-error" : "text-primary-fixed"
              }`}
            >
              {toastMessage.isError ? "error" : "check_circle"}
            </span>
            <span className="font-body-md text-body-md font-medium">
              {toastMessage.text}
            </span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 hover:opacity-75 cursor-pointer text-inherit"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </div>
    </ShopLayout>
  );
};

export default ShopOrderDetail;

