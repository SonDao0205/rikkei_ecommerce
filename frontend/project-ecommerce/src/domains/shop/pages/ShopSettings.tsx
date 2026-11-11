import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import ShopLayout from "@/app/layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchMyShop,
  updateMyShop,
  clearMyShopMessages,
} from "@/domains/shop/state/myShopSlice";
import { isValidVietnamesePhone } from "@/shared/utils/validation";
import type { Shop, ShopProfilePayload } from "@/shared/types";

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Cần Thơ",
  "Hải Phòng",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "Khánh Hòa",
  "Lâm Đồng",
];

const DISTRICTS_MAP: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận 10", "Quận Bình Thạnh", "Quận Tân Bình", "Quận Gò Vấp", "TP. Thủ Đức"],
  "Hà Nội": ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Đống Đa", "Quận Cầu Giấy", "Quận Hai Bà Trưng", "Quận Tây Hồ", "Quận Thanh Xuân"],
  "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Cẩm Lệ", "Quận Liên Chiểu"],
  "Bình Dương": ["TP. Thủ Dầu Một", "TP. Dĩ An", "TP. Thuận An", "TP. Tân Uyên", "Thị xã Bến Cát"],
  "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn", "Quận Thốt Nốt"],
  "Hải Phòng": ["Quận Hồng Bàng", "Quận Ngô Quyền", "Quận Lê Chân", "Quận Hải An", "Quận Kiến An"],
  "Đồng Nai": ["TP. Biên Hòa", "TP. Long Khánh", "Huyện Long Thành", "Huyện Nhơn Trạch"],
  "Bà Rịa - Vũng Tàu": ["TP. Vũng Tàu", "TP. Bà Rịa", "Thị xã Phú Mỹ"],
  "Khánh Hòa": ["TP. Nha Trang", "TP. Cam Ranh", "Thị xã Ninh Hòa"],
  "Lâm Đồng": ["TP. Đà Lạt", "TP. Bảo Lộc", "Huyện Đức Trọng"],
};

const WARDS_MAP: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao", "Phường Nguyễn Thái Bình", "Phường Tân Định", "Phường Cầu Ông Lãnh"],
  "Quận 3": ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5"],
  "Quận 7": ["Phường Tân Phong", "Phường Tân Phú", "Phường Tân Thuận Đông", "Phường Phú Mỹ", "Phường Tân Hưng"],
  "Quận Bình Thạnh": ["Phường 25", "Phường 26", "Phường 19", "Phường 21", "Phường 22"],
  "TP. Thủ Đức": ["Phường An Phú", "Phường Thảo Điền", "Phường Hiệp Phú", "Phường Linh Trung", "Phường Tam Phú"],
  "Quận Hoàn Kiếm": ["Phường Tràng Tiền", "Phường Hàng Bạc", "Phường Hàng Gai", "Phường Lý Thái Tổ"],
  "Quận Ba Đình": ["Phường Điện Biên", "Phường Đội Cấn", "Phường Giảng Võ", "Phường Kim Mã"],
  "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Nghĩa Đô", "Phường Quan Hoa", "Phường Yên Hòa"],
};

interface ShopSettingsFormProps {
  shop: Shop;
}

