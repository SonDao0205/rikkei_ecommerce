import React, { useState } from "react";

interface ProductAccordionsProps {
  description?: string | null;
}

export const ProductAccordions: React.FC<ProductAccordionsProps> = ({
  description,
}) => {
  const [openSection, setOpenSection] = useState<number | null>(1); // Default panel 1 is open

  const toggleSection = (index: number) => {
    setOpenSection((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col gap-2.5 pt-2">
      {/* Accordion Panel 1: Description & Fit Notes */}
      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/30">
        <button
          type="button"
          onClick={() => toggleSection(1)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
        >
          <span className="font-label-lg font-bold text-on-surface flex items-center gap-2 text-sm md:text-base">
            <span className="material-symbols-outlined text-primary text-[20px]">description</span>
            Mô Tả Sản Phẩm &amp; Lưu Ý Sử Dụng
          </span>
          <span
            className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-200 ${
              openSection === 1 ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {openSection === 1 && (
          <div className="px-5 pb-5 text-body-md font-body-md text-on-surface-variant flex flex-col gap-3 text-xs md:text-sm animate-in fade-in duration-200">
            <p className="whitespace-pre-line leading-relaxed">
              {description ||
                "Sản phẩm được tuyển chọn chính hãng, tuân thủ tiêu chuẩn chất lượng cao nhất của sàn MarketPulse. Được gia công tỉ mỉ với nguồn nguyên liệu cao cấp, đảm bảo độ bền tối ưu và trải nghiệm tiện nghi trong mọi hoàn cảnh sử dụng."}
            </p>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1 text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                Khuyến nghị chọn kích cỡ &amp; kiểm tra:
              </span>
              <span>
                Sản phẩm tuân theo form chuẩn thị trường Việt Nam. Nếu bạn có bề ngang bàn chân đầy đặn hoặc muốn mặc thoải mái, vui lòng cân nhắc tăng thêm 1 cỡ (size) so với kích thước thông thường.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accordion Panel 2: Materials & Specs */}
      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/30">
        <button
          type="button"
          onClick={() => toggleSection(2)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
        >
          <span className="font-label-lg font-bold text-on-surface flex items-center gap-2 text-sm md:text-base">
            <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
            Chất Liệu &amp; Tiêu Chuẩn Bảo Quản
          </span>
          <span
            className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-200 ${
              openSection === 2 ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {openSection === 2 && (
          <div className="px-5 pb-5 text-body-sm font-body-sm text-on-surface-variant flex flex-col gap-2 text-xs md:text-sm animate-in fade-in duration-200">
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
              <li>
                <strong className="text-on-surface">Chất liệu cao cấp:</strong> Tuyển chọn kỹ lưỡng, đã qua kiểm định độ bền nhiệt &amp; chống ẩm.
              </li>
              <li>
                <strong className="text-on-surface">Đệm &amp; Lớp lót:</strong> Lót kháng khuẩn OrthoLite Eco™ thoáng khí khử mùi hiệu quả.
              </li>
              <li>
                <strong className="text-on-surface">Phần đế / Khung:</strong> Hợp chất cao su tự nhiên lưu hóa bám sàn vượt trội, chống trơn trượt.
              </li>
              <li>
                <strong className="text-on-surface">Hướng dẫn vệ sinh:</strong> Lau sạch nhẹ nhàng bằng khăn ẩm hoặc bàn chải mềm chuyên dụng. Tránh ngâm nước kéo dài hoặc phơi trực tiếp dưới ánh nắng gắt.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Accordion Panel 3: Delivery & Returns */}
      <div className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant/30">
        <button
          type="button"
          onClick={() => toggleSection(3)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
        >
          <span className="font-label-lg font-bold text-on-surface flex items-center gap-2 text-sm md:text-base">
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            Chính Sách Vận Chuyển, COD &amp; Đổi Trả
          </span>
          <span
            className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-200 ${
              openSection === 3 ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {openSection === 3 && (
          <div className="px-5 pb-5 text-body-sm font-body-sm text-on-surface-variant flex flex-col gap-2.5 text-xs md:text-sm animate-in fade-in duration-200">
            <p>
              <strong className="text-on-surface">Thời gian giao hàng:</strong> Hỏa tốc trong 2 giờ tại nội thành Hà Nội &amp; TP.HCM. Giao hàng tiêu chuẩn toàn quốc từ 1 đến 3 ngày làm việc qua đối tác vận chuyển liên kết.
            </p>
            <p>
              <strong className="text-on-surface">Miễn phí đổi hàng tận nơi:</strong> Trong vòng 7 ngày kể từ khi nhận kiện hàng, bạn được quyền yêu cầu đổi kích cỡ miễn phí hoặc hoàn tiền nếu sản phẩm còn nguyên tem mác chưa qua sử dụng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAccordions;
