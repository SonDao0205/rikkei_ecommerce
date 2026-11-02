import React from "react";

interface ProductHeaderProps {
  onExportCsv?: () => void;
  onBulkImport?: () => void;
  onAddNewProduct?: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  onExportCsv,
  onBulkImport,
  onAddNewProduct,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-outline-variant/30">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <span>Admin</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Products</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-semibold">Inventory Catalog</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Product Inventory Management
          </h1>
        </div>
      </div>

      {/* Catalog Quick Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onExportCsv}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm font-label-lg text-label-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          <span>Export CSV</span>
        </button>
        <button
          onClick={onBulkImport}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm font-label-lg text-label-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span>Bulk Import</span>
        </button>
        <button
          onClick={onAddNewProduct}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all shadow-md font-label-lg text-label-lg active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Product</span>
        </button>
      </div>
    </div>
  );
};

export default ProductHeader;
