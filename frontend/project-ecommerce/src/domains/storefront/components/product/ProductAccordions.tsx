import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface ProductAccordionsProps {
  description?: string | null;
}

export const ProductAccordions: React.FC<ProductAccordionsProps> = ({
  description,
}) => {
  const { t } = useTranslation("customer");
  const [openSection, setOpenSection] = useState<number | null>(1); // Default panel 1 is open

  const toggleSection = (index: number) => {
    setOpenSection((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col gap-2.5 pt-2">
      {/* Accordion Panel 1: Description & Fit Notes */}
      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/30">
        <button
          type="button"
          onClick={() => toggleSection(1)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
        >
          <span className="font-label-lg font-bold text-on-surface flex items-center gap-2 text-sm md:text-base">
            <span className="material-symbols-outlined text-primary text-[20px]">description</span>
            {t("product.accordions.description_title")}
          </span>
          <span
            className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-200 ${
              openSection === 1 ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {openSection === 1 && (
          <div className="px-5 pb-5 text-body-md font-body-md text-on-surface-variant flex flex-col gap-3 text-xs md:text-sm animate-in fade-in duration-200">
            <p className="whitespace-pre-line leading-relaxed">
              {description || t("product.accordions.default_description")}
            </p>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1 text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                {t("product.accordions.size_recommendation_title")}
              </span>
              <span>
                {t("product.accordions.size_recommendation_desc")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Panel 2: Materials & Specs */}
      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/30">
        <button
          type="button"
          onClick={() => toggleSection(2)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
        >
          <span className="font-label-lg font-bold text-on-surface flex items-center gap-2 text-sm md:text-base">
            <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
            {t("product.accordions.materials_title")}
          </span>
          <span
            className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-200 ${
              openSection === 2 ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {openSection === 2 && (
          <div className="px-5 pb-5 text-body-sm font-body-sm text-on-surface-variant flex flex-col gap-2 text-xs md:text-sm animate-in fade-in duration-200">
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
              <li>
                <strong className="text-on-surface">{t("product.accordions.materials_list.item1_title")}</strong> {t("product.accordions.materials_list.item1_desc")}
              </li>
              <li>
                <strong className="text-on-surface">{t("product.accordions.materials_list.item2_title")}</strong> {t("product.accordions.materials_list.item2_desc")}
              </li>
              <li>
                <strong className="text-on-surface">{t("product.accordions.materials_list.item3_title")}</strong> {t("product.accordions.materials_list.item3_desc")}
              </li>
              <li>
                <strong className="text-on-surface">{t("product.accordions.materials_list.item4_title")}</strong> {t("product.accordions.materials_list.item4_desc")}
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Accordion Panel 3: Delivery & Returns */}
      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/30">
        <button
          type="button"
          onClick={() => toggleSection(3)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
        >
          <span className="font-label-lg font-bold text-on-surface flex items-center gap-2 text-sm md:text-base">
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            {t("product.accordions.delivery_title")}
          </span>
          <span
            className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-200 ${
              openSection === 3 ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {openSection === 3 && (
          <div className="px-5 pb-5 text-body-sm font-body-sm text-on-surface-variant flex flex-col gap-2.5 text-xs md:text-sm animate-in fade-in duration-200">
            <p>
              <strong className="text-on-surface">{t("product.accordions.delivery_time_title")}</strong> {t("product.accordions.delivery_time_desc")}
            </p>
            <p>
              <strong className="text-on-surface">{t("product.accordions.return_policy_title")}</strong> {t("product.accordions.return_policy_desc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAccordions;
