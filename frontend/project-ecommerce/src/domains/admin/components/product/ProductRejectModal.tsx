import React, { useState } from "react";
import type { AdminProductItem } from "@/shared/types";

interface ProductRejectModalProps {
  isOpen: boolean;
  product: AdminProductItem | null;
  onClose: () => void;
  onConfirmReject: (productId: number, reason: string) => void;
}

const PRESET_REASONS = [
  "Hình ảnh sản phẩm không đúng quy chuẩn (mờ, chứa logo/watermark lạ)",
  "Thông tin mô tả không đầy đủ hoặc chứa nội dung sai lệch",
  "Giá bán hoặc số lượng tồn kho bất thường so với thực tế",
  "Sản phẩm vi phạm chính sách kinh doanh hoặc danh mục hạn chế",
  "Tên sản phẩm chứa từ khóa spam hoặc không đúng thực tế",
];

interface DialogContentProps {
  product: AdminProductItem;
  onClose: () => void;
  onConfirmReject: (productId: number, reason: string) => void;
}

const ProductRejectDialogContent: React.FC<DialogContentProps> = ({
  product,
  onClose,
  onConfirmReject,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = () => {
    const finalReason = customReason.trim() || selectedPreset;
    if (!finalReason) {
      setErrorMessage("Vui lòng cung cấp lý do từ chối để phản hồi cho người bán.");
      return;
    }
    onConfirmReject(product.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg border border-outline-variant overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-container">
          <div className="flex items-center gap-2 text-error font-headline-sm text-lg font-bold">
            <span className="material-symbols-outlined text-[24px]">cancel</span>
            <span>Từ chối duyệt sản phẩm</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Product brief info */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <img
              src={product.thumbnail_url || undefined}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-on-surface truncate">{product.name}</p>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                <span className="font-mono">{product.sku}</span>
                <span>•</span>
                <span>{product.shop_name}</span>
                <span>•</span>
                <span className="font-mono font-medium text-on-surface">
                  {product.price.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
          </div>

          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              Chọn lý do từ chối phổ biến:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedPreset === reason
                      ? "border-primary bg-primary/5 text-on-surface font-medium"
                      : "border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReasonPreset"
                    checked={selectedPreset === reason}
                    onChange={() => setSelectedPreset(reason)}
                    className="mt-0.5 text-primary accent-primary cursor-pointer"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Ghi chú thêm cho người bán (tùy chọn):
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập chi tiết hướng dẫn người bán sửa đổi để được duyệt lại..."
              className="w-full p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all resize-none"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-error font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-surface-container-low border-t border-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-error hover:bg-error/90 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
            <span>Xác nhận từ chối</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductRejectModal: React.FC<ProductRejectModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirmReject,
}) => {
  if (!isOpen || !product) return null;

  return (
    <ProductRejectDialogContent
      key={product.id}
      product={product}
      onClose={onClose}
      onConfirmReject={onConfirmReject}
    />
  );
};

export default ProductRejectModal;
