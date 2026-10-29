import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../../layout/AdminLayout";
import { OrderMasterActionBar } from "../../components/admin/order/detail/OrderMasterActionBar";
import { OrderItemsCard } from "../../components/admin/order/detail/OrderItemsCard";
import { OrderFinancialCard } from "../../components/admin/order/detail/OrderFinancialCard";
import { OrderCustomerCard } from "../../components/admin/order/detail/OrderCustomerCard";
import { OrderShippingCard } from "../../components/admin/order/detail/OrderShippingCard";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getOrderDetailThunk,
  cancelOrderThunk,
  changeCourierThunk,
} from "../../redux/slices/admin/adminOrderSlice";

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const orderId = id ? (id.startsWith("#") ? id : `#${id}`) : "#ORD-9821";

  const dispatch = useAppDispatch();
  const { currentOrderDetail, isLoading, error } = useAppSelector(
    (state) => state.adminOrder
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHeld, setIsHeld] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getOrderDetailThunk(orderId));
  }, [dispatch, orderId]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Admin Platform Action: Force Cancel Order (Intervention / Fraud / SLA Breach)
  const handleForceCancel = () => {
    if (!currentOrderDetail) return;
    const defaultReason = "Shop không giao hàng quá hạn SLA (48h) hoặc vi phạm chính sách sàn";
    const reason = window.prompt(
      `[ADMIN OVERRIDE] Nhập lý do can thiệp hủy đơn hàng ${currentOrderDetail.id}:`,
      defaultReason
    );
    if (reason && reason.trim() !== "") {
      dispatch(cancelOrderThunk(currentOrderDetail.id));
      showNotification(
        `Admin đã thực hiện hủy cưỡng chế đơn hàng ${currentOrderDetail.id}. Lý do ghi nhận: ${reason}`
      );
    }
  };

  // Admin Platform Action: Toggle Risk / Fraud Hold
  const handleToggleRiskHold = () => {
    if (!currentOrderDetail) return;
    const nextState = !isHeld;
    setIsHeld(nextState);
    if (nextState) {
      showNotification(
        `Đơn hàng ${currentOrderDetail.id} đã được đưa vào trạng thái TẠM GIỮ (Risk Hold) để rà soát gian lận.`
      );
    } else {
      showNotification(
        `Đã gỡ bỏ tạm giữ cho đơn hàng ${currentOrderDetail.id}. Đơn hàng tiếp tục được lưu thông bình thường.`
      );
    }
  };

  // Admin Platform Action: Print Audit / Reconciliation Sheet
  const handlePrintAuditSheet = () => {
    window.print();
  };

  // Admin Platform Action: Export Platform VAT E-Invoice
  const handleExportVAT = () => {
    showNotification(
      `Hóa đơn VAT sàn (E-Invoice đối soát dịch vụ) cho đơn ${orderId} đã được xuất thành công!`
    );
  };

  // Admin Platform Action: 3PL Courier Override
  const handleChangeCourier = () => {
    if (!currentOrderDetail) return;
    const choice = window.prompt(
      "Điều phối đổi đối tác vận chuyển 3PL (khi bưu cục hiện tại quá tải/sự cố):\n1. GHN Express (Giao Hàng Nhanh)\n2. Viettel Post\nNhập số 1 hoặc 2:",
      "1"
    );
    if (choice === "1") {
      const newTracking = `GHN-SG${Math.floor(100000 + Math.random() * 900000)}`;
      dispatch(
        changeCourierThunk({
          orderId: currentOrderDetail.id,
          courierName: "GHN Logistics",
          trackingCode: newTracking,
        })
      );
      showNotification(`Admin đã điều phối đơn sang GHN Express. Mã vận đơn mới: ${newTracking}`);
    } else if (choice === "2") {
      const newTracking = `VT-SG${Math.floor(100000 + Math.random() * 900000)}`;
      dispatch(
        changeCourierThunk({
          orderId: currentOrderDetail.id,
          courierName: "Viettel Post",
          trackingCode: newTracking,
        })
      );
      showNotification(`Admin đã điều phối đơn sang Viettel Post. Mã vận đơn mới: ${newTracking}`);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col w-full pb-12 space-y-6">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">
                shield
              </span>
              <span className="font-medium text-sm">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !currentOrderDetail && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-white rounded-2xl border border-slate-200" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-64 bg-white rounded-2xl border border-slate-200" />
                <div className="h-52 bg-white rounded-2xl border border-slate-200" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="h-64 bg-white rounded-2xl border border-slate-200" />
                <div className="h-64 bg-white rounded-2xl border border-slate-200" />
              </div>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {error && !currentOrderDetail && (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
            <span className="material-symbols-outlined text-rose-500 text-[48px]">
              error
            </span>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Không thể tải thông tin đơn hàng
            </h3>
            <p className="text-sm text-slate-500">{error}</p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Quay lại danh sách đơn</span>
            </Link>
          </div>
        )}

        {/* Order Details View */}
        {currentOrderDetail && (
          <>
            {/* Section 3A: Title & Master Action Bar (Platform Admin Level) */}
            <OrderMasterActionBar
              order={currentOrderDetail}
              onForceCancel={handleForceCancel}
              onPrintAuditSheet={handlePrintAuditSheet}
              onExportVAT={handleExportVAT}
              onToggleRiskHold={handleToggleRiskHold}
              isHeld={isHeld}
            />

            {/* Section 4: Two-Column Grid (65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 Cols / 65%) */}
              <div className="lg:col-span-8 space-y-6">
                {/* 4B: Products & SKU Items Card (With Merchant Fulfillment Notice) */}
                <OrderItemsCard
                  items={currentOrderDetail.items}
                  shopName={currentOrderDetail.shopName}
                  shopCode={currentOrderDetail.shopCode}
                  shopBadge={currentOrderDetail.shopBadge}
                  packageSpec={currentOrderDetail.packageSpec}
                  packageWeight={currentOrderDetail.packageWeight}
                />

                {/* 4C: Financial & COD Reconciliation Card */}
                <OrderFinancialCard financial={currentOrderDetail.financial} />
              </div>

              {/* Right Column (4 Cols / 35%) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 4D: Customer Information Card */}
                <OrderCustomerCard customer={currentOrderDetail.customer} />

                {/* 4E: 3PL Logistics & Shipping Card (With Platform 3PL Coordination) */}
                <OrderShippingCard
                  shipping={currentOrderDetail.shipping}
                  onChangeCourier={handleChangeCourier}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
