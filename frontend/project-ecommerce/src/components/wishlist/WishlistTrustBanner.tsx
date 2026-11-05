import React from "react";

export const WishlistTrustBanner: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 border border-outline-variant/40">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">price_change</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            Cảnh báo hạ giá tự động
          </h4>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Sản phẩm trong danh sách sẽ kích hoạt chuông thông báo khi nhà bán hàng áp dụng mã voucher hoặc Flash Sale.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">lock_clock</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            Lưu trữ giỏ hàng 30 ngày
          </h4>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Các sản phẩm yêu thích được lưu cố định trên đám mây tài khoản, đồng bộ mượt mà giữa ứng dụng điện thoại và web.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">verified</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            100% Cửa hàng xác thực
          </h4>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Mọi sản phẩm từ nghệ nhân và thương hiệu địa phương đều trải qua quy trình kiểm duyệt chất lượng 5 bước nghiêm ngặt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WishlistTrustBanner;

