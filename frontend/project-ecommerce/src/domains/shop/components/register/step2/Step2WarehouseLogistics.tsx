import React from "react";
import type { ShopStoreData } from "@/shared/types";
import { Step2WarehouseMap } from "@/domains/shop/components/register/step2/Step2WarehouseMap";

interface Step2WarehouseLogisticsProps {
  data: ShopStoreData;
  onChange: (fields: Partial<ShopStoreData>) => void;
}

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Cần Thơ",
  "Hải Phòng",
];

const DISTRICTS_MAP: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Quận Bình Thạnh", "TP. Thủ Đức"],
  "Hà Nội": ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Đống Đa", "Quận Cầu Giấy"],
  "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà"],
  "Bình Dương": ["TP. Thủ Dầu Một", "TP. Dĩ An", "TP. Thuận An"],
  "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng"],
  "Hải Phòng": ["Quận Hồng Bàng", "Quận Ngô Quyền", "Quận Lê Chân"],
};

const WARDS_MAP: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao", "Phường Nguyễn Thái Bình"],
  "Quận 3": ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3"],
  "Quận 7": ["Phường Tân Phong", "Phường Tân Phú", "Phường Tân Thuận Đông"],
  "Quận Bình Thạnh": ["Phường 25", "Phường 26", "Phường 19"],
  "TP. Thủ Đức": ["Phường An Phú", "Phường Thảo Điền", "Phường Hiệp Phú"],
};

export const Step2WarehouseLogistics: React.FC<Step2WarehouseLogisticsProps> = ({
  data,
  onChange,
}) => {
  const currentDistricts = DISTRICTS_MAP[data.province] || DISTRICTS_MAP["TP. Hồ Chí Minh"];
  const currentWards = WARDS_MAP[data.district] || WARDS_MAP["Quận 1"] || ["Phường 1", "Phường 2"];

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg sm:p-space-xl flex flex-col gap-space-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
            <span className="material-symbols-outlined text-[24px]">warehouse</span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              2. Thông tin Kho hàng &amp; Vận hành lấy hàng
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Địa điểm bưu tá các hãng vận chuyển tới lấy bưu kiện hàng ngày
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">
          Pickup Hub
        </span>
      </div>

      {/* Logistics Notice Banner */}
      <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            Lưu ý quan trọng về điều phối lấy hàng:
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Các đối tác vận chuyển liên kết (GHTK, Giao Hàng Nhanh, Viettel Post, Shopee Xpress) sẽ sử dụng tọa độ và địa chỉ này để quét mã điều phối tài xế đến lấy kiện hàng mỗi khi phát sinh đơn mới.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
        {/* Người liên hệ kho */}
        <div className="md:col-span-6 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Tên người liên hệ kho / Quản lý kho <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none placeholder:text-outline border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
              placeholder="Nhập tên người liên hệ kho (VD: Nguyễn Văn An)"
              type="text"
              value={data.warehouseContact}
              onChange={(e) => onChange({ warehouseContact: e.target.value })}
            />
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Người trực tiếp bàn giao hàng hóa cho bưu tá
          </span>
        </div>

        {/* SĐT bưu tá gọi lấy hàng */}
        <div className="md:col-span-6 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1">
              Số điện thoại kho <span className="text-error font-bold">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none placeholder:text-outline border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary font-mono"
              placeholder="Nhập số điện thoại kho (VD: 0909 123 456)"
              type="text"
              value={data.warehousePhone}
              onChange={(e) => onChange({ warehousePhone: e.target.value })}
            />
          </div>
        </div>

        {/* Cascading Dropdowns: 3 Cấp */}
        {/* Tỉnh / Thành phố */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Tỉnh / Thành phố <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none appearance-none cursor-pointer border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
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
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Quận / Huyện */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Quận / Huyện <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none appearance-none cursor-pointer border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
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
              {currentDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Phường / Xã */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Phường / Xã <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full h-12 px-4 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none appearance-none cursor-pointer border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
              value={data.ward}
              onChange={(e) => onChange({ ward: e.target.value })}
            >
              {currentWards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <div className="md:col-span-12 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà, tầng) <span className="text-error font-bold">*</span>
          </label>
          <div className="relative">
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none placeholder:text-outline border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
              placeholder="Số nhà, tên đường, tòa nhà, tầng..."
              type="text"
              value={data.addressDetail}
              onChange={(e) => onChange({ addressDetail: e.target.value })}
            />
          </div>
        </div>

        {/* Ghi chú lấy hàng cho bưu tá */}
        <div className="md:col-span-12 flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold">
            Ghi chú lấy hàng cho bưu tá (Pickup Instructions for Courier)
          </label>
          <input
            className="w-full h-12 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none placeholder:text-outline border border-outline-variant/30 focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] focus:border-primary"
            placeholder="VD: Kho xuất hàng tại cửa sau đường Hồ Tùng Mậu, bưu tá gọi trước 15 phút..."
            type="text"
            value={data.pickupNote || ""}
            onChange={(e) => onChange({ pickupNote: e.target.value })}
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Hướng dẫn bưu tá tìm đúng lối vào kho, bãi gửi xe hoặc vị trí ký nhận biên bản bàn giao.
          </span>
        </div>

        {/* Interactive Leaflet Map for Warehouse GPS Coordinates */}
        <div className="md:col-span-12">
          <Step2WarehouseMap
            province={data.province}
            district={data.district}
            ward={data.ward}
            addressDetail={data.addressDetail}
          />
        </div>
      </div>
    </section>
  );
};

export default Step2WarehouseLogistics;
