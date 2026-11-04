import React from "react";
import { Link } from "react-router-dom";
import type { ShopStoreData } from "../../../../types";

interface Step4StoreCardProps {
  store: ShopStoreData;
}

export const Step4StoreCard: React.FC<Step4StoreCardProps> = ({ store }) => {
  const fullAddress = [
    store.addressDetail || store.pickupAddress?.addressLine,
    store.ward || store.pickupAddress?.ward,
    store.district || store.pickupAddress?.district,
    store.province || store.pickupAddress?.province,
  ]
    .filter(Boolean)
    .join(", ") ||
    "Tầng 2, Tòa nhà Bitexco Financial Tower, số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh";

  const defaultBanner =
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80";
  const defaultLogo =
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";

  return (
    <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
        <div className="flex items-center gap-space-sm">
          <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary font-label-md text-label-md flex items-center justify-center font-bold">
            2
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Thông tin Gian hàng &amp; Vận hành kho lấy hàng
          </h2>
        </div>
        <Link
          to="/register-open-shop/step2"
          className="px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-space-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Chỉnh sửa (Bước 2)</span>
        </Link>
      </div>

      {/* Mini Storefront Preview Box */}
      <div className="rounded-xl bg-surface-container-low overflow-hidden border border-outline-variant/30 shadow-sm flex flex-col">
        {/* Cover / Banner */}
        <div className="relative w-full h-32 md:h-36 bg-surface-container overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={store.bannerUrl || defaultBanner}
            alt="Store banner"
          />
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]"></div>
          <div className="absolute top-3 right-4 flex items-center gap-space-xs">
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-xl text-secondary font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[13px]">image</span>
              Ảnh bìa: {store.bannerName ? "Đã tải lên" : "1920 × 600 px (Mặc định)"}
            </span>
          </div>
        </div>

        {/* Store Avatar & Basic Profile info */}
        <div className="p-space-md pt-0 relative flex flex-col md:flex-row items-start md:items-end gap-space-md -mt-10">
          <div className="relative shrink-0">
            <img
              className="w-20 h-20 rounded-2xl object-cover shadow-md bg-surface-container border-2 border-surface-container-lowest"
              src={store.logoUrl || defaultLogo}
              alt="Shop Logo"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[14px]">storefront</span>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs grow min-w-0 pt-2 md:pt-0">
            <div className="flex flex-wrap items-center gap-space-xs">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                {store.shopName || "UrbanStep Sneaker Hub"}
              </h3>
              <span className="px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Hợp lệ
              </span>
              <span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                {store.category || "Giày dép & Thời trang Streetwear"}
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
              {store.description ||
                "Chuyên phân phối các dòng giày sneaker và phụ kiện thời trang đường phố chính hãng, dịch vụ bảo hành đế giày 12 tháng, đổi size miễn phí trong 7 ngày."}
            </p>
          </div>
        </div>
      </div>

      {/* Pickup Hub Address */}
      <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">warehouse</span>
            Địa chỉ Kho lấy hàng tiêu chuẩn (Pickup Hub)
          </span>
          <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-bold shadow-xs">
            Đã chuẩn hóa tọa độ GPS
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface font-medium mt-1">
          {fullAddress}
        </p>
        <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm mt-1">
          <span>
            Người phụ trách kho:{" "}
            <strong className="text-on-surface">
              {store.warehouseContact || store.pickupAddress?.contactName || "Nguyễn Văn An"}
            </strong>{" "}
            ({store.warehousePhone || store.pickupAddress?.contactPhone || "0909 123 456"})
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
            Kho hoàn trả:{" "}
            {store.sameReturnAddress || store.returnSameAsPickup
              ? "Sử dụng chung địa chỉ kho lấy hàng"
              : "Địa chỉ kho riêng biệt"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step4StoreCard;
