import React from "react";
import type { AddProductFormData } from "@/domains/shop/types/shopAddProduct.types";

interface AddProductBasicInfoProps {
  formData: AddProductFormData;
  onChange: (fields: Partial<AddProductFormData>) => void;
  onOpenCategoryModal: () => void;
}

export const AddProductBasicInfo: React.FC<AddProductBasicInfoProps> = ({
  formData,
  onChange,
  onOpenCategoryModal,
}) => {
  const nameLen = formData.name.length;
  const isNameOverLimit = nameLen > 120;

  const handleApplyFormat = (prefix: string, suffix = "") => {
    const textarea = document.getElementById(
      "prod-description-editor"
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    if (prefix === "• ") {
      replacement = `\n• ${selected || "Điểm nổi bật mới"}`;
    } else if (prefix === "1. ") {
      replacement = `\n1. ${selected || "Mục số 1"}`;
    } else {
      replacement = `${prefix}${selected || "văn bản"}${suffix}`;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    onChange({ description: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + replacement.length - suffix.length
      );
    }, 0);
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs border border-outline-variant/30 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              1. Thông tin cơ bản
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Thông tin nhận diện đầu tiên của sản phẩm khi hiển thị trên thanh tìm kiếm
            </p>
          </div>
        </div>
        <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
          Bắt buộc
        </span>
      </div>

      {/* Product Name */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
            <span>Tên sản phẩm</span>
            <span className="text-error font-label-sm">*</span>
          </label>
          <span
            className={`font-label-sm text-label-sm font-mono ${
              isNameOverLimit ? "text-error font-bold" : "text-outline"
            }`}
          >
            {nameLen}/120 ký tự
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ví dụ: Giày Sneaker Nam Phong Cách Retro Runner V2..."
            className={`w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4 py-2.5 rounded-xl outline-none ring-1 transition-all ${
              isNameOverLimit
                ? "ring-error focus:ring-2 focus:ring-error"
                : "ring-outline-variant/40 focus:ring-2 focus:ring-primary"
            }`}
          />
        </div>
        <div className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            tips_and_updates
          </span>
          <span>
            Mẹo chuẩn SEO: [Loại sản phẩm] + [Thương hiệu / Dòng] + [Chất liệu &amp; Đặc tính nổi bật] + [Đối tượng]
          </span>
        </div>
      </div>

      {/* Cascading Category Selector */}
      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
          <span>Ngành hàng &amp; Danh mục</span>
          <span className="text-error font-label-sm">*</span>
        </label>
        <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-wrap items-center justify-between gap-3 border border-outline-variant/20">
          <div className="flex items-center flex-wrap gap-2 text-on-surface font-label-md text-label-md">
            {formData.categoryPath.map((path, idx) => (
              <React.Fragment key={path}>
                <span className="px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface shadow-xs font-semibold">
                  {path}
                </span>
                {idx < formData.categoryPath.length - 1 && (
                  <span className="material-symbols-outlined text-[14px] text-outline">
                    arrow_forward
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenCategoryModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Thay đổi danh mục</span>
          </button>
        </div>
      </div>

      {/* Brand & Origin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
            <span>Thương hiệu (Brand)</span>
            <span className="text-error font-label-sm">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              placeholder="Nhập tên thương hiệu hoặc No Brand"
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4 py-2.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary transition-all pr-24"
            />
            {formData.isBrandVerified && (
              <span className="absolute right-3 top-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Đã xác minh
              </span>
            )}
          </div>
        </div>

        {/* Origin */}
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
            <span>Xuất xứ / Xưởng sản xuất</span>
            <span className="text-error font-label-sm">*</span>
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => onChange({ origin: e.target.value })}
            placeholder="Ví dụ: Việt Nam, Hàn Quốc, Nhật Bản..."
            className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4 py-2.5 rounded-xl outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Description & Rich Text Editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
            <span>Mô tả sản phẩm &amp; Điểm nổi bật</span>
            <span className="text-error font-label-sm">*</span>
          </label>
          <span className="font-body-sm text-body-sm text-outline">
            Hỗ trợ định dạng Rich Text &amp; Bullet Points
          </span>
        </div>

        <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col border border-outline-variant/30">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-container-high/60 text-on-surface-variant font-label-sm border-b border-outline-variant/20">
            <button
              type="button"
              onClick={() => handleApplyFormat("**", "**")}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="In đậm (Ctrl+B)"
            >
              <span className="material-symbols-outlined text-[18px]">format_bold</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyFormat("*", "*")}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="In nghiêng (Ctrl+I)"
            >
              <span className="material-symbols-outlined text-[18px]">format_italic</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyFormat("<u>", "</u>")}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="Gạch chân"
            >
              <span className="material-symbols-outlined text-[18px]">format_underlined</span>
            </button>

            <span className="w-px h-4 bg-outline-variant/60 mx-1" />

            <button
              type="button"
              onClick={() => handleApplyFormat("• ")}
              className="p-1.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-xs cursor-pointer"
              title="Danh sách đầu dòng"
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyFormat("1. ")}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="Danh sách số"
            >
              <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
            </button>

            <span className="w-px h-4 bg-outline-variant/60 mx-1" />

            <button
              type="button"
              onClick={() => handleApplyFormat("[Liên kết](https://", ")")}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="Thêm liên kết"
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyFormat("![Ảnh minh hoạ](https://", ")")}
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="Chèn ảnh minh hoạ"
            >
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleApplyFormat(
                  "\n| Thông số | Giá trị |\n| --- | --- |\n| Chất liệu | Da lộn tự nhiên |\n| Trọng lượng | 650g |\n"
                )
              }
              className="p-1.5 rounded-lg hover:bg-surface-container-lowest hover:text-on-surface transition-colors cursor-pointer"
              title="Bảng thông số kỹ thuật"
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
            </button>

            <div className="ml-auto flex items-center gap-1.5 font-body-sm text-[12px] text-outline px-2">
              <span>Đang lưu tự động</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            </div>
          </div>

          {/* Editor Body */}
          <textarea
            id="prod-description-editor"
            rows={7}
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full bg-transparent px-4 py-3 text-on-surface font-body-md text-body-md outline-none resize-y leading-relaxed"
            placeholder="Nhập thông tin mô tả chi tiết, ưu điểm, bảng kích cỡ và bảo hành sản phẩm..."
          />
        </div>
      </div>
    </section>
  );
};

