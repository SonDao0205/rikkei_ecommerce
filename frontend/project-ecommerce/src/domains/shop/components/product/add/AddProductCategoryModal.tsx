import React, { useState } from "react";
import type { AddProductCategoryOption } from "@/domains/shop/types/shopAddProduct.types";
import { CATEGORY_TREE_DATA } from "@/domains/shop/constants/categoryTreeData";

interface AddProductCategoryModalProps {
  isOpen: boolean;
  selectedCategoryId: number;
  onClose: () => void;
  onSelectCategory: (category: AddProductCategoryOption) => void;
}

export const AddProductCategoryModal: React.FC<AddProductCategoryModalProps> = ({
  isOpen,
  selectedCategoryId,
  onClose,
  onSelectCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredCategories = CATEGORY_TREE_DATA.filter((cat) => {
    const fullText = `${cat.parentPath.join(" ")} ${cat.name}`.toLowerCase();
    return fullText.includes(searchTerm.toLowerCase().trim());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-outline-variant/30 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Chọn ngành hàng &amp; danh mục
              </h3>
              <p className="font-body-sm text-body-sm text-outline">
                Chọn phân loại chuẩn xác để sản phẩm đạt tối đa điểm chuẩn SEO
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-outline-variant/10 bg-surface-container-low/50">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục (VD: Giày, Áo thun, Balo...)"
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-outline text-sm">
              Không tìm thấy danh mục phù hợp với "{searchTerm}"
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-primary/5 border-primary shadow-xs"
                      : "bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low hover:border-outline-variant"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline">
                      {cat.parentPath.map((path, idx) => (
                        <React.Fragment key={path}>
                          <span>{path}</span>
                          {idx < cat.parentPath.length - 1 && (
                            <span className="material-symbols-outlined text-[12px]">
                              chevron_right
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                      <span>{cat.name}</span>
                      <span className="text-[11px] font-normal text-outline">
                        (Mã #{cat.id})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Đang chọn
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                        arrow_forward
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
