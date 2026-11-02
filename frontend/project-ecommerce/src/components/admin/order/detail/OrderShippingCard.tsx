import React, { useState } from "react";
import type { OrderDetailShipping } from "../../../../types/ecommerce";

interface OrderShippingCardProps {
  shipping: OrderDetailShipping;
  onChangeCourier: () => void;
}

export const OrderShippingCard: React.FC<OrderShippingCardProps> = ({
  shipping,
  onChangeCourier,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(shipping.trackingCode).then(() => {
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Điều phối Vận chuyển
            </h3>
            <span className="text-[11px] text-slate-500">Đối tác 3PL Logistics</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
          {shipping.courier}
        </span>
      </div>

      {/* Carrier & Tracking Info */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Mã vận đơn (Waybill):</span>
          <div className="flex items-center gap-1">
            <span className="font-mono font-bold text-indigo-700 text-xs">
              {shipping.trackingCode}
            </span>
            <button
              type="button"
              onClick={handleCopyTracking}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1"
              title="Sao chép"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedTracking ? "done" : "content_copy"}
              </span>
              {copiedTracking && (
                <span className="text-[10px] text-emerald-600 font-semibold">Đã chép</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Gói cước:</span>
          <span className="font-semibold text-slate-800">
            {shipping.servicePackage}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Dự kiến giao:</span>
          <span className="font-semibold text-slate-800">
            {shipping.estimatedDelivery}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-200/60">
          <button
            type="button"
            onClick={onChangeCourier}
            className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Đổi đối tác (GHN / Viettel Post)</span>
          </button>
        </div>
      </div>

      {/* Shipping Stepper Timeline */}
      <div className="space-y-3 pt-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Lộ trình vận chuyển dự kiến
        </span>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {shipping.timeline.map((item) => {
            const isCompleted = item.status === "completed";
            const isCurrent = item.status === "current";

            return (
              <div
                key={item.step}
                className={`relative ${!isCompleted && !isCurrent ? "opacity-60" : ""}`}
              >
                {isCompleted && (
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                    <span className="material-symbols-outlined text-[10px]">check</span>
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-white animate-pulse shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                )}

                {!isCompleted && !isCurrent && (
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center ring-4 ring-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  </span>
                )}

                <div>
                  <h5
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-amber-700"
                        : isCompleted
                        ? "text-slate-900"
                        : "text-slate-700 font-semibold"
                    }`}
                  >
                    {item.title}
                  </h5>
                  <p
                    className={`text-[11px] ${
                      isCurrent ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    {item.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderShippingCard;
