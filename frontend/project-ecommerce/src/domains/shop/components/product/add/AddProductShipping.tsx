import React from "react";
import type { AddProductFormData } from "@/domains/shop/types/shopAddProduct.types";

interface AddProductShippingProps {
  formData: AddProductFormData;
  onChange: (fields: Partial<AddProductFormData>) => void;
}

export const AddProductShipping: React.FC<AddProductShippingProps> = ({
  formData,
  onChange,
}) => {
  // Volume weight calculation in grams: (L * W * H) / 5000 * 1000 = (L * W * H) / 5
  const volumeWeightGram = Math.round(
    ((formData.lengthCm || 0) * (formData.widthCm || 0) * (formData.heightCm || 0)) / 5
  );

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs border border-outline-variant/30 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              4. Vận chuyển &amp; Quy cách đóng gói
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Kích thước và trọng lượng thực tế giúp tính chính xác biểu phí vận chuyển từ các đối tác giao hàng
            </p>
          </div>
        </div>
        <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
          Bắt buộc
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weight (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
            <span>Trọng lượng sau đóng gói</span>
            <span className="text-error font-label-sm">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.weightGram}
              onChange={(e) => onChange({ weightGram: Number(e.target.value) })}
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4 py-2.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary transition-all pr-16"
            />
            <span className="absolute right-4 top-2.5 font-label-md text-label-md text-outline">
              gram (g)
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-outline">
            Đã bao gồm hộp sản phẩm + xốp/túi bóng khí bảo vệ
          </span>
        </div>

        {/* 3D Dimensions (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
            <span>Kích thước đóng gói chuẩn (Dài x Rộng x Cao)</span>
            <span className="text-error font-label-sm">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="number"
                value={formData.lengthCm}
                onChange={(e) => onChange({ lengthCm: Number(e.target.value) })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary transition-all pr-14"
              />
              <span className="absolute right-3 top-2.5 font-label-sm text-label-sm text-outline">
                Dài (cm)
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={formData.widthCm}
                onChange={(e) => onChange({ widthCm: Number(e.target.value) })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary transition-all pr-16"
              />
              <span className="absolute right-3 top-2.5 font-label-sm text-label-sm text-outline">
                Rộng (cm)
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => onChange({ heightCm: Number(e.target.value) })}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary transition-all pr-14"
              />
              <span className="absolute right-3 top-2.5 font-label-sm text-label-sm text-outline">
                Cao (cm)
              </span>
            </div>
          </div>
          <span className="font-body-sm text-body-sm text-outline">
            Quy đổi thể tích: ~{volumeWeightGram.toLocaleString("vi-VN")} gram tương đương
          </span>
        </div>
      </div>

      {/* Shipping partner fee preview banner */}
      <div className="bg-surface-container-low rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/20 text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">price_check</span>
          </div>
          <div>
            <div className="font-label-md text-label-md font-bold text-on-surface">
              Cước vận chuyển ước tính tiêu chuẩn: 22.000 ₫ - 32.000 ₫
            </div>
            <div className="font-body-sm text-body-sm text-outline">
              Tối ưu cho Giao Hàng Nhanh (GHN), Viettel Post và SPX Express trong nội - ngoại thành
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-label-sm shadow-xs flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Miễn phí hoàn hàng 100%
          </span>
        </div>
      </div>
    </section>
  );
};

