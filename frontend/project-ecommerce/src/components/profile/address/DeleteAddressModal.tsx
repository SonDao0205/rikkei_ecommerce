import React, { useEffect, useState, useCallback } from "react";
import type { Address } from "../../../types/user/address.types";

export interface DeleteAddressModalProps {
  isOpen: boolean;
  address: Address | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteAddressModal: React.FC<DeleteAddressModalProps> = ({
  isOpen,
  address,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const [isRendered, setIsRendered] = useState(false);

  const handleClose = useCallback(() => {
    if (isDeleting) return;
    setIsRendered(false);
    setTimeout(() => {
      onClose();
    }, 150);
  }, [isDeleting, onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRendered(true), 20);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isDeleting, handleClose]);

  if (!isOpen || !address) return null;

  const fullLocation = [
    address.street_detail,
    address.ward,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

  const typeLabel =
    address.address_type === "HOME"
      ? "Nhà riêng"
      : address.address_type === "OFFICE"
      ? "Văn phòng / Công ty"
      : "Khác";

  const typeIcon =
    address.address_type === "OFFICE"
      ? "business"
      : address.address_type === "HOME"
      ? "home"
      : "pin_drop";

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-address-modal-title"
    >
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-outline-variant/30 p-6 sm:p-8 z-10 transform transition-all duration-200 ease-out ${
          isRendered
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Warning Icon Badge */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-error to-rose-400 text-on-error flex items-center justify-center shadow-lg shadow-error/25">
              <span className="material-symbols-outlined text-[32px]">
                delete_forever
              </span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-error ring-2 ring-surface-container-lowest"></span>
            </span>
          </div>

          {/* Heading */}
          <h3
            id="delete-address-modal-title"
            className="text-xl font-headline-md font-bold text-on-surface tracking-tight"
          >
            Xác nhận xóa địa chỉ
          </h3>

          <p className="mt-2 text-body-sm text-on-surface-variant leading-relaxed max-w-sm">
            Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ không? Thao tác này sẽ không thể hoàn tác.
          </p>

          {/* Address Preview Box */}
          <div className="w-full mt-5 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-on-surface text-sm sm:text-base">
                {address.recipient_name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high text-on-surface-variant">
                  <span className="material-symbols-outlined text-[13px]">{typeIcon}</span>
                  <span>{typeLabel}</span>
                </span>
                {address.is_default && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-fixed text-primary">
                    Mặc định
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-outline">call</span>
              <span>{address.phone.startsWith("+84") ? address.phone : `+84 ${address.phone.replace(/^0/, "")}`}</span>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-on-surface leading-relaxed pt-1 border-t border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5">
                location_on
              </span>
              <span className="break-words line-clamp-2">{fullLocation}</span>
            </div>

            {address.is_default && (
              <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200 mt-1">
                Lưu ý: Đây là địa chỉ mặc định của bạn. Khi xóa, hệ thống sẽ tự động gán địa chỉ tiếp theo làm mặc định.
              </p>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="w-full py-2.5 px-4 rounded-xl border border-outline-variant text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-2.5 px-4 rounded-xl bg-error text-white font-label-md text-label-md font-bold hover:bg-error/90 active:scale-95 shadow-md shadow-error/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Xóa địa chỉ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAddressModal;

