import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopLayout from "@/app/layout/ShopLayout";
import { useAppDispatch } from "@/app/state/store";
import { saveShopProductItem, fetchShopProductList } from "@/domains/shop/state/shopProductSlice";
import type { AddProductFormData, AddProductCategoryOption } from "@/domains/shop/types/shopAddProduct.types";
import {
  AddProductBasicInfo,
  AddProductMedia,
  AddProductVariants,
  AddProductShipping,
  AddProductActionBar,
  AddProductCategoryModal,
} from "@/domains/shop/components/product/add";

const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800";

const INITIAL_FORM_DATA: AddProductFormData = {
  name: "",
  categoryId: 0,
  categoryPath: [],
  brand: "No Brand",
  brandId: null,
  isBrandVerified: false,
  origin: "",
  description: "",
  coverImage: "",
  detailImages: [],
  videoUrl: undefined,
  hasVariants: false,
  colors: [],
  sizes: [],
  variants: [],
  singleSku: "",
  singleCostPrice: 0,
  singleSellPrice: 0,
  singleStock: 0,
  weightGram: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
};

export const ShopAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<AddProductFormData>(INITIAL_FORM_DATA);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [showSeoGuide, setShowSeoGuide] = useState(false);

  const handleFormChange = (fields: Partial<AddProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSelectCategory = (category: AddProductCategoryOption) => {
    setFormData((prev) => {
      const nextCategoryPath = [...category.parentPath, category.name];
      return {
        ...prev,
        categoryId: category.id,
        categoryPath: nextCategoryPath,
        sizes: category.suggestedSizes,
        colors: category.suggestedColors,
      };
    });
  };

  // Dynamic SEO Score Calculation
  const seoScore = useMemo(() => {
    let score = 0;
    // 1. Title (max 20)
    if (formData.name.trim().length >= 20 && formData.name.trim().length <= 120) {
      score += 20;
    } else if (formData.name.trim().length > 0) {
      score += 10;
    }

    // 2. Category (max 15)
    if (formData.categoryId > 0) {
      score += 15;
    }

    // 3. Brand & Origin (max 15)
    if (formData.brand.trim() && formData.origin.trim()) {
      score += 15;
    } else if (formData.brand.trim() || formData.origin.trim()) {
      score += 8;
    }

    // 4. Description (max 15)
    if (formData.description.trim().length >= 100) {
      score += 15;
    } else if (formData.description.trim().length >= 30) {
      score += 8;
    }

    // 5. Media (max 15)
    if (formData.coverImage) {
      score += 10;
      if (formData.detailImages.length >= 3) score += 5;
    }

    // 6. Variants or Pricing (max 10)
    if (formData.hasVariants) {
      if (formData.variants.length > 0) score += 10;
    } else {
      if (formData.singleSellPrice > 0 && formData.singleStock > 0) score += 10;
    }

    // 7. Shipping (max 10)
    if (formData.weightGram > 0 && formData.lengthCm > 0 && formData.widthCm > 0 && formData.heightCm > 0) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }, [formData]);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Save draft to localStorage
  const handleSaveDraft = () => {
    try {
      localStorage.setItem("marketpulse_shop_add_product_draft", JSON.stringify(formData));
      showToast("Đã lưu bản nháp thành công vào hệ thống!");
    } catch {
      showToast("Không thể lưu bản nháp vào bộ nhớ tạm.", true);
    }
  };

  // Submit product creation
  const handleSubmitProduct = async () => {
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", true);
      return;
    }
    if (formData.name.length > 120) {
      showToast("Tên sản phẩm không được vượt quá 120 ký tự", true);
      return;
    }
    if (!formData.categoryId || formData.categoryPath.length === 0) {
      showToast("Vui lòng chọn ngành hàng & danh mục sản phẩm", true);
      return;
    }
    if (!formData.brand.trim()) {
      showToast("Vui lòng chọn thương hiệu sản phẩm", true);
      return;
    }
    if (!formData.origin.trim()) {
      showToast("Vui lòng nhập xuất xứ / xưởng sản xuất", true);
      return;
    }
    if (formData.hasVariants && formData.variants.length === 0) {
      showToast("Vui lòng thêm ít nhất một biến thể (màu sắc & kích cỡ)", true);
      return;
    }
    if (!formData.hasVariants && (formData.singleSellPrice <= 0 || formData.singleStock <= 0)) {
      showToast("Vui lòng nhập giá bán và số lượng tồn kho", true);
      return;
    }
    if (formData.weightGram <= 0) {
      showToast("Vui lòng nhập trọng lượng sau đóng gói", true);
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryPrice = formData.hasVariants
        ? formData.variants[0]?.sellPrice || 0
        : formData.singleSellPrice;
      const totalStock = formData.hasVariants
        ? formData.variants.reduce((sum, v) => sum + v.stock, 0)
        : formData.singleStock;
      const primarySku = formData.hasVariants
        ? formData.variants[0]?.sku || `SKU-${Date.now().toString(36).toUpperCase()}`
        : formData.singleSku || `SKU-${Date.now().toString(36).toUpperCase()}`;

      const rawVariants = formData.hasVariants
        ? formData.variants.map((v) => ({
            sku: v.sku,
            name: `${v.color} - ${v.size}`,
            price: v.sellPrice,
            stock: v.stock,
            image_url: null,
            attribute_value_ids: [],
          }))
        : [
            {
              sku: primarySku,
              name: "Tiêu chuẩn",
              price: primaryPrice,
              stock: totalStock,
              image_url: null,
              attribute_value_ids: [],
            },
          ];

      const rawImages = [
        { url: formData.coverImage || DEFAULT_COVER_IMAGE, is_primary: true },
        ...formData.detailImages.map((img) => ({
          url: img.url,
          is_primary: false,
        })),
      ];

      const payload = {
        name: formData.name.trim(),
        price: primaryPrice,
        stock: totalStock,
        sku: primarySku,
        category: String(formData.categoryId),
        categoryId: formData.categoryId,
        categoryLabel: formData.categoryPath[formData.categoryPath.length - 1] || "Sản phẩm",
        imageUrl: formData.coverImage || DEFAULT_COVER_IMAGE,
        description: formData.description,
        brand_id: formData.brandId ?? null,
        rawVariants,
        rawImages,
      };

      const result = await dispatch(saveShopProductItem(payload));

      if (saveShopProductItem.fulfilled.match(result)) {
        const primaryCostPrice = formData.hasVariants
          ? formData.variants[0]?.costPrice || Math.round(primaryPrice * 0.6)
          : formData.singleCostPrice || Math.round(primaryPrice * 0.6);
        try {
          const storedCosts = JSON.parse(
            localStorage.getItem("marketpulse_product_cost_prices") || "{}"
          );
          storedCosts[result.payload.id] = primaryCostPrice;
          storedCosts[primarySku] = primaryCostPrice;
          localStorage.setItem(
            "marketpulse_product_cost_prices",
            JSON.stringify(storedCosts)
          );
        } catch {
          // ignore
        }
        showToast("Thêm sản phẩm thành công! Đang chuyển hướng...");
        dispatch(fetchShopProductList());
        setTimeout(() => {
          navigate("/shop/products");
        }, 1200);
      } else {
        const errorMsg = (result.payload as string) || "Thêm sản phẩm thất bại";
        showToast(errorMsg, true);
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi thêm sản phẩm";
      showToast(errMessage, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ShopLayout>
      <div className="flex flex-col w-full pb-28">
        {/* Page Header & Top Metabar */}
        <div className="py-4">
          {/* Breadcrumb & Back Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
              <Link to="/shop/dashboard" className="hover:text-primary transition-colors">
                Kênh Người bán
              </Link>
              <span className="material-symbols-outlined text-[16px] text-outline">
                chevron_right
              </span>
              <Link to="/shop/products" className="hover:text-primary transition-colors">
                Quản lý sản phẩm
              </Link>
              <span className="material-symbols-outlined text-[16px] text-outline">
                chevron_right
              </span>
              <span className="text-on-surface font-label-md font-bold">
                Thêm sản phẩm mới
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSeoGuide((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Hướng dẫn đăng bán chuẩn SEO</span>
              <span className="material-symbols-outlined text-[14px]">
                {showSeoGuide ? "expand_less" : "arrow_forward"}
              </span>
            </button>
          </div>

          {/* SEO Guide Accordion Popup Banner */}
          {showSeoGuide && (
            <div className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-on-surface flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Checklist tối ưu sản phẩm đạt điểm SEO 100%:
                </span>
                <button
                  type="button"
                  onClick={() => setShowSeoGuide(false)}
                  className="text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
                <li>Tên sản phẩm từ 20 đến 120 ký tự, chứa từ khoá tìm kiếm chính.</li>
                <li>Chọn đúng danh mục cấp sâu nhất để kích hoạt bộ lọc thuộc tính tương ứng.</li>
                <li>Ảnh đại diện vuông 1:1 rõ nét, tối thiểu 3 ảnh góc chụp chi tiết hoặc video thực tế.</li>
                <li>Bảng biến thể giá bán hợp lý, quản lý kho từng SKU để tránh phạt đơn huỷ.</li>
                <li>Cung cấp chính xác kích thước và trọng lượng để cước vận chuyển chuẩn xác.</li>
              </ul>
            </div>
          )}

          {/* Title Row & Context */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/shop/products")}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                  title="Quay lại danh sách sản phẩm"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Thêm sản phẩm mới
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                  Bản nháp #SKU-NEW
                </span>
              </div>
              <p className="font-body-md text-body-md text-outline mt-1.5 pl-12 max-w-2xl">
                Cung cấp thông tin chi tiết và chính xác để tăng cơ hội tiếp cận khách hàng trên toàn bộ hệ thống sàn thương mại điện tử MarketPulse.
              </p>
            </div>

            {/* Live SEO Progress Indicator */}
            <div className="flex items-center gap-3.5 bg-surface-container-lowest px-4 py-3 rounded-2xl shadow-xs border border-outline-variant/30">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-primary transition-all duration-500 ease-out"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${seoScore}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute font-label-sm text-[11px] text-primary font-bold">
                  {seoScore}%
                </span>
              </div>
              <div>
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  Điểm tối ưu niêm yết
                </div>
                <div className="font-body-sm text-body-sm text-outline">
                  {seoScore >= 80
                    ? "Đạt tiêu chuẩn hiển thị Trang chủ"
                    : seoScore >= 50
                    ? "Đạt mức cơ bản, cần bổ sung ảnh/mô tả"
                    : "Cần điền thêm thông tin thiết yếu"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content Canvas */}
        <div className="flex flex-col gap-6 max-w-[1360px] w-full mt-2">
          {/* 1. Basic Info */}
          <AddProductBasicInfo
            formData={formData}
            onChange={handleFormChange}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          />

          {/* 2. Media Management */}
          <AddProductMedia formData={formData} onChange={handleFormChange} />

          {/* 3. Variants & SKU Matrix */}
          <AddProductVariants formData={formData} onChange={handleFormChange} />

          {/* 4. Shipping & Packaging */}
          <AddProductShipping formData={formData} onChange={handleFormChange} />
        </div>

        {/* Sticky Bottom Action Bar */}
        <AddProductActionBar
          isSubmitting={isSubmitting}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitProduct}
        />

        {/* Category Modal */}
        <AddProductCategoryModal
          isOpen={isCategoryModalOpen}
          selectedCategoryId={formData.categoryId}
          onClose={() => setIsCategoryModalOpen(false)}
          onSelectCategory={handleSelectCategory}
        />

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-20 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
              toast.isError
                ? "bg-error-container text-on-error-container border border-error/30"
                : "bg-inverse-surface text-inverse-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                toast.isError ? "text-error" : "text-primary-fixed"
              }`}
            >
              {toast.isError ? "error" : "check_circle"}
            </span>
            <span className="font-body-md text-body-md font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-75 cursor-pointer text-inherit"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </div>
    </ShopLayout>
  );
};

export default ShopAddProduct;

