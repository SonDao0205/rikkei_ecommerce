import React from 'react';
import type { UserOrder } from '../../../../types';

interface OrderDetailFooterBarProps {
  order: UserOrder;
  onOpenReceiveModal: () => void;
  onOpenCancelModal?: () => void;
  onReturnRequest: () => void;
  onContactSupport: () => void;
}

export const OrderDetailFooterBar: React.FC<OrderDetailFooterBarProps> = ({
  order,
  onOpenReceiveModal,
  onOpenCancelModal,
  onReturnRequest,
  onContactSupport,
}) => {
  const canDirectCancel = order.status === 'pending';
  const isDelivered = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-5 mt-2">
      {/* Left side: Help & Complaints */}
      <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </div>
          <span className="font-body-md text-body-md text-on-surface">
            Cần trợ giúp? Hotline:{' '}
            <a className="font-bold text-primary hover:underline" href="tel:19006868">
              1900 6868
            </a>{' '}
            (24/7)
          </span>
        </div>
        <span className="hidden sm:inline text-outline">•</span>
        <button
          type="button"
          onClick={onContactSupport}
          className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">report</span>
          <span>Trung tâm giải quyết khiếu nại</span>
        </button>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end">
        {/* Cancel button */}
        {!isCancelled && !isDelivered && (
          canDirectCancel ? (
            <button
              type="button"
              onClick={onOpenCancelModal}
              className="px-4 py-2.5 rounded-xl bg-error/10 hover:bg-error/20 text-error font-label-md text-label-md transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Yêu cầu Hủy đơn</span>
            </button>
          ) : (
            <div className="relative group/cancel">
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl bg-surface-container text-outline font-label-md text-label-md cursor-not-allowed opacity-80 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Yêu cầu Hủy đơn</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/cancel:block z-30 w-72 p-2.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-body-sm text-body-sm shadow-xl">
                Đơn hàng đã bàn giao cho GHN, không thể hủy trực tiếp. Vui lòng liên hệ hỗ trợ hoặc từ chối nhận khi shipper liên hệ.
              </div>
            </div>
          )
        )}

        {/* Return / Refund Request */}
        {!isCancelled && (
          <button
            type="button"
            onClick={onReturnRequest}
            className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_return</span>
            <span>Yêu cầu Trả hàng / Hoàn tiền</span>
          </button>
        )}

        {/* Order Received Primary CTA */}
        {order.status === 'shipping' && (
          <button
            type="button"
            onClick={onOpenReceiveModal}
            className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Đã nhận được hàng</span>
          </button>
        )}

        {isDelivered && (
          <div className="px-5 py-2.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <span>Đã giao thành công</span>
          </div>
        )}

        {isCancelled && (
          <div className="px-5 py-2.5 rounded-xl bg-error/15 text-error font-label-lg text-label-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            <span>Đã hủy đơn hàng</span>
          </div>
        )}
      </div>
    </section>
  );
};
