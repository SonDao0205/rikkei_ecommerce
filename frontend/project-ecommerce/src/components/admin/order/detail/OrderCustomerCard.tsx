import React, { useState } from "react";
import type { OrderDetailCustomer } from "../../../../types/ecommerce";

interface OrderCustomerCardProps {
  customer: OrderDetailCustomer;
}

export const OrderCustomerCard: React.FC<OrderCustomerCardProps> = ({
  customer,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(customer.phone).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Thông tin Người mua &amp; Giao nhận
            </h3>
            <span className="text-[11px] text-slate-500">Hồ sơ khách hàng</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert(`Xem chi tiết CRM cho khách hàng ${customer.name} (${customer.id})`)}
          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Chi tiết CRM</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Customer Avatar & Tier Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-display font-bold text-sm flex items-center justify-center shadow-sm">
              {customer.avatarText || "NA"}
            </div>
            <div>
              <h4 className="font-display text-sm font-bold text-slate-900">
                {customer.name}
              </h4>
              <span className="font-mono text-[11px] text-slate-500">
                ID: {customer.id}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
            {customer.tier}
          </span>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
          {/* Phone */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-[17px] text-slate-400">
                call
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {customer.phone}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyPhone}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
              title="Sao chép SĐT"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedPhone ? "done" : "content_copy"}
              </span>
              {copiedPhone && (
                <span className="text-[10px] text-emerald-600 font-semibold">Đã chép</span>
              )}
            </button>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-slate-600 pt-1">
            <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5">
              location_on
            </span>
            <div>
              <span className="font-semibold text-slate-900 block">
                {customer.street}
              </span>
              <span className="text-slate-500">{customer.administrativeArea}</span>
            </div>
          </div>
        </div>

        {/* Buyer Note Box */}
        {customer.buyerNote && (
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 mt-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
              sticky_note_2
            </span>
            <div className="text-xs">
              <span className="font-bold text-amber-900 block">
                Ghi chú của khách hàng:
              </span>
              <p className="italic text-amber-950 mt-0.5">"{customer.buyerNote}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCustomerCard;
