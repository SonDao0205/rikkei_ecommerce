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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
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

  const handleConfirmCancel = async (orderId: number, reason: string) => {
    try {
      await dispatch(cancelOrderAction({ orderId, cancelReason: reason })).unwrap();
      setIsCancelModalOpen(false);
      showToast('Đã hủy đơn hàng thành công.');
    } catch {
      showToast('Có lỗi xảy ra khi hủy đơn hàng.');
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
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-xl animate-bounce-in">
            <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
              check_circle
            </span>
            <span className="font-body-md text-body-md font-medium">{toastMessage}</span>
          </div>
        )}

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
            </>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default MyOrderDetail;
