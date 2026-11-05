import React from "react";

interface ShopProductHeaderProps {
  totalSkus: number;
  lowStockCount: number;
  onAddNewProduct: () => void;
}

export const ShopProductHeader: React.FC<ShopProductHeaderProps> = ({
  totalSkus,
  lowStockCount,
  onAddNewProduct,
}) => {
  return (
    <div className="flex flex-col gap-3 py-6 border-b border-outline-variant/30">
      {/* Breadcrumb matching Admin & Shop Dashboard */}
      <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
        <span className="font-medium text-on-surface-variant">Kênh Người bán</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-medium text-on-surface-variant">Quản lý sản phẩm</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-semibold text-on-surface">Danh sách sản phẩm</span>
      </div>

      {/* Main Title Row & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Quản lý Kho &amp; Sản phẩm
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-mono font-bold">
              {totalSkus} SKUs đang quản lý
            </span>
            {lowStockCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-mono font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {lowStockCount} cảnh báo tồn
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onAddNewProduct}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>
    </div>
  );
};

export default ShopProductHeader;

