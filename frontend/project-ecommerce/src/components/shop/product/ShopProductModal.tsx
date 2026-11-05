import React, { useState } from "react";
import type { ShopProductItem } from "../../../types/shop/shopProduct.types";
import { DEFAULT_PRODUCT_IMAGE } from "../../../api/shop/shopProductApi";

const PRODUCT_CATEGORIES = [
  { id: "930002", name: "Áo và phụ kiện" },
  { id: "930001", name: "Thời trang" },
  { id: "930003", name: "Nhà cửa & Đời sống" },
  { id: "930004", name: "Thực phẩm & Đồ uống" },
  { id: "930005", name: "Điện thoại & Phụ kiện" },
];

interface ShopProductModalProps {
  isOpen: boolean;
  editingProduct: ShopProductItem | null;
  onClose: () => void;
  onSave: (product: Partial<ShopProductItem>) => void;
}

interface ShopProductModalFormProps {
  editingProduct: ShopProductItem | null;
  onClose: () => void;
  onSave: (product: Partial<ShopProductItem>) => void;
}

const ShopProductModalForm: React.FC<ShopProductModalFormProps> = ({
  editingProduct,
  onClose,
  onSave,
}) => {
  const initialCat =
    editingProduct?.category ||
    String(editingProduct?.categoryId || "930002");

  const [name, setName] = useState(editingProduct?.name || "");
  const [sku, setSku] = useState(
    editingProduct?.sku || "VN-CER-88219"
  );
  const [category, setCategory] = useState(initialCat);
  const [categoryLabel, setCategoryLabel] = useState(
    editingProduct?.categoryLabel ||
      PRODUCT_CATEGORIES.find((c) => c.id === initialCat)?.name ||
      "Áo và phụ kiện"
  );
  const [price, setPrice] = useState(editingProduct?.price || 150000);
  const [stock, setStock] = useState(editingProduct?.stock ?? 20);
  const [variationTitle, setVariationTitle] = useState(
    editingProduct?.variationTitle || "Bản tiêu chuẩn"
  );
  const [variationSubtitle, setVariationSubtitle] = useState(
    editingProduct?.variationSubtitle || "Tiêu chuẩn nhà máy"
  );
  const [imageUrl, setImageUrl] = useState(
    editingProduct?.imageUrl || DEFAULT_PRODUCT_IMAGE
  );

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const found = PRODUCT_CATEGORIES.find((c) => c.id === val);
    setCategoryLabel(found ? found.name : "Ngành hàng chung");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingProduct?.id,
      name: name.trim(),
      sku: sku.trim(),
      category,
      categoryId: Number(category),
      categoryLabel,
      price: Number(price),
      formattedPrice:
        new Intl.NumberFormat("vi-VN").format(Number(price)) + " ₫",
      stock: Number(stock),
      variationTitle: variationTitle.trim() || "Tiêu chuẩn",
      variationSubtitle: variationSubtitle.trim(),
      imageUrl: imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
      stockStatus:
        Number(stock) > 20
          ? "abundant"
          : Number(stock) > 5
          ? "safe"
          : Number(stock) > 0
          ? "low"
          : "out",
      stockStatusLabel:
        Number(stock) > 20
          ? "Đủ hàng"
          : Number(stock) > 5
          ? "An toàn"
          : Number(stock) > 0
          ? "Sắp hết"
          : "Hết hàng",
      rawVariants: editingProduct?.rawVariants,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">
              {editingProduct ? "edit" : "add_box"}
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Đóng modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Áo thun cotton cao cấp hoặc Bình gốm phong cách Indochine..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Mã SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-VN-00123"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-mono text-body-sm focus:outline-none focus:border-primary shadow-xs uppercase font-bold text-primary"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Danh mục ngành hàng
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs cursor-pointer"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Giá bán (₫) *
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-mono text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Tồn kho sẵn có (chiếc) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-mono text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Tiêu đề phân loại / biến thể
              </label>
              <input
                type="text"
                value={variationTitle}
                onChange={(e) => setVariationTitle(e.target.value)}
                placeholder="Ví dụ: Bản tiêu chuẩn hoặc Size M / Đen"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Mô tả phân loại phụ / chi tiết
              </label>
              <input
                type="text"
                value={variationSubtitle}
                onChange={(e) => setVariationSubtitle(e.target.value)}
                placeholder="Ví dụ: Men rêu hỏa biến hoặc 100% Cotton thoáng mát"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
              Đường dẫn hình ảnh (HTTPS URL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs font-mono text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all cursor-pointer"
            >
              {editingProduct ? "Cập nhật sản phẩm" : "Lưu sản phẩm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ShopProductModal: React.FC<ShopProductModalProps> = ({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <ShopProductModalForm
      key={editingProduct ? editingProduct.id : "new-product"}
      editingProduct={editingProduct}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default ShopProductModal;