const ShopSettingsForm: React.FC<ShopSettingsFormProps> = ({ shop }) => {
  const dispatch = useAppDispatch();
  const { updating, error: reduxError, successMessage: reduxSuccessMessage } = useAppSelector(
    (state) => state.myShop
  );
  const { user } = useAppSelector((state) => state.auth);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"branding" | "logistics" | "compliance">("branding");

  // Form Initializations
  const [shopName, setShopName] = useState(shop.name || "");
  const [shopPhone, setShopPhone] = useState(shop.phone || "");
  const [description, setDescription] = useState(shop.description || "");
  const [logoUrl, setLogoUrl] = useState(shop.logo_url || "");
  const [bannerUrl, setBannerUrl] = useState(shop.banner_url || "");

  // Address Initializations
  const initialAddressParsed = useMemo(() => {
    const full = shop.warehouse_address || "";
    const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 4) {
      const prov = parts[parts.length - 1];
      const dist = parts[parts.length - 2];
      const w = parts[parts.length - 3];
      const detail = parts.slice(0, parts.length - 3).join(", ");
      return {
        prov: PROVINCES.includes(prov) ? prov : PROVINCES[0],
        dist,
        w,
        detail,
        full,
      };
    }
    return {
      prov: PROVINCES[0],
      dist: DISTRICTS_MAP[PROVINCES[0]][0] || "",
      w: WARDS_MAP[DISTRICTS_MAP[PROVINCES[0]][0]]?.[0] || "",
      detail: full,
      full,
    };
  }, [shop.warehouse_address]);

  const [province, setProvince] = useState(initialAddressParsed.prov);
  const [district, setDistrict] = useState(initialAddressParsed.dist);
  const [ward, setWard] = useState(initialAddressParsed.w);
  const [addressDetail, setAddressDetail] = useState(initialAddressParsed.detail);
  const [isManualAddress, setIsManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState(initialAddressParsed.full);

  // UI States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copyToast, setCopyToast] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Computed full address
  const computedWarehouseAddress = useMemo(() => {
    if (isManualAddress) {
      return manualAddress.trim();
    }
    const parts = [addressDetail.trim(), ward, district, province].filter(Boolean);
    return parts.join(", ");
  }, [isManualAddress, manualAddress, addressDetail, ward, district, province]);

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    const origName = shop.name || "";
    const origPhone = shop.phone || "";
    const origDesc = shop.description || "";
    const origLogo = shop.logo_url || "";
    const origBanner = shop.banner_url || "";
    const origAddress = shop.warehouse_address || "";

    return (
      shopName.trim() !== origName.trim() ||
      shopPhone.trim() !== origPhone.trim() ||
      description.trim() !== origDesc.trim() ||
      logoUrl.trim() !== origLogo.trim() ||
      bannerUrl.trim() !== origBanner.trim() ||
      computedWarehouseAddress.trim() !== origAddress.trim()
    );
  }, [shop, shopName, shopPhone, description, logoUrl, bannerUrl, computedWarehouseAddress]);

  // File upload handlers
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", text: "Vui lòng chọn định dạng ảnh hợp lệ (PNG, JPG, WEBP)." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ type: "error", text: "Dung lượng ảnh đại diện không được vượt quá 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", text: "Vui lòng chọn định dạng ảnh hợp lệ (PNG, JPG, WEBP)." });
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setToast({ type: "error", text: "Dung lượng ảnh bìa không được vượt quá 8MB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setBannerUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy link
  const handleCopyLink = () => {
    if (!shop.id) return;
    const url = `${window.location.origin}/shop/${shop.id}`;
    void navigator.clipboard.writeText(url);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  // Form Reset
  const handleReset = () => {
    setShopName(shop.name || "");
    setShopPhone(shop.phone || "");
    setDescription(shop.description || "");
    setLogoUrl(shop.logo_url || "");
    setBannerUrl(shop.banner_url || "");
    setManualAddress(shop.warehouse_address || "");

    const parts = (shop.warehouse_address || "").split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 4) {
      setProvince(parts[parts.length - 1]);
      setDistrict(parts[parts.length - 2]);
      setWard(parts[parts.length - 3]);
      setAddressDetail(parts.slice(0, parts.length - 3).join(", "));
    } else {
      setAddressDetail(shop.warehouse_address || "");
    }
    setFormErrors({});
    setToast({ type: "success", text: "Đã hoàn tác các thay đổi chưa lưu." });
  };

  // Form Validation & Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};

    const trimmedName = shopName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 150) {
      errors.name = "Tên gian hàng phải từ 2 đến 150 ký tự.";
    }

    const trimmedPhone = shopPhone.trim().replace(/\s+/g, "");
    if (!trimmedPhone) {
      errors.phone = "Vui lòng nhập số điện thoại kho hoặc liên hệ của gian hàng.";
    } else if (!isValidVietnamesePhone(trimmedPhone)) {
      errors.phone = "Số điện thoại không đúng định dạng số di động Việt Nam (VD: 0912 345 678).";
    }

    const trimmedAddress = computedWarehouseAddress.trim();
    if (trimmedAddress.length < 5 || trimmedAddress.length > 500) {
      errors.address = "Địa chỉ kho hàng phải từ 5 đến 500 ký tự.";
    }

    if (description.length > 2000) {
      errors.description = "Mô tả gian hàng không được vượt quá 2000 ký tự.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({
        type: "error",
        text: "Vui lòng kiểm tra lại các thông tin chưa hợp lệ bên dưới.",
      });
      return;
    }

    const formattedPhone =
      trimmedPhone.startsWith("0") || trimmedPhone.startsWith("+")
        ? trimmedPhone
        : `0${trimmedPhone}`;

    const payload: ShopProfilePayload = {
      name: trimmedName,
      phone: formattedPhone,
      warehouse_address: trimmedAddress,
      description: description.trim() || "Gian hàng chính hãng phân phối tại MarketPulse.",
      logo_url: logoUrl.trim() || null,
      banner_url: bannerUrl.trim() || null,
    };

    try {
      await dispatch(updateMyShop(payload)).unwrap();
      setToast({
        type: "success",
        text: "Cập nhật hồ sơ gian hàng thành công!",
      });
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "Không thể cập nhật hồ sơ gian hàng. Vui lòng thử lại.";
      setToast({ type: "error", text: msg });
    }
  };

  const activeToast = toast || (reduxSuccessMessage ? { type: "success" as const, text: reduxSuccessMessage } : reduxError ? { type: "error" as const, text: reduxError } : null);

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* 1. Hero Identity Banner Card */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col">
        {/* Cover Banner Area */}
        <div className="relative w-full h-44 sm:h-56 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary-container overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Shop Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/40">
              <span className="material-symbols-outlined text-[72px]">panorama</span>
            </div>
          )}
          {/* Banner overlay button */}
          <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>{bannerUrl ? "Đổi ảnh bìa" : "Tải ảnh bìa"}</span>
            </button>
            {bannerUrl && (
              <button
                type="button"
                onClick={() => setBannerUrl("")}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-error text-white backdrop-blur-md text-xs font-semibold shadow-md transition-all cursor-pointer"
                title="Xóa ảnh bìa"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Shop Profile Ribbon Under Banner */}
        <div className="px-5 sm:px-8 pb-5 pt-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
            {/* Shop Avatar */}
            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-container-lowest border-4 border-surface-container-lowest shadow-lg overflow-hidden shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo gian hàng"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[36px]">storefront</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5 cursor-pointer"
                title="Đổi ảnh logo gian hàng"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <span className="text-[10px] font-semibold">Đổi logo</span>
              </button>
            </div>

            {/* Identity text */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {shopName || "Tên gian hàng"}
                </h2>
                {shop.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary font-label-sm text-[10px] font-bold uppercase tracking-wider">
                    {shop.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-1 flex-wrap font-body-sm">
                <span className="font-mono text-primary font-semibold">
                  ID: #SHOP-{String(shop.id).padStart(4, "0")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span>{shop.follower_count || 0} người theo dõi</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Đối tác chính thức</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats mini badges */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer shadow-xs"
              title="Sao chép link shop"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copyToast ? "check" : "link"}
              </span>
              <span>{copyToast ? "Đã copy link!" : "Link gian hàng"}</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="block font-bold text-emerald-600 text-sm">
                {shop.status === "ACTIVE" ? "100% Sẵn sàng" : "Chờ duyệt"}
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">Vận hành đơn hàng</span>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleLogoFileChange}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleBannerFileChange}
        />
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "branding"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">branding_watermark</span>
          <span>1. Hồ sơ thương hiệu &amp; Nhận diện</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logistics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "logistics"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">warehouse</span>
          <span>2. Kho hàng &amp; Thông tin liên hệ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compliance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "compliance"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          <span>3. Pháp lý, Điều khoản &amp; Chính sách</span>
        </button>
      </div>

      {/* TAB 1: Hồ sơ thương hiệu */}
      {activeTab === "branding" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 sm:p-7 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Thông tin nhận diện gian hàng
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tên gọi, logo và hình ảnh đại diện của cửa hàng hiển thị trực tiếp với khách mua sắm.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Hiển thị công khai
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Tên gian hàng */}
            <div className="md:col-span-8 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  Tên gian hàng <span className="text-error font-bold">*</span>
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {shopName.length}/150 ký tự
                </span>
              </label>
              <input
                type="text"
                value={shopName}
                maxLength={150}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Nhập tên nhận diện gian hàng..."
                className={`w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface border focus:outline-none transition-all shadow-xs ${
                  formErrors.name
                    ? "border-error focus:ring-2 focus:ring-error/30"
                    : "border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
              {formErrors.name && (
                <span className="text-error text-xs font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formErrors.name}
                </span>
              )}
              <p className="text-xs text-on-surface-variant mt-0.5">
                Được hiển thị trên các sản phẩm, hóa đơn và trang tìm kiếm của sàn.
              </p>
            </div>

            {/* Mã định danh / URL Shop */}
            <div className="md:col-span-4 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Đường dẫn URL gian hàng
              </label>
              <div className="h-12 px-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex items-center text-xs font-mono text-on-surface-variant truncate">
                <span className="text-outline">shop/</span>
                <span className="font-bold text-primary truncate">{shop.id}</span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Được hệ thống sinh tự động dựa trên mã gian hàng.
              </span>
            </div>

            {/* Logo URL Input & Direct Actions */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                <span>Ảnh đại diện / Logo (URL HTTPS)</span>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Chọn ảnh từ máy
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs text-sm"
                />
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-error cursor-pointer"
                    title="Xóa link ảnh"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Banner URL Input & Direct Actions */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                <span>Ảnh bìa gian hàng (URL HTTPS)</span>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  Chọn ảnh từ máy
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs text-sm"
                />
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-error cursor-pointer"
                    title="Xóa link ảnh"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mô tả gian hàng (Bio) */}
            <div className="md:col-span-12 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                <span>Mô tả ngắn về Shop (Bio / Giới thiệu gian hàng)</span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {description.length}/2000 ký tự
                </span>
              </label>
              <textarea
                rows={4}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả phong cách gian hàng, các dòng sản phẩm đặc sắc, dịch vụ bảo hành, thông điệp dành cho khách hàng..."
                className={`w-full p-4 rounded-xl bg-surface-container-low text-on-surface border focus:outline-none transition-all shadow-xs resize-y ${
                  formErrors.description
                    ? "border-error focus:ring-2 focus:ring-error/30"
                    : "border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
              {formErrors.description && (
                <span className="text-error text-xs font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formErrors.description}
                </span>
              )}
              <span className="text-xs text-on-surface-variant">
                Hiển thị tại trang hồ sơ cửa hàng, thẻ meta tìm kiếm Google và trang chi tiết sản phẩm.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Kho hàng & Liên hệ */}
      {activeTab === "logistics" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 sm:p-7 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Thông tin kho lấy hàng &amp; Vận hành bưu tá
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Địa điểm các đối tác vận chuyển (Viettel Post, GHN, GHTK) đến lấy kiện hàng mỗi ngày.
              </p>
            </div>
            <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
              Logistics Hub
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Số điện thoại kho / hotline */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                <span>Số điện thoại kho hàng / Liên hệ</span>
                <span className="text-error font-bold">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  call
                </span>
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  placeholder="VD: 0912 345 678"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface font-mono border focus:outline-none transition-all shadow-xs ${
                    formErrors.phone
                      ? "border-error focus:ring-2 focus:ring-error/30"
                      : "border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {formErrors.phone && (
                <span className="text-error text-xs font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formErrors.phone}
                </span>
              )}
              <span className="text-xs text-on-surface-variant">
                Số điện thoại bưu tá liên hệ trước khi đến lấy hàng hoặc xử lý hoàn trả.
              </span>
            </div>

            {/* Người sở hữu tài khoản (Readonly) */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Chủ sở hữu gian hàng (Tài khoản)
              </label>
              <div className="h-12 px-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 flex items-center justify-between text-sm">
                <span className="font-medium text-on-surface">
                  {user?.full_name || "Chưa cập nhật"}
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  {user?.email || ""}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Thông tin tài khoản chính phụ trách ký hợp đồng người bán.
              </span>
            </div>

            {/* Chế độ nhập địa chỉ */}
            <div className="md:col-span-12 flex items-center justify-between pt-2">
              <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">pin_drop</span>
                <span>Địa chỉ kho lấy hàng tiêu chuẩn</span>
                <span className="text-error font-bold">*</span>
              </span>
              <button
                type="button"
                onClick={() => setIsManualAddress((prev) => !prev)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {isManualAddress ? "Sử dụng bộ chọn Tỉnh / Huyện / Xã" : "Nhập trực tiếp bằng văn bản"}
              </button>
            </div>

            {/* Bộ chọn 3 cấp: Tỉnh / Huyện / Xã */}
            {!isManualAddress ? (
              <>
                {/* Tỉnh / TP */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Tỉnh / Thành phố
                  </label>
                  <div className="relative">
                    <select
                      value={province}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        setProvince(newProv);
                        const districts = DISTRICTS_MAP[newProv] || [];
                        const firstDist = districts[0] || "";
                        setDistrict(firstDist);
                        const wards = WARDS_MAP[firstDist] || [];
                        setWard(wards[0] || "");
                      }}
                      className="w-full h-12 px-3.5 pr-10 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer text-sm"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Quận / Huyện */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Quận / Huyện
                  </label>
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setDistrict(newDist);
                        const wards = WARDS_MAP[newDist] || [];
                        setWard(wards[0] || "");
                      }}
                      className="w-full h-12 px-3.5 pr-10 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer text-sm"
                    >
                      {(DISTRICTS_MAP[province] || [district]).filter(Boolean).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Phường / Xã */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Phường / Xã
                  </label>
                  <div className="relative">
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full h-12 px-3.5 pr-10 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer text-sm"
                    >
                      {(WARDS_MAP[district] || [ward, "Phường 1", "Phường 2"]).filter(Boolean).map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Địa chỉ chi tiết */}
                <div className="md:col-span-12 flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Số nhà, tên đường, tòa nhà, tầng...
                  </label>
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="VD: Tòa nhà Bitexco, Số 2 Hải Triều..."
                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                  />
                </div>
              </>
            ) : (
              /* Nhập văn bản trực tiếp */
              <div className="md:col-span-12 flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Toàn bộ địa chỉ kho hàng (Văn bản đầy đủ)
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                  className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
              </div>
            )}

            {/* Xem trước chuỗi địa chỉ được lưu */}
            <div className="md:col-span-12 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
                home_pin
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">Địa chỉ kho gửi bưu tá:</span>
                <span className="text-sm text-on-surface font-medium">
                  {computedWarehouseAddress || "Chưa có địa chỉ chi tiết"}
                </span>
              </div>
            </div>
            {formErrors.address && (
              <div className="md:col-span-12">
                <span className="text-error text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {formErrors.address}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Pháp lý, Điều khoản & Chính sách */}
      {activeTab === "compliance" && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 sm:p-7 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Pháp lý, Thẩm định KYC &amp; Điều khoản người bán
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Thông tin phê duyệt pháp lý và các điều khoản dịch vụ mà gian hàng đã cam kết.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Đã thẩm định
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trạng thái duyệt KYC */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-on-surface text-sm">Hồ sơ thẩm định KYC</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Hồ sơ đã được đội ngũ thẩm định sàn phê duyệt hợp lệ.
                </p>
                <span className="text-xs text-emerald-700 font-semibold mt-2">
                  {shop.approved_at ? `Phê duyệt vào: ${new Date(shop.approved_at).toLocaleString("vi-VN")}` : "Trạng thái: Hoạt động"}
                </span>
              </div>
            </div>

            {/* Điều khoản người bán */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">policy</span>
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-on-surface text-sm">Điều khoản dịch vụ người bán</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Phiên bản áp dụng: {shop.terms_version || "v1.0 (Quy chuẩn MarketPulse 2026)"}
                </p>
                <span className="text-xs text-primary font-semibold mt-2">
                  Đã xác nhận cam kết hàng chính hãng &amp; chống hàng giả
                </span>
              </div>
            </div>
          </div>

          {/* Ghi chú chính sách */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0">
              info
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-bold">Lưu ý quản trị:</span>
              <span>
                Khi đổi tên gian hàng, hệ thống sẽ lưu vết lịch sử trong nhật ký hoạt động. Để đảm bảo quyền lợi của khách hàng, gian hàng cần duy trì đúng các tiêu chuẩn hàng chính hãng và địa chỉ kho cập nhật chính xác.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/30 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span
            className={`w-2 h-2 rounded-full ${
              isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            }`}
          />
          <span>
            {isDirty
              ? "Bạn có các thay đổi chưa lưu."
              : "Tất cả thông tin đang đồng bộ với máy chủ."}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || updating}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface hover:bg-surface-container text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Khôi phục ban đầu
          </button>
          <button
            type="submit"
            disabled={updating || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {activeToast && (
        <div
          className={`fixed bottom-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all border animate-in slide-in-from-bottom-2 ${
            activeToast.type === "success"
              ? "bg-inverse-surface text-inverse-on-surface border-primary/30"
              : "bg-error-container text-on-error-container border-error/40"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] ${
              activeToast.type === "success" ? "text-primary-fixed" : "text-error"
            }`}
          >
            {activeToast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-body-md text-body-md font-medium">{activeToast.text}</span>
          <button
            type="button"
            onClick={() => {
              setToast(null);
              dispatch(clearMyShopMessages());
            }}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </form>
  );
};

export const ShopSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shop, loading } = useAppSelector((state) => state.myShop);

  // Fetch shop data on mount
  useEffect(() => {
    dispatch(fetchMyShop());
  }, [dispatch]);

  return (
    <ShopLayout>
      <div className="relative w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6 font-body-md text-body-md text-on-surface">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant flex-wrap">
          <Link
            to="/shop/dashboard"
            className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">store</span>
            <span>Kênh Người Bán</span>
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="font-semibold text-on-surface">Cài đặt gian hàng</span>
        </nav>

        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                Cài đặt gian hàng
              </h1>
              {shop && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold border ${
                    shop.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : shop.status === "PENDING"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : shop.status === "SUSPENDED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-surface-variant text-on-surface-variant border-outline-variant/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      shop.status === "ACTIVE"
                        ? "bg-emerald-500 animate-pulse"
                        : shop.status === "PENDING"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  />
                  <span>
                    {shop.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : shop.status === "PENDING"
                      ? "Hồ sơ chờ duyệt"
                      : shop.status === "SUSPENDED"
                      ? "Gian hàng tạm ngưng"
                      : shop.status === "REJECTED"
                      ? "Bị từ chối"
                      : "Bản nháp"}
                  </span>
                </span>
              )}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Quản lý toàn bộ thông tin nhận diện thương hiệu, thông tin liên hệ và địa chỉ kho lấy hàng.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {shop?.id && (
              <Link
                to={`/shop/${shop.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                title="Mở xem trang gian hàng của bạn trên sàn MarketPulse"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>Xem shop trên sàn</span>
              </Link>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !shop && (
          <div className="w-full flex flex-col gap-6 animate-pulse">
            <div className="w-full h-48 rounded-2xl bg-surface-container-low" />
            <div className="w-full h-96 rounded-2xl bg-surface-container-low" />
          </div>
        )}

        {/* Main Content Area */}
        {shop && (
          <ShopSettingsForm
            key={`${shop.id}-${shop.updated_at || shop.status}`}
            shop={shop}
          />
        )}
      </div>
    </ShopLayout>
  );
};

export default ShopSettings;
