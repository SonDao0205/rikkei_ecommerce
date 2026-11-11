import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerLayout from '@/app/layout/CustomerLayout';
import { useAppDispatch, useAppSelector } from '@/app/state/store';
import {
  getUserOrderDetail,
  clearCurrentOrderDetail,
  cancelOrderAction,
  confirmReceivedAction,
} from '@/domains/customer/state/orderSlice';
import {
  OrderDetailHeader,
  OrderDetailStepper,
  OrderDetailDeliveryGrid,
  OrderDetailShopSection,
  OrderDetailPriceSummary,
  OrderDetailFooterBar,
  ConfirmReceiveModal,
} from '@/domains/customer/components/user/order/detail';
import { CancelOrderModal } from '@/domains/customer/components/user/order/CancelOrderModal';
import OrderToast from '@/domains/customer/components/user/order/OrderToast';

export const MyOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentOrderDetail: order, loading, actionLoading } = useAppSelector(
    (state) => state.userOrder
  );

  // Local state for modals and notifications
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showToast = useCallback((msg: string, title: string = "Thông báo", type: "success" | "error" | "info" = "info") => {
    setToastConfig({
      isOpen: true,
      title,
      message: msg,
      type,
    });
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(getUserOrderDetail(id));
    }
    return () => {
      dispatch(clearCurrentOrderDetail());
    };
  }, [dispatch, id]);

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleChatShop = () => {
    showToast('Đang kết nối trung tâm chat với nhà bán hàng...');
  };

  const handleConfirmReceived = async () => {
    if (!order) return;
    try {
      await dispatch(confirmReceivedAction(order.id)).unwrap();
      setIsReceiveModalOpen(false);
      showToast('Đã xác nhận nhận hàng thành công!');
    } catch {
      showToast('Có lỗi xảy ra khi xác nhận nhận hàng.');
    }
  };

  const handleConfirmCancel = async (orderId: number | string, reason: string) => {
    try {
      await dispatch(cancelOrderAction({ orderId, cancelReason: reason })).unwrap();
      setIsCancelModalOpen(false);
      showToast(`Đơn hàng ${order?.orderCode || orderId} đã được hủy thành công.`, 'Đã hủy đơn hàng', 'success');
    } catch {
      showToast('Có lỗi xảy ra khi hủy đơn hàng.', 'Hủy đơn hàng thất bại', 'error');
    }
  };

  const handleReturnRequest = () => {
    showToast('Yêu cầu Trả hàng / Hoàn tiền đã được ghi nhận. Đang chuyển hướng...');
  };

  const handleContactSupport = () => {
    showToast('Tổng đài hỗ trợ 1900 6868 sẵn sàng 24/7');
  };

  return (
    <CustomerLayout>
      <div className="flex flex-col w-full bg-surface min-h-[calc(100vh-20rem)] py-6">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Loading Skeleton */}
          {loading && !order && (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-10 bg-surface-container-high rounded-xl w-1/3" />
              <div className="h-28 bg-surface-container-lowest rounded-2xl p-6" />
              <div className="h-64 bg-surface-container-lowest rounded-2xl p-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-44 bg-surface-container-lowest rounded-2xl" />
                <div className="h-44 bg-surface-container-lowest rounded-2xl" />
                <div className="h-44 bg-surface-container-lowest rounded-2xl" />
              </div>
              <div className="h-72 bg-surface-container-lowest rounded-2xl" />
            </div>
          )}

          {/* Not Found State */}
          {!loading && !order && (
            <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4 my-8">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[36px]">receipt_long</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                Không tìm thấy đơn hàng
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
              </p>
              <button
                type="button"
                onClick={() => navigate('/profile/orders')}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Quay lại danh sách đơn hàng</span>
              </button>
            </div>
          )}

          {/* Active Order Details Content */}
          {order && (
            <>
              {/* 1. Header with Breadcrumbs, Order Code, Status, Print & Chat */}
              <OrderDetailHeader
                order={order}
                onPrintInvoice={handlePrintInvoice}
                onChatWithShop={handleChatShop}
              />

              {/* 2. Visual Tracking Stepper & Carrier Timeline */}
              <OrderDetailStepper order={order} onShowToast={showToast} />

              {/* 3. Delivery & Customer Information Grid */}
              <OrderDetailDeliveryGrid order={order} />

              {/* 4. Multi-Shop Items Section (Grouped by Shop) */}
              <OrderDetailShopSection order={order} onShowToast={showToast} />

              {/* 5. Financial Breakdown & Buyer Assurance */}
              <OrderDetailPriceSummary
                order={order}
                onContactSupport={handleContactSupport}
              />

              {/* 6. Bottom Sticky / Footer Action Bar */}
              <OrderDetailFooterBar
                order={order}
                onOpenReceiveModal={() => setIsReceiveModalOpen(true)}
                onOpenCancelModal={() => setIsCancelModalOpen(true)}
                onReturnRequest={handleReturnRequest}
                onContactSupport={handleContactSupport}
              />

              {/* Receive Order Confirmation Modal */}
              <ConfirmReceiveModal
                isOpen={isReceiveModalOpen}
                onClose={() => setIsReceiveModalOpen(false)}
                onConfirm={handleConfirmReceived}
                isSubmitting={actionLoading}
              />

              {/* Cancel Order Modal */}
              <CancelOrderModal
                isOpen={isCancelModalOpen}
                order={order}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirmCancel={handleConfirmCancel}
                loading={actionLoading}
              />

              {/* Slide-in Compact Order Toast */}
              <OrderToast
                isOpen={toastConfig.isOpen}
                title={toastConfig.title}
                message={toastConfig.message}
                type={toastConfig.type}
                onClose={() => setToastConfig((prev) => ({ ...prev, isOpen: false }))}
              />
            </>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default MyOrderDetail;
