import React, { useState } from "react";
import type {
  ShopVoucherItem,
  CreateShopVoucherPayload,
  ShopVoucherType,
} from "@/domains/shop/types/shopVoucher.types";

interface ShopVoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateShopVoucherPayload) => Promise<void>;
  editingVoucher: ShopVoucherItem | null;
  isSaving: boolean;
}

const getInitialFormData = (voucher: ShopVoucherItem | null): CreateShopVoucherPayload => {
  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const startDateStr = today.toISOString().split("T")[0];
  const expiryDateStr = nextMonth.toISOString().split("T")[0];

  if (voucher) {
    return {
      title: voucher.title,
      code: voucher.code,
      type: voucher.type,
      discountValue: voucher.discountValue,
      maxDiscountAmount: voucher.maxDiscountAmount ?? 50000,
      minOrderAmount: voucher.minOrderAmount,
      startDate: voucher.startDate || startDateStr,
      expiryDate: voucher.expiryDate || expiryDateStr,
      maxUsageCount: voucher.maxUsageCount ?? 100,
      description: voucher.description,
      badge: voucher.badge ?? "",
    };
  }

  return {
    title: "",
    code: "",
    type: "money",
    discountValue: 30000,
    maxDiscountAmount: 50000,
    minOrderAmount: 200000,
    startDate: startDateStr,
    expiryDate: expiryDateStr,
    maxUsageCount: 100,
    description: "",
    badge: "Phổ biến",
  };
};

interface FormContentProps {
  onClose: () => void;
  onSubmit: (payload: CreateShopVoucherPayload) => Promise<void>;
  editingVoucher: ShopVoucherItem | null;
  isSaving: boolean;
}

const FormContent: React.FC<FormContentProps> = ({
  onClose,
  onSubmit,
  editingVoucher,
  isSaving,
}) => {
  const [formData, setFormData] = useState<CreateShopVoucherPayload>(() =>
    getInitialFormData(editingVoucher)
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = "Mã voucher không được để trống";
    } else if (formData.code.length < 4 || formData.code.length > 20) {
      errors.code = "Mã voucher phải từ 4 - 20 ký tự";
    }

    if (!formData.title.trim()) {
      errors.title = "Tên hiển thị voucher không được để trống";
    }

    if (formData.discountValue <= 0) {
      errors.discountValue = "Mức giảm phải lớn hơn 0";
    }

    if (formData.type === "percent" && formData.discountValue > 100) {
      errors.discountValue = "Phần trăm giảm không được vượt quá 100%";
    }

    if (formData.minOrderAmount < 0) {
      errors.minOrderAmount = "Đơn tối thiểu không hợp lệ";
    }

    if (formData.maxUsageCount <= 0) {
      errors.maxUsageCount = "Số lượng phát hành phải lớn hơn 0";
    }

    if (formData.startDate && formData.expiryDate && formData.expiryDate < formData.startDate) {
      errors.expiryDate = "Ngày hết hạn không được trước ngày bắt đầu";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <div
      className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">
              {editingVoucher ? "edit" : "confirmation_number"}
            </span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
            </h2>
            <p className="font-body-xs text-body-xs text-on-surface-variant">
              {editingVoucher ? `Cập nhật mã ${editingVoucher.code}` : "Thiết lập thông số và phát hành voucher cho shop"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
        {/* Row 1: Code and Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Mã Voucher <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: SHOP30K"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                })
              }
              disabled={Boolean(editingVoucher)}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-mono text-body-md font-bold text-primary tracking-wider uppercase border border-outline-variant/30 focus:outline-none focus:border-primary disabled:opacity-60"
            />
            {formErrors.code && (
              <p className="text-error text-xs mt-1">{formErrors.code}</p>
            )}
          </div>

          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Nhãn nổi bật (Badge)
            </label>
            <input
              type="text"
              placeholder="VD: Phổ biến, Bán chạy, Hot deal..."
              value={formData.badge || ""}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Row 2: Title */}
        <div>
          <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
            Tên / Tiêu đề hiển thị <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Giảm ngay 30.000 ₫ cho đơn từ 300k"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
          {formErrors.title && (
            <p className="text-error text-xs mt-1">{formErrors.title}</p>
          )}
        </div>

        {/* Row 3: Voucher Type Selection */}
        <div>
          <label className="block font-label-md text-label-md font-semibold text-on-surface mb-2">
            Loại ưu đãi giảm giá <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: "money", label: "Giảm tiền mặt (₫)", icon: "payments" },
              { type: "percent", label: "Giảm phần trăm (%)", icon: "percent" },
            ].map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: item.type as ShopVoucherType,
                    discountValue: item.type === "percent" ? 10 : 30000,
                  })
                }
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  formData.type === item.type
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                    : "border-outline-variant/30 hover:bg-surface-container-high/40 text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Discount value & Max discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              {formData.type === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (₫)"}{" "}
              <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={formData.type === "percent" ? 100 : undefined}
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {formErrors.discountValue && (
              <p className="text-error text-xs mt-1">{formErrors.discountValue}</p>
            )}
          </div>

          {formData.type === "percent" ? (
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Mức giảm tối đa (₫)
              </label>
              <input
                type="number"
                min={1000}
                step={5000}
                value={formData.maxDiscountAmount || 50000}
                onChange={(e) =>
                  setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
          ) : (
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Đơn hàng tối thiểu (₫)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Row 5: Min Order Amount if percent & Max Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.type === "percent" && (
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Đơn hàng tối thiểu (₫)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Số lượng phát hành tối đa <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={formData.maxUsageCount}
              onChange={(e) =>
                setFormData({ ...formData, maxUsageCount: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {formErrors.maxUsageCount && (
              <p className="text-error text-xs mt-1">{formErrors.maxUsageCount}</p>
            )}
          </div>
        </div>

        {/* Row 6: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Ngày hết hạn <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {formErrors.expiryDate && (
              <p className="text-error text-xs mt-1">{formErrors.expiryDate}</p>
            )}
          </div>
        </div>

        {/* Row 7: Description */}
        <div>
          <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
            Mô tả điều kiện áp dụng
          </label>
          <textarea
            rows={3}
            placeholder="VD: Áp dụng cho tất cả sản phẩm của shop khi đạt giá trị đơn tối thiểu 300.000 ₫..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl font-label-md text-label-md font-medium transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>{editingVoucher ? "Cập nhật Voucher" : "Phát hành Voucher"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ShopVoucherFormModal: React.FC<ShopVoucherFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingVoucher,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <FormContent
        key={editingVoucher ? `edit-${editingVoucher.id}` : "create"}
        onClose={onClose}
        onSubmit={onSubmit}
        editingVoucher={editingVoucher}
        isSaving={isSaving}
      />
    </div>
  );
};
