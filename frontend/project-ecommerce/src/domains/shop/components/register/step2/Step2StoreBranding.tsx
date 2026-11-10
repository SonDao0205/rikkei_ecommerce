import React, { useRef } from "react";
import type { ShopStoreData } from "@/shared/types";

interface Step2StoreBrandingProps {
  data: ShopStoreData;
  onChange: (fields: Partial<ShopStoreData>) => void;
}

const CATEGORIES = [
  { value: "streetwear", label: "Giày dép & Thời trang Streetwear" },
  { value: "electronics", label: "Điện tử, Công nghệ & Phụ kiện" },
  { value: "home", label: "Đồ gia dụng & Phong cách sống" },
  { value: "cosmetics", label: "Mỹ phẩm & Chăm sóc cá nhân" },
  { value: "sports", label: "Thể thao & Dã ngoại" },
  { value: "books", label: "Sách & Văn phòng phẩm" },
];

export const Step2StoreBranding: React.FC<Step2StoreBrandingProps> = ({
  data,
  onChange,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange({ logoUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange({ bannerUrl: result, bannerName: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onChange({ logoUrl: "" });
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = () => {
    onChange({
      bannerUrl: "",
      bannerName: "",
    });
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg sm:p-space-xl flex flex-col gap-space-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
            <span className="material-symbols-outlined text-[24px]">
              branding_watermark
            </span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              1. Nhận diện thương hiệu Gian hàng
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Thông tin hiển thị công khai trên ứng dụng mua sắm MarketPulse
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
        {/* Tên gian hàng */}
        <div className="md:col-span-8 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Tên gian hàng (Shop Name) <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <input
              className="w-full h-12 px-4 pr-11 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none transition-all placeholder:text-outline border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
              placeholder="Nhập tên gian hàng (VD: UrbanStep Sneaker Hub)"
              type="text"
              maxLength={50}
              value={data.shopName}
              onChange={(e) => onChange({ shopName: e.target.value })}
            />
            {data.shopName && (
              <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary text-[22px]">
                check_circle
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-body-sm font-body-sm mt-0.5">
            {data.shopName ? (
              <span className="text-secondary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Tên gian hàng hợp lệ và chưa trùng lặp trên hệ thống
              </span>
            ) : (
              <span className="text-on-surface-variant">Vui lòng nhập tên nhận diện cửa hàng</span>
            )}
            <span className="text-on-surface-variant font-mono">
              {data.shopName.length}/50 ký tự
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2 mt-1">
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
              info
            </span>
            <span>
              Quy chuẩn: Không sử dụng từ ngữ xúc phạm, tên miền (.vn, .com), hoặc các thương hiệu có bản quyền khi chưa được ủy quyền pháp lý.
            </span>
          </p>
        </div>

        {/* Danh mục kinh doanh chính */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Danh mục kinh doanh chính <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none appearance-none cursor-pointer border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
              value={data.category}
              onChange={(e) => onChange({ category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.label}>
                  {cat.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Quyết định cơ chế phí sàn &amp; ngành hàng ưu tiên
          </span>
        </div>

        {/* Logo gian hàng (Shop Logo Upload) */}
        <div className="md:col-span-12 flex flex-col sm:flex-row items-start sm:items-center gap-space-md bg-surface-container-low p-space-md rounded-xl">
          <input
            type="file"
            ref={logoInputRef}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <div
            onClick={() => logoInputRef.current?.click()}
            className="relative group shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-surface-container text-on-surface flex flex-col items-center justify-center shadow-md overflow-hidden border border-outline-variant/30 cursor-pointer hover:border-primary transition-all"
            title="Nhấp để tải ảnh logo"
          >
            {data.logoUrl ? (
              <>
                <img
                  className="w-full h-full object-cover"
                  alt="Logo Gian hàng"
                  src={data.logoUrl}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                  <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  <span className="text-[10px] font-semibold">Đổi ảnh</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-primary text-center p-2">
                <span className="material-symbols-outlined text-[32px]">storefront</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1 text-center">
                  Logo gian hàng
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Logo gian hàng (Shop Avatar)
              </span>
              <span className="text-error font-bold">*</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Tải ảnh logo đại diện cho gian hàng (khuyến nghị ảnh vuông tỉ lệ 1:1, tối đa 5MB).
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {data.logoUrl ? "cached" : "upload"}
                </span>
                <span>{data.logoUrl ? "Thay đổi logo" : "Tải ảnh logo"}</span>
              </button>
              {data.logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-error-container/40 text-on-surface-variant hover:text-error transition-colors font-label-md text-xs font-semibold cursor-pointer border border-outline-variant/30"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Xóa ảnh</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ảnh bìa gian hàng (Shop Banner / Cover) */}
        <div className="md:col-span-12 flex flex-col md:flex-row items-start md:items-center gap-space-md bg-surface-container-low p-space-md rounded-xl">
          <input
            type="file"
            ref={bannerInputRef}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleBannerUpload}
          />
          <div
            onClick={() => bannerInputRef.current?.click()}
            className="relative group w-full sm:w-80 md:w-88 h-28 sm:h-32 rounded-2xl bg-surface-container text-on-surface flex flex-col items-center justify-center shadow-md overflow-hidden border border-outline-variant/30 shrink-0 cursor-pointer hover:border-primary transition-all"
            title="Nhấp để tải ảnh bìa"
          >
            {data.bannerUrl ? (
              <>
                <img
                  className="w-full h-full object-cover"
                  alt="Ảnh bìa Gian hàng"
                  src={data.bannerUrl}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                  <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  <span className="text-[10px] font-semibold">Đổi ảnh bìa</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-primary text-center p-2">
                <span className="material-symbols-outlined text-[32px]">panorama</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1 text-center">
                  Banner gian hàng
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Ảnh bìa gian hàng (Shop Banner / Cover)
              </span>
              <span className="text-on-surface-variant text-xs font-normal">
                (Tùy chọn)
              </span>
              {data.bannerName && (
                <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[11px] font-mono truncate max-w-[180px]">
                  {data.bannerName}
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Tải ảnh bìa quảng bá thương hiệu gian hàng (khuyến nghị tỉ lệ 16:9 hoặc 3:1, tối đa 5MB).
            </p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-bold border border-outline-variant/30 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {data.bannerUrl ? "cached" : "upload"}
                </span>
                <span>{data.bannerUrl ? "Thay đổi ảnh bìa" : "Tải ảnh bìa lên"}</span>
              </button>
              {data.bannerUrl && (
                <button
                  onClick={handleRemoveBanner}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-error-container/40 text-on-surface-variant hover:text-error transition-colors font-label-md text-xs font-semibold cursor-pointer border border-outline-variant/30"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Xóa ảnh bìa</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mô tả ngắn về Shop (Bio) */}
        <div className="md:col-span-12 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
              Mô tả ngắn về Shop (Bio / Giới thiệu gian hàng)
            </label>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
              {data.bio.length} / 300 ký tự
            </span>
          </div>
          <textarea
            className="w-full p-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none resize-none placeholder:text-outline border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
            rows={3}
            maxLength={300}
            placeholder="Mô tả ngắn về Shop (Bio / Giới thiệu gian hàng)..."
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Hiển thị ở trang thông tin cửa hàng, thẻ meta tìm kiếm Google và trang sản phẩm.
          </span>
        </div>
      </div>
    </section>
  );
};

export default Step2StoreBranding;
