import React from "react";

export const OrderGuaranteesStrip: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Guarantee 1 */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">fact_check</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            Đồng kiểm khi nhận hàng
          </span>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Mở hộp kiểm tra ngoại quan cùng bưu tá trước khi thanh toán tiền mặt.
          </p>
        </div>
      </div>

      {/* Guarantee 2 */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">
            published_with_changes
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            Đổi trả miễn phí 7 ngày
          </span>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Hỗ trợ đổi size, màu sắc hoặc hoàn tiền nhanh chóng nếu sản phẩm có lỗi.
          </p>
        </div>
      </div>

      {/* Guarantee 3: Support Contact */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40 flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">support_agent</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs sm:text-sm text-on-surface">
            Trợ giúp 24/7 tức thì
          </span>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Hotline <strong className="text-on-surface">1900 6868</strong> hoặc bấm để kết nối với bộ phận chăm sóc khách hàng.
          </p>
          <a
            href="#"
            className="mt-1.5 text-primary text-xs font-bold flex items-center gap-1 hover:underline"
          >
            <span>Chat trực tuyến với CSKH</span>
            <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default OrderGuaranteesStrip;

