import React, { useState } from "react";
import type { ShopProductItem } from "../../../types/shop/shopProduct.types";

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
  const [name, setName] = useState(editingProduct?.name || "");
  const [sku, setSku] = useState(editingProduct?.sku || "VN-CER-88219");
  const [category, setCategory] = useState(editingProduct?.category || "art");
  const [categoryLabel, setCategoryLabel] = useState(
    editingProduct?.categoryLabel || "Gốm nghệ thuật"
  );
  const [price, setPrice] = useState(editingProduct?.price || 450000);
  const [stock, setStock] = useState(editingProduct?.stock || 25);
  const [variationTitle, setVariationTitle] = useState(
    editingProduct?.variationTitle || "Bản tiêu chuẩn"
  );
  const [variationSubtitle, setVariationSubtitle] = useState(
    editingProduct?.variationSubtitle || "Men hỏa biến tự nhiên"
  );
  const [imageUrl, setImageUrl] = useState(
    editingProduct?.imageUrl ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5EfnOPri4N6dEKOhMUIP8rqxXkduxGinUXkkdk-ki54I6mmHzOcOOPjcbd23uKAZXNNym25Js8B8YU-yyV_eC1yqXNialcTX1jjc-od6Q-K_LG229JttV_xBGrwwd5P9mXNgumN-ayvaBrDkpYCQTwFMCKokyBq6ObPXsEAw9FfdCUvbh1mbeuZf3Usns3t8wXsS1_-7OpdgdGh0K2lLhrzdmeUgtGp9rPfguaSqd0BMwgmn0vrC"
  );

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const labels: Record<string, string> = {
      art: "Gốm nghệ thuật",
      tea: "Trà cụ & Ấm chén",
      dining: "Phụ kiện bàn ăn",
      lighting: "Đèn trang trí",
      vases: "Lọ hoa để bàn",
    };
    setCategoryLabel(labels[val] || "Gốm nghệ thuật");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingProduct?.id,
      name,
      sku,
      category,
      categoryLabel,
      price: Number(price),
      formattedPrice: new Intl.NumberFormat("vi-VN").format(Number(price)) + " ₫",
      stock: Number(stock),
      variationTitle,
      variationSubtitle,
      imageUrl:
        imageUrl.trim() ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBJ5EfnOPri4N6dEKOhMUIP8rqxXkduxGinUXkkdk-ki54I6mmHzOcOOPjcbd23uKAZXNNym25Js8B8YU-yyV_eC1yqXNialcTX1jjc-od6Q-K_LG229JttV_xBGrwwd5P9mXNgumN-ayvaBrDkpYCQTwFMCKokyBq6ObPXsEAw9FfdCUvbh1mbeuZf3Usns3t8wXsS1_-7OpdgdGh0K2lLhrzdmeUgtGp9rPfguaSqd0BMwgmn0vrC",
      stockStatus: Number(stock) > 10 ? "abundant" : Number(stock) > 0 ? "low" : "out",
      stockStatusLabel: Number(stock) > 10 ? "Đủ hàng" : Number(stock) > 0 ? "Sắp hết" : "Hết hàng",
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
              placeholder="Ví dụ: Bình gốm mộc hoả biến Indochine..."
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
                placeholder="VN-CER-00123"
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
                <option value="art">Gốm nghệ thuật &amp; Hỏa biến</option>
                <option value="tea">Trà cụ &amp; Ấm chén Tử Sa</option>
                <option value="dining">Phụ kiện bàn ăn Ceramic</option>
                <option value="lighting">Đèn trang trí &amp; Tinh dầu</option>
                <option value="vases">Lọ hoa Wabi Sabi</option>
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
                Tiêu đề phân loại
              </label>
              <input
                type="text"
                value={variationTitle}
                onChange={(e) => setVariationTitle(e.target.value)}
                placeholder="Ví dụ: 3 Kích thước (S, M, L)"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Mô tả phân loại phụ
              </label>
              <input
                type="text"
                value={variationSubtitle}
                onChange={(e) => setVariationSubtitle(e.target.value)}
                placeholder="Ví dụ: 2 Màu men hỏa biến"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:border-primary shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
              Đường dẫn hình ảnh (URL)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
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
