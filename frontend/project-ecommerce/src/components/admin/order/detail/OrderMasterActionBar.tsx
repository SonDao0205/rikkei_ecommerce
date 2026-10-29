import React from "react";
import { Link } from "react-router-dom";
import type { AdminOrderDetailData } from "../../../../types/ecommerce";

interface OrderMasterActionBarProps {
  order: AdminOrderDetailData;
  onForceCancel: () => void;
  onPrintAuditSheet: () => void;
  onExportVAT: () => void;
  onToggleRiskHold?: () => void;
  isHeld?: boolean;
}

export const OrderMasterActionBar: React.FC<OrderMasterActionBarProps> = ({
  order,
  onForceCancel,
  onPrintAuditSheet,
  onExportVAT,
  onToggleRiskHold,
  isHeld = false,
}) => {
  const isPending = order.status === "pending";
  const isShipping = order.status === "shipping" || order.status === "packing";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
      {/* Left: Order Title & Badges & Metadata */}
      <div className="flex items-start gap-4">
        <Link
          to="/admin/orders"
          className="mt-1 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors border border-slate-200 shadow-xs cursor-pointer"
          title="Quay lại danh sách đơn hàng"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Chi tiết Đơn hàng {order.id}
            </h1>

            {/* Platform Supervision Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="material-symbols-outlined text-[13px]">shield_person</span>
              <span>Giám sát Sàn (Admin)</span>
            </span>

            {/* Dynamic Status Badge */}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
                <span
                  className="material-symbols-outlined text-[15px] text-amber-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  storefront
                </span>
                <span>Chờ Shop xác nhận &amp; chuẩn bị hàng</span>
              </span>
            )}

            {isShipping && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300 shadow-xs">
                <span
                  className="material-symbols-outlined text-[15px] text-sky-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_shipping
                </span>
                <span>Shop đã giao 3PL • Đang trung chuyển</span>
              </span>
            )}

            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-slate-500">
                  cancel
                </span>
                <span>{order.statusLabel}</span>
              </span>
            )}

            {/* Risk Hold Indicator */}
            {isHeld && !isCancelled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>Tạm giữ kiểm tra rủi ro (Hold)</span>
              </span>
            )}

            {/* Urgent Badge */}
            {order.isUrgent && !isCancelled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>{order.urgentLabel || "Hạn Shop gửi: 2h"}</span>
              </span>
            )}
          </div>

          {/* Subtitle Info */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                schedule
              </span>
              Đặt lúc:{" "}
              <strong className="text-slate-700 font-semibold">{order.createdAt}</strong>{" "}
              ({order.timeAgo})
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                laptop_mac
              </span>
              Kênh:{" "}
              <strong className="text-slate-700 font-semibold">{order.channel}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                receipt
              </span>
              Mã giao dịch sàn:{" "}
              <code className="font-mono text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                {order.paymentCode}
              </code>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Platform Admin Action Buttons Group */}
      <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
        {/* Export VAT Invoice */}
        <button
          type="button"
          onClick={onExportVAT}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          title="Xuất hóa đơn VAT điện tử đối soát"
        >
          <span className="material-symbols-outlined text-[17px] text-slate-500">
            receipt_long
          </span>
          <span>Xuất VAT Sàn</span>
        </button>

        {/* Print Audit Sheet */}
        <button
          type="button"
          onClick={onPrintAuditSheet}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          title="In phiếu kiểm toán / đối soát bưu tá"
        >
          <span className="material-symbols-outlined text-[17px] text-slate-500">print</span>
          <span>In Phiếu Đối Soát</span>
        </button>

        {/* Risk Hold Toggle */}
        {!isCancelled && onToggleRiskHold && (
          <button
            type="button"
            onClick={onToggleRiskHold}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isHeld
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900"
            }`}
            title="Tạm dừng đơn để kiểm tra gian lận / tranh chấp"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isHeld ? "lock_open" : "lock"}
            </span>
            <span>{isHeld ? "Mở Khóa Đơn" : "Tạm Giữ Đơn"}</span>
          </button>
        )}

        {/* Force Cancel Order (Platform Intervention) */}
        {!isCancelled && (
          <button
            type="button"
            onClick={onForceCancel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            title="Quyền can thiệp cưỡng chế hủy đơn từ Admin sàn khi có khiếu nại hoặc gian lận"
          >
            <span className="material-symbols-outlined text-[17px]">gavel</span>
            <span>Hủy Cưỡng Chế (Admin)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderMasterActionBar;
