import React from "react";
import type { ShopOrderShipping } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderShippingCardProps {
  shipping: ShopOrderShipping;
}

export const ShopOrderShippingCard: React.FC<ShopOrderShippingCardProps> = ({
  shipping,
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép mã vận đơn: ${text}`);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Vận chuyển &amp; Giao nhận
          </h2>
          <p className="font-body-sm text-body-sm text-outline">
            Hành trình kiện hàng và thông tin đơn vị vận chuyển
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* Courier & Tracking */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-outline">Đơn vị vận chuyển:</span>
            <span className="font-bold text-on-surface">{shipping.courierLabel}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-outline">Mã vận đơn (Tracking):</span>
            <div className="inline-flex items-center gap-1.5 font-mono font-bold text-primary bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/30">
              <span>{shipping.trackingCode}</span>
              <button
                type="button"
                onClick={() => handleCopy(shipping.trackingCode)}
                className="hover:text-primary-container cursor-pointer"
                title="Sao chép"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-outline">
            <span>Dịch vụ:</span>
            <span>{shipping.servicePackage}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-outline">
            <span>Kiện hàng:</span>
            <span>
              {shipping.weightGram}g • {shipping.dimensionsText}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-outline pt-1 border-t border-outline-variant/20">
            <span>Dự kiến phát hàng:</span>
            <span className="font-bold text-on-surface">{shipping.estimatedDeliveryDate}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-2">
          <p className="font-label-md text-label-md font-bold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">route</span>
            Lịch trình di chuyển bưu kiện:
          </p>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40">
            {shipping.timeline.map((item, idx) => (
              <div key={item.step || idx} className="relative text-xs">
                {/* Bullet */}
                <span
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest ${
                    item.status === "completed"
                      ? "bg-primary text-white"
                      : item.status === "current"
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        item.status === "completed"
                          ? "text-on-surface"
                          : item.status === "current"
                          ? "text-amber-800 font-bold"
                          : "text-outline"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[11px] text-outline font-mono">{item.time}</span>
                  </div>
                  <p className="text-outline text-[11px] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

