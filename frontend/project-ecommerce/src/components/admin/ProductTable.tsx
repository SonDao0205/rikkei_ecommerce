import React, { useRef, useEffect } from "react";
import type { AdminProductItem } from "../../types/ecommerce";

interface ProductTableProps {
  products: AdminProductItem[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onToggleStatus: (id: number) => void;
  onDeleteProduct: (id: number) => void;
  onEditProduct?: (product: AdminProductItem) => void;
  onDuplicateProduct?: (product: AdminProductItem) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onToggleStatus,
  onDeleteProduct,
  onEditProduct,
  onDuplicateProduct,
}) => {
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const getVendorBadgeClasses = (badge: string) => {
    switch (badge) {
      case "MALL":
        return "bg-primary-fixed text-on-primary-fixed-variant";
      case "ARTISAN":
        return "bg-amber-100 text-amber-900";
      case "VERIFIED":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-surface-container text-on-surface";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1080px]">
        <thead>
          <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-surface-container">
            <th className="py-4 px-4 w-12 text-center">
              <input
                ref={masterCheckboxRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-primary-container border-outline focus:ring-primary-container cursor-pointer accent-primary-container"
              />
            </th>
            <th className="py-4 px-4">Product &amp; SKU</th>
            <th className="py-4 px-4">Shop / Vendor</th>
            <th className="py-4 px-4">Category</th>
            <th className="py-4 px-4">Retail Price</th>
            <th className="py-4 px-4">Stock Level</th>
            <th className="py-4 px-4 text-center">Status</th>
            <th className="py-4 px-4 text-right pr-6">Catalog Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
          {products.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                  inventory_2
                </span>
                <p className="font-semibold text-lg">No products found</p>
                <p className="text-sm">Try adjusting your search query or filters.</p>
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              const rowBgClass = isOutOfStock
                ? "bg-rose-50/40 hover:bg-rose-100/40"
                : isLowStock
                ? "bg-amber-50/50 hover:bg-amber-100/50"
                : "hover:bg-surface-container-low";

              return (
                <tr key={product.id} className={`${rowBgClass} transition-colors`}>
                  {/* Row Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                      className="w-4 h-4 rounded border-outline cursor-pointer accent-primary-container"
                    />
                  </td>

                  {/* Product & SKU */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={product.thumbnail_url || undefined}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline-md text-[15px] font-semibold text-on-surface hover:text-primary transition-colors truncate">
                          {product.name}
                        </span>
                        <span className="font-mono text-xs text-on-surface-variant tracking-tight">
                          {product.sku}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Shop / Vendor */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-on-surface">{product.shop_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${getVendorBadgeClasses(
                          product.shop_badge
                        )}`}
                      >
                        {product.shop_badge}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                      {product.category_name}
                    </span>
                  </td>

                  {/* Retail Price */}
                  <td className="py-4 px-4 font-mono font-semibold text-on-surface">
                    {formatPrice(product.price)}
                  </td>

                  {/* Stock Level */}
                  <td className="py-4 px-4">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                        Out of stock (0)
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {product.stock} left
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {product.stock} in stock
                      </span>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-4 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.is_active}
                        onChange={() => onToggleStatus(product.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
                    </label>
                  </td>

                  {/* Catalog Actions */}
                  <td className="py-4 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct?.(product)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                        title="Edit Catalog Entry"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateProduct?.(product)}
                        className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                        title="Duplicate SKU"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
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

export default ProductTable;
