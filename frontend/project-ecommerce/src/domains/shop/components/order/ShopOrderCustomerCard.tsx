import React from "react";
import type { ShopOrderCustomerInfo } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderCustomerCardProps {
  customer: ShopOrderCustomerInfo;
}

export const ShopOrderCustomerCard: React.FC<ShopOrderCustomerCardProps> = ({
  customer,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Thông tin người nhận
          </h2>
          <p className="font-body-sm text-body-sm text-outline">
            Khách hàng đặt mua và địa chỉ giao hàng
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        {/* Name & Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-sm shadow-2xs">
            {customer.avatarText || customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm sm:text-base">
              {customer.name}
            </p>
            {customer.tier && (
              <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {customer.tier}
              </span>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="pt-2 border-t border-outline-variant/20 space-y-2">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-outline">call</span>
            <span className="font-mono font-semibold">{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>{customer.email}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">
              location_on
            </span>
            <span className="leading-relaxed">{customer.address}</span>
          </div>
        </div>

        {/* Contact Customer Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => alert(`Đang kết nối tin nhắn với người mua: ${customer.name}`)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Chat với người mua</span>
          </button>
        </div>
      </div>
    </div>
  );
};

