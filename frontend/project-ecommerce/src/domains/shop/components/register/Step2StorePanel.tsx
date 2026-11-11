import React, { useRef } from "react";
import type { ShopStoreData } from "@/shared/types";
import { toSlug } from "@/shared/utils/slug";

interface Step2StorePanelProps {
  data: ShopStoreData;
  onChange: (fields: Partial<ShopStoreData>) => void;
}

const CATEGORIES = [
  "Thời trang, Giày dép & Phụ kiện thể thao",
  "Thiết bị Điện tử & Công nghệ",
  "Mỹ phẩm & Chăm sóc sắc đẹp",
  "Bách hóa tổng hợp & Tiêu dùng nhanh",
  "Nhà cửa & Đời sống phong cách",
  "Đồ thủ công & Nghệ nhân bản địa",
];

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Hải Phòng",
  "Bình Dương",
  "Cần Thơ",
];

const DISTRICTS_MAP: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "TP. Thủ Đức", "Bình Thạnh", "Tân Bình"],
  "Hà Nội": ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Đống Đa", "Quận Cầu Giấy", "Quận Hai Bà Trưng"],
  "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn"],
  "Hải Phòng": ["Quận Hồng Bàng", "Quận Ngô Quyền", "Quận Lê Chân"],
  "Bình Dương": ["TP. Thủ Dầu Một", "TP. Dĩ An", "TP. Thuận An"],
  "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng"],
};

const WARDS_MAP: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao", "Phường Tân Định", "Phường Cầu Kho"],
  "Quận 3": ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3"],
  "Quận 7": ["Phường Tân Phong", "Phường Tân Phú", "Phường Tân Thuận Đông"],
  "TP. Thủ Đức": ["Phường An Phú", "Phường Thảo Điền", "Phường Hiệp Phú"],
  "Bình Thạnh": ["Phường 25", "Phường 26", "Phường 19"],
  "Tân Bình": ["Phường 2", "Phường 4", "Phường 13"],
};

