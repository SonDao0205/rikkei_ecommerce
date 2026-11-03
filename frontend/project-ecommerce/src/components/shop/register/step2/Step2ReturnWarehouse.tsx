import React from "react";
import type { ShopStoreData } from "../../../../types";

interface Step2ReturnWarehouseProps {
  data: ShopStoreData;
  onChange: (fields: Partial<ShopStoreData>) => void;
}

export const Step2ReturnWarehouse: React.FC<Step2ReturnWarehouseProps> = ({
  data,
  onChange,
}) => {
  const fullAddress = data.addressDetail
    ? `${data.addressDetail}, ${data.ward}, ${data.district}, ${data.province}`
    : "Chưa thiết lập địa chỉ kho ở trên";

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg sm:p-space-xl flex flex-col gap-space-md">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
          <span className="material-symbols-outlined text-[24px]">assignment_return</span>
        </div>
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            3. Cấu hình Kho hoàn / trả hàng
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Địa chỉ tiếp nhận hàng thu hồi khi giao không thành công hoặc người mua hoàn trả
          </p>
        </div>
      </div>

      <div className="bg-surface-container-low p-space-md sm:p-space-lg rounded-xl flex flex-col gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              checked={data.sameReturnAddress}
              onChange={(e) => onChange({ sameReturnAddress: e.target.checked })}
              className="w-5 h-5 rounded bg-surface-container-lowest text-primary accent-primary cursor-pointer shadow-sm"
              id="sameReturnWarehouse"
              type="checkbox"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-lg text-label-lg text-on-surface font-bold group-hover:text-primary transition-colors">
              Sử dụng cùng địa chỉ kho lấy hàng làm kho nhận hàng hoàn / trả về
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Hàng hoàn khi bưu tá giao không thành công (sau 3 lần liên hệ thất bại) hoặc các đơn hàng khiếu nại đổi trả sẽ được bưu cục chuyển phát trực tiếp về địa chỉ kho trên:
              <strong className="text-on-surface font-semibold block mt-1">
                {fullAddress}
              </strong>
            </p>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm px-1">
        <span className="material-symbols-outlined text-[18px] text-secondary">info</span>
        <span>
          Nếu có trung tâm xử lý hàng hoàn độc lập, bạn có thể bỏ tích tùy chọn này để cấu hình địa chỉ riêng biệt.
        </span>
      </div>
    </section>
  );
};

export default Step2ReturnWarehouse;
