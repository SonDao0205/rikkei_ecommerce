import React, { useState } from "react";
import type { UserOrder } from "../../../../types";

export interface OrderDetailStepperProps {
  order: UserOrder;
  onCopySuccess?: (msg: string) => void;
  onShowToast?: (msg: string) => void;
}

export const OrderDetailStepper: React.FC<OrderDetailStepperProps> = ({
  order,
  onCopySuccess,
  onShowToast,
}) => {
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);

  // Stepper progress index (0 to 4)
  const getStepIndex = () => {
    switch (order.status) {
      case "pending":
        return 0;
      case "packing":
        return 1;
      case "shipping":
        return 3;
      case "completed":
        return 4;
      case "cancelled":
      case "returned":
        return 1;
      default:
        return 2;
    }
  };

  const currentStep = getStepIndex();

  const handleCopy = (code: string) => {
    const notify = onCopySuccess || onShowToast;
    navigator.clipboard.writeText(code).then(() => {
      notify?.(`Đã sao chép mã vận đơn: ${code}`);
    }).catch(() => {
      notify?.("Sao chép thành công!");
    });
  };

  const trackingCode = order.trackingCode || "GHN88391204VN";
  const courierName = order.courierName || "Giao Hàng Nhanh (GHN Express)";
  const estimatedDate = order.estimatedDeliveryDate || "28/10/2026";
  const timelineLogs = order.timeline || [];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/40 flex flex-col gap-8">
      {/* ETA Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-outline-variant/20 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">local_shipping</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Tiến độ giao hàng
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Bưu kiện đang di chuyển tới điểm giao nhận gần nhất
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md self-start sm:self-auto shadow-xs">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            event_available
          </span>
          <span>
            Dự kiến nhận: <strong>{estimatedDate}</strong> (Còn 1-2 ngày)
          </span>
        </div>
      </div>

      {/* Horizontal 5-Step Visual Stepper */}
      <div className="w-full py-2">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-0 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative group">
            <div
              className={`hidden sm:block absolute top-5 left-1/2 w-full h-1 -z-0 ${
                currentStep >= 1 ? "bg-secondary-container" : "bg-surface-container-high"
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ring-4 ${
                currentStep === 0
                  ? "bg-primary-container text-on-primary ring-primary-fixed animate-pulse"
                  : currentStep > 0
                  ? "bg-secondary-fixed text-secondary ring-surface-container-lowest"
                  : "bg-surface-container text-outline ring-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] font-bold">
                {currentStep > 0 ? "check" : "shopping_cart_checkout"}
              </span>
            </div>
            <span
              className={`mt-3 font-label-md text-label-md font-bold ${
                currentStep === 0 ? "text-primary" : "text-on-surface"
              }`}
            >
              Đơn hàng đã đặt
            </span>
            <span className="font-body-sm text-body-sm text-outline mt-0.5">
              {order.createdAt ? order.createdAt.split("-")[0] : "26/10 14:20"}
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative group">
            <div
              className={`hidden sm:block absolute top-5 left-1/2 w-full h-1 -z-0 ${
                currentStep >= 2 ? "bg-secondary-container" : "bg-surface-container-high"
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ring-4 ${
                currentStep === 1
                  ? "bg-primary-container text-on-primary ring-primary-fixed animate-pulse"
                  : currentStep > 1
                  ? "bg-secondary-fixed text-secondary ring-surface-container-lowest"
                  : "bg-surface-container text-outline ring-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] font-bold">
                {currentStep > 1 ? "check" : "inventory_2"}
              </span>
            </div>
            <span
              className={`mt-3 font-label-md text-label-md font-bold ${
                currentStep === 1 ? "text-primary" : "text-on-surface"
              }`}
            >
              Chờ lấy hàng
            </span>
            <span className="font-body-sm text-body-sm text-outline mt-0.5">
              26/10 14:45
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative group">
            <div
              className={`hidden sm:block absolute top-5 left-1/2 w-full h-1 -z-0 ${
                currentStep >= 3 ? "bg-secondary-container" : "bg-surface-container-high"
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ring-4 ${
                currentStep === 2
                  ? "bg-primary-container text-on-primary ring-primary-fixed animate-pulse"
                  : currentStep > 2
                  ? "bg-secondary-fixed text-secondary ring-surface-container-lowest"
                  : "bg-surface-container text-outline ring-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] font-bold">
                {currentStep > 2 ? "check" : "directions_walk"}
              </span>
            </div>
            <span
              className={`mt-3 font-label-md text-label-md font-bold ${
                currentStep === 2 ? "text-primary" : "text-on-surface"
              }`}
            >
              Đã giao bưu tá
            </span>
            <span className="font-body-sm text-body-sm text-outline mt-0.5">
              26/10 18:30
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center relative group">
            <div
              className={`hidden sm:block absolute top-5 left-1/2 w-full h-1 -z-0 ${
                currentStep >= 4 ? "bg-secondary-container" : "bg-surface-container-high"
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-md ring-4 ${
                currentStep === 3
                  ? "bg-primary-container text-on-primary ring-primary-fixed animate-pulse"
                  : currentStep > 3
                  ? "bg-secondary-fixed text-secondary ring-surface-container-lowest"
                  : "bg-surface-container text-outline ring-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {currentStep > 3 ? "check" : "local_shipping"}
              </span>
            </div>
            <span
              className={`mt-3 font-label-md text-label-md font-bold ${
                currentStep === 3 ? "text-primary" : "text-on-surface"
              }`}
            >
              Đang vận chuyển
            </span>
            <span
              className={`font-body-sm text-body-sm mt-0.5 ${
                currentStep === 3 ? "text-primary font-medium" : "text-outline"
              }`}
            >
              27/10 08:15
            </span>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center text-center relative group">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-inner ring-4 ${
                currentStep === 4
                  ? "bg-emerald-500 text-on-primary ring-emerald-200"
                  : "bg-surface-container text-outline ring-surface-container-lowest"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {currentStep === 4 ? "check_circle" : "inventory_2"}
              </span>
            </div>
            <span
              className={`mt-3 font-label-md text-label-md font-bold ${
                currentStep === 4 ? "text-emerald-700" : "text-outline"
              }`}
            >
              Giao thành công
            </span>
            <span className="font-body-sm text-body-sm text-outline mt-0.5">
              Dự kiến {estimatedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Carrier Details & Collapsible Timeline Container */}
      <div className="rounded-xl bg-surface-container-low p-5 flex flex-col gap-5 border border-outline-variant/30">
        {/* Carrier Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest p-2 shadow-xs flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[28px]">
                directions_boat
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  {courierName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed uppercase tracking-wider">
                  Express
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-body-sm text-body-sm text-outline">
                  Mã vận đơn:
                </span>
                <span className="font-label-md text-label-md font-mono font-bold text-on-surface tracking-wide">
                  {trackingCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(trackingCode)}
                  className="p-1 hover:bg-surface-container rounded transition-colors text-primary flex items-center cursor-pointer"
                  title="Sao chép mã"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    content_copy
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://ghn.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors shadow-xs"
            >
              <span>Tra cứu trên website GHN</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>

            <button
              type="button"
              onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
            >
              <span>{isTimelineCollapsed ? "Xem chi tiết" : "Thu gọn"}</span>
              <span className="material-symbols-outlined text-[18px]">
                {isTimelineCollapsed ? "expand_more" : "expand_less"}
              </span>
            </button>
          </div>
        </div>

        {/* Detailed Timeline Log */}
        {!isTimelineCollapsed && (
          <div className="flex flex-col gap-4 pl-2 pr-1 transition-all duration-300 animate-fade-in">
            {timelineLogs.map((log, index) => {
              const isLast = index === timelineLogs.length - 1;

              return (
                <div key={log.id || index} className="flex items-start gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3.5 h-3.5 rounded-full shadow-xs ${
                        log.isLatest
                          ? "bg-primary ring-4 ring-primary-fixed"
                          : "bg-outline"
                      }`}
                    />
                    {!isLast && (
                      <div className="w-0.5 h-full min-h-[46px] bg-outline-variant my-1" />
                    )}
                  </div>

                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.isLatest && (
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary text-on-primary font-bold">
                          Mới nhất
                        </span>
                      )}
                      <span
                        className={`font-label-md text-label-md font-bold ${
                          log.isLatest ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        {log.time}
                      </span>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface font-medium mt-1">
                      {log.title}
                    </p>

                    {log.subtitle && (
                      <span className="font-body-sm text-body-sm text-outline block mt-0.5">
                        {log.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderDetailStepper;
