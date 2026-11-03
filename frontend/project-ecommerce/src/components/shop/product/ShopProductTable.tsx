import React from "react";
import type { ShopProductItem } from "../../../types/shop/shopProduct.types";

interface ShopProductTableProps {
  products: ShopProductItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEditProduct: (product: ShopProductItem) => void;
  onDeleteProduct: (id: string) => void;
}

export const ShopProductTable: React.FC<ShopProductTableProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEditProduct,
  onDeleteProduct,
}) => {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  const getStockBadgeClasses = (status: ShopProductItem["stockStatus"]) => {
    switch (status) {
      case "abundant":
        return "bg-secondary-fixed/40 text-on-secondary-fixed-variant";
      case "safe":
        return "bg-secondary-fixed/30 text-on-secondary-fixed";
      case "low":
        return "bg-tertiary-fixed text-on-tertiary-fixed";
      case "critical":
        return "bg-error text-on-error font-bold shadow-xs";
      case "out":
      default:
        return "bg-surface-container-highest text-on-surface-variant";
    }
  };

  const getStockDotClasses = (status: ShopProductItem["stockStatus"]) => {
    switch (status) {
      case "abundant":
      case "safe":
        return "bg-secondary";
      case "low":
        return "bg-tertiary animate-pulse";
      case "critical":
        return "bg-white";
      case "out":
      default:
        return "bg-outline";
    }
  };

  return (
    <div className="overflow-x-auto w-full bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 mt-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider font-semibold border-b border-outline-variant/30">
            <th className="py-3.5 px-4 w-12 text-center" scope="col">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-outline text-primary focus:ring-0 cursor-pointer"
                aria-label="Chọn tất cả sản phẩm"
              />
            </th>
            <th className="py-3.5 px-3 min-w-[320px]" scope="col">
              Sản phẩm &amp; Mã SKU
            </th>
            <th className="py-3.5 px-3 min-w-[190px]" scope="col">
              Phân loại hàng
            </th>
            <th className="py-3.5 px-3 min-w-[160px]" scope="col">
              Giá niêm yết &amp; Bán
            </th>
            <th className="py-3.5 px-3 min-w-[150px]" scope="col">
              Tồn kho khả dụng
            </th>
            <th className="py-3.5 px-4 min-w-[130px] text-right" scope="col">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm text-on-surface">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            products.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isOut = item.stockStatus === "out";

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-surface-container-low/60 transition-colors group ${
                    isOut ? "opacity-75" : ""
                  } ${isSelected ? "bg-primary/5" : ""}`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-4 h-4 rounded border-outline text-primary focus:ring-0 cursor-pointer"
                      aria-label={`Chọn sản phẩm ${item.name}`}
                    />
                  </td>

                  {/* Product Details & Image */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-xs border border-outline-variant/30">
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            isOut ? "grayscale" : ""
                          }`}
                          loading="lazy"
                        />
                        {isOut ? (
                          <div className="absolute inset-0 bg-inverse-surface/50 flex items-center justify-center">
                            <span className="text-inverse-on-surface font-label-sm text-[9px] uppercase tracking-wider font-bold">
                              Hết
                            </span>
                          </div>
                        ) : (
                          item.soldCount > 0 && (
                            <span className="absolute bottom-1 right-1 px-1 rounded bg-inverse-surface/80 text-inverse-on-surface text-[9px] font-mono leading-none">
                              x{item.soldCount}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors line-clamp-1 font-semibold">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                          <span className="font-mono text-primary font-bold text-xs">
                            {item.sku}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[10px] text-on-surface-variant font-medium">
                            {item.categoryLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Variation */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        {item.variationTitle}
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                        {item.variationSubtitle}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface font-mono">
                        {item.formattedPrice}
                      </span>
                      {item.formattedOriginalPrice ? (
                        <span className="font-body-sm text-xs text-outline line-through font-mono">
                          {item.formattedOriginalPrice}
                        </span>
                      ) : item.priceNote ? (
                        <span className="font-body-sm text-xs text-outline-variant">
                          {item.priceNote}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-label-md text-label-md font-bold text-on-surface font-mono">
                        {item.stock} chiếc
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[10px] ${getStockBadgeClasses(
                          item.stockStatus
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${getStockDotClasses(
                            item.stockStatus
                          )}`}
                        />
                        {item.stockStatusLabel}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors font-label-sm text-[12px] font-semibold cursor-pointer"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors font-label-sm text-[12px] font-semibold cursor-pointer"
                        title="Xoá sản phẩm"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Xoá</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShopProductTable;

