import React from "react";

export const Step2IntroBanner: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg sm:p-space-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
      <div className="flex flex-col gap-1 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          <span>Vận hành &amp; Hậu cần Marketplace</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
          Thiết lập gian hàng &amp; Địa chỉ kho lấy hàng
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Cung cấp nhận diện thương hiệu gian hàng và thông tin kho để đơn vị vận chuyển (3PL) đến điều phối lấy hàng chuẩn xác.
        </p>
      </div>
    </div>
  );
};

export default Step2IntroBanner;
