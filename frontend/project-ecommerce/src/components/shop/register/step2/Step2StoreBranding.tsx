import React from "react";
import type { ShopStoreData } from "../../../../types";

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
  const handleRemoveLogo = () => {
    onChange({ logoUrl: "" });
  };

  const handleRemoveBanner = () => {
    onChange({
      bannerUrl: "",
      bannerName: "",
    });
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
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-primary-container text-on-primary flex flex-col items-center justify-center shadow-md overflow-hidden relative">
              {data.logoUrl ? (
                <>
                  <img
                    className="w-full h-full object-cover"
                    alt="Logo Gian hàng"
                    src={data.logoUrl}
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[32px]">storefront</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                    Logo gian hàng
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Logo gian hàng (Shop Avatar)
              </span>
              <span className="text-error font-bold">*</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Nhập URL HTTPS công khai của ảnh logo (khuyến nghị ảnh vuông). Đường dẫn được lưu cùng hồ sơ shop.
            </p>
            <div className="flex flex-col gap-3 mt-1">
              <input type="url" value={data.logoUrl || ""} onChange={(e) => onChange({ logoUrl: e.target.value })} placeholder="https://... (URL ảnh công khai)" className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm" />
              {data.logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md flex items-center gap-1 cursor-pointer"
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
          <div className="relative group w-full sm:w-80 md:w-88 h-28 sm:h-32 rounded-2xl bg-surface-container text-on-surface flex flex-col items-center justify-center shadow-md overflow-hidden relative border border-outline-variant/30 shrink-0">
            {data.bannerUrl ? (
              <>
                <img
                  className="w-full h-full object-cover"
                  alt="Ảnh bìa Gian hàng"
                  src={data.bannerUrl}
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">panorama</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
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
              Nhập URL HTTPS công khai của ảnh bìa. Ảnh bìa là tùy chọn.
            </p>
            <div className="flex flex-col gap-3 mt-1">
              <input type="url" value={data.bannerUrl || ""} onChange={(e) => onChange({ bannerUrl: e.target.value })} placeholder="https://... (URL ảnh công khai, tùy chọn)" className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm" />
              {data.bannerUrl && (
                <button
                  onClick={handleRemoveBanner}
                  className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-error transition-colors font-label-md text-label-md flex items-center gap-1 cursor-pointer"
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
