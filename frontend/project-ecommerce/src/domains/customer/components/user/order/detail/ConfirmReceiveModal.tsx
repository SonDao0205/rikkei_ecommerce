import React from 'react';

interface ConfirmReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const ConfirmReceiveModal: React.FC<ConfirmReceiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 transform transition-all animate-scale-up">
        <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            Xác nhận đã nhận hàng?
          </h3>
          <p className="font-body-md text-body-md text-outline mt-1.5 leading-relaxed">
            Vui lòng chỉ bấm xác nhận khi bạn đã nhận được kiện hàng từ bưu tá GHN và kiểm tra tình trạng sản phẩm nguyên vẹn.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Để sau
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Tôi đã nhận đủ hàng</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