export const Step2StorePanel: React.FC<Step2StorePanelProps> = ({
  data,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({ logoUrl: previewUrl });
    }
  };

  const handleRemoveLogo = () => {
    onChange({
      logoUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCNrMAmg1_AP-gnUKfHAfOto09k01wTZaTh_q6IPwC2nW7DHLKrQ4iBbixGfuOM_awfq9mqDYiFrJIVwnWDLxpqfQJ-h_dnQjYOpT03VOr1b9gSFeUwu2BDjyL5baGCRCdusrgP9ISfHy6SbLTr-R8gpXgmaL1Qlkp2WyumtPlHraMxa93SIoaiy6ClnoIE7Z6VAdO5cTTVGaz5wyFCK0lnS4HYbPiYhCB67IVpFgI",
    });
  };

  const districts = DISTRICTS_MAP[data.province] || DISTRICTS_MAP["TP. Hồ Chí Minh"];
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({
        bannerUrl: previewUrl,
        bannerName: file.name,
      });
    }
  };

  const handleRemoveBanner = () => {
    onChange({
      bannerUrl: "",
      bannerName: "",
    });
  };

  const wards = WARDS_MAP[data.district] || WARDS_MAP["Quận 1"];

  return (
    <div className="space-y-space-lg" id="step-panel-2">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm mb-2">
          <span className="material-symbols-outlined text-[15px]">store</span>
          <span>Nhận diện thương hiệu &amp; Vận chuyển</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
          Thiết lập gian hàng &amp; Địa chỉ kho lấy hàng
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Thông tin sẽ hiển thị công khai cho người mua sắm và kết nối với các đơn vị vận chuyển đối tác.
        </p>
      </div>

      {/* Store Identity Section */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-space-md">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">palette</span>
          Thông tin nhận diện gian hàng
        </h3>

        {/* Logo Upload Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg py-2">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden shadow-sm">
              {data.logoUrl ? (
                <img
                  className="w-full h-full object-cover"
                  alt="Store Logo"
                  src={data.logoUrl}
                />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-outline">
                  storefront
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              type="button"
              title="Thay đổi ảnh đại diện"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-1">
            <div className="font-label-lg text-label-lg text-on-surface font-bold">
              Logo đại diện cửa hàng
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Khuyến nghị định dạng PNG, JPG hoặc SVG vuông (tối thiểu 500x500px, dưới 5MB).
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                Tải ảnh mới
              </button>
              {data.logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-3 py-1 rounded bg-surface-container-lowest text-error font-label-sm text-label-sm hover:bg-error-container transition-colors cursor-pointer"
                  type="button"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banner Upload Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg py-2 border-t border-outline-variant/20 pt-4">
          <div className="relative group">
            <div className="w-40 h-20 rounded-xl bg-surface-container-highest flex items-center justify-center overflow-hidden shadow-sm border border-outline-variant/30">
              {data.bannerUrl ? (
                <img
                  className="w-full h-full object-cover"
                  alt="Store Banner"
                  src={data.bannerUrl}
                />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-outline">
                  panorama
                </span>
              )}
            </div>
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              type="button"
              title="Thay đổi ảnh bìa"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            </button>
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="space-y-1 flex-1">
            <div className="font-label-lg text-label-lg text-on-surface font-bold flex items-center gap-2">
              <span>Ảnh bìa gian hàng (Banner)</span>
              <span className="text-on-surface-variant text-xs font-normal">(Tùy chọn)</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Khuyến nghị định dạng PNG, JPG hoặc WEBP tỷ lệ 3:1 hoặc 16:9 (1200x400px hoặc 1920x600px, dưới 5MB).
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="px-3 py-1 rounded bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                Tải ảnh bìa mới
              </button>
              {data.bannerUrl && (
                <button
                  onClick={handleRemoveBanner}
                  className="px-3 py-1 rounded bg-surface-container-lowest text-error font-label-sm text-label-sm hover:bg-error-container transition-colors cursor-pointer"
                  type="button"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fields: Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Tên gian hàng (Shop Name) *
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md pr-10 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                type="text"
                value={data.shopName}
                onChange={(e) => {
                  const name = e.target.value;
                  onChange({
                    shopName: name,
                    slug: toSlug(name),
                    customStoreUrl: toSlug(name),
                  });
                }}
                placeholder="VD: UrbanStep Sneaker Hub"
              />
              {data.shopName && (
                <span className="absolute right-3 top-3.5 material-symbols-outlined text-secondary text-[20px]">
                  check_circle
                </span>
              )}
            </div>
            {data.shopName && (
              <p className="font-body-sm text-body-sm text-secondary font-medium flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                Tên hợp lệ và chưa có ai sử dụng trên hệ thống MarketPulse
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Danh mục ngành hàng chính *
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={data.category}
              onChange={(e) => onChange({ category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Dùng để phân bổ phí sàn hoa hồng và kết nối chuyên viên hỗ trợ.
            </p>
          </div>
        </div>

        {/* Custom Store URL */}
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface block">
            Đường dẫn gian hàng trực tuyến (Custom Store URL)
          </label>
          <div className="flex items-center rounded-lg shadow-sm bg-surface-container-lowest overflow-hidden border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary">
            <span className="h-11 px-3.5 bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex items-center select-none shrink-0">
              https://marketpulse.vn/shop/
            </span>
            <input
              className="flex-1 h-11 px-3 bg-transparent text-primary font-label-md text-label-md font-semibold outline-none placeholder:text-outline"
              type="text"
              placeholder="urbanstep-sneaker"
              value={data.customStoreUrl || ""}
              onChange={(e) => onChange({ customStoreUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Bio textarea */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-on-surface">
              Mô tả ngắn về Shop (Bio / Giới thiệu)
            </label>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
              {data.bio.length} / 300 ký tự
            </span>
          </div>
          <textarea
            className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            maxLength={300}
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Mô tả phong cách, sản phẩm tiêu biểu và cam kết chất lượng của gian hàng..."
          />
        </div>
      </div>

      {/* Warehouse Logistics Address Group */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-space-md">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">local_shipping</span>
          Địa chỉ kho lấy hàng &amp; Trả hàng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Tên người liên hệ phụ trách kho *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              value={data.warehouseContact}
              onChange={(e) => onChange({ warehouseContact: e.target.value })}
              placeholder="VD: Nguyễn Văn An"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Số điện thoại bưu tá liên hệ lấy hàng *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              type="text"
              value={data.warehousePhone}
              onChange={(e) => onChange({ warehousePhone: e.target.value })}
              placeholder="0909 123 456"
            />
          </div>
        </div>

        {/* Cascading Location Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Tỉnh / Thành phố *
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={data.province}
              onChange={(e) => {
                const nextProv = e.target.value;
                const nextDistricts = DISTRICTS_MAP[nextProv] || [];
                const firstDist = nextDistricts[0] || "";
                const nextWards = WARDS_MAP[firstDist] || [];
                onChange({
                  province: nextProv,
                  district: firstDist,
                  ward: nextWards[0] || "",
                });
              }}
            >
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Quận / Huyện *
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={data.district}
              onChange={(e) => {
                const nextDist = e.target.value;
                const nextWards = WARDS_MAP[nextDist] || [];
                onChange({
                  district: nextDist,
                  ward: nextWards[0] || "",
                });
              }}
            >
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Phường / Xã *
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={data.ward}
              onChange={(e) => onChange({ ward: e.target.value })}
            >
              {wards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Address */}
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface block">
            Địa chỉ chi tiết (Số nhà, tên tòa nhà, tên đường) *
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            type="text"
            value={data.addressDetail}
            onChange={(e) => onChange({ addressDetail: e.target.value })}
            placeholder="Số nhà, tên đường, tòa nhà, tầng (VD: Tầng 2, Tòa nhà Bitexco...)"
          />
        </div>

        {/* Pickup Note for Courier */}
        <div className="space-y-1">
          <label className="font-label-md text-label-md text-on-surface block">
            Ghi chú lấy hàng cho bưu tá (Pickup Instructions)
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            type="text"
            value={data.pickupNote || ""}
            onChange={(e) => onChange({ pickupNote: e.target.value })}
            placeholder="VD: Kho xuất hàng tại cửa sau, bưu tá gọi trước 15 phút khi đến lấy hàng..."
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant block">
            Hướng dẫn bưu tá tìm đúng lối vào kho, bãi gửi xe hoặc vị trí ký nhận biên bản bàn giao.
          </span>
        </div>

        {/* Same address for return */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              checked={data.sameReturnAddress}
              onChange={(e) => onChange({ sameReturnAddress: e.target.checked })}
              className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
              type="checkbox"
            />
            <span className="font-body-md text-body-md text-on-surface">
              Sử dụng cùng địa chỉ kho lấy hàng làm địa chỉ nhận hàng hoàn/trả về
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step2StorePanel;
