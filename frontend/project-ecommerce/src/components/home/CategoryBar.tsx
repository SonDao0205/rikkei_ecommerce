import React from "react";
import type { Category } from "../../types/ecommerce";

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: number;
  onSelectCategory: (id: number) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-margin-lg pt-space-lg pb-space-md">
      <div className="flex items-center gap-space-lg overflow-x-auto pb-2 pt-1 scroll-smooth justify-between md:justify-center">
        {categories.map((category) => {
          const isSelected = category.id === selectedCategoryId;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer focus:outline-none"
            >
              <div
                className={`relative w-16 h-16 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105 shadow-sm ${
                  isSelected
                    ? "ring-2 ring-primary"
                    : "border border-outline-variant group-hover:border-primary bg-surface-container-lowest"
                }`}
              >
                {category.image_url ? (
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-low">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${category.image_url}')` }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm overflow-hidden">
                    <span className="material-symbols-outlined text-[28px]">apps</span>
                  </div>
                )}
              </div>
              <span
                className={`text-[13px] text-center tracking-tight leading-tight transition-colors ${
                  isSelected
                    ? "font-semibold text-primary"
                    : "font-medium text-on-surface group-hover:text-primary"
                }`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBar;
