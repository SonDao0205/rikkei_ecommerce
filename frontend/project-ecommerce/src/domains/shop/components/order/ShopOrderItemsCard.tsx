import React from "react";
import type { ShopOrderProductItem } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderItemsCardProps {
  items: ShopOrderProductItem[];
  buyerNote?: string;
}

export const ShopOrderItemsCard: React.FC<ShopOrderItemsCardProps> = ({
  items,
  buyerNote,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Danh sách sản phẩm của Shop
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Chi tiết mặt hàng, số lượng và tình trạng kho xuất
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-xs font-bold">
          {items.length} mặt hàng
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead>
            <tr className="bg-surface-container-low font-label-md text-xs text-on-surface border-b border-outline-variant/20">
              <th className="py-3 px-4">Sản phẩm</th>
              <th className="py-3 px-3">Phân loại &amp; SKU</th>
              <th className="py-3 px-3 text-right">Đơn giá</th>
              <th className="py-3 px-3 text-center">Số lượng</th>
              <th className="py-3 px-3 text-center">Kho sẵn</th>
              <th className="py-3 px-4 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-on-surface">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-outline-variant/30 shadow-2xs"
                    />
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-on-surface line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-outline">Mã SP: #{item.productId}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <p className="font-semibold text-xs text-on-surface">{item.variant}</p>
                  <p className="text-[11px] text-outline font-mono">SKU: {item.sku}</p>
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-xs font-semibold">
                  {item.formattedPrice}
                </td>
                <td className="py-3.5 px-3 text-center font-bold text-xs">
                  x{item.quantity}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-[10px] font-semibold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item.warehouseStock ?? 30} còn
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-sm text-primary">
                  {item.formattedTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buyer Note */}
      {buyerNote && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-start gap-2.5 text-amber-900">
          <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5">
            sticky_note_2
          </span>
          <div>
            <span className="font-bold">Ghi chú từ khách hàng: </span>
            <span>{buyerNote}</span>
          </div>
        </div>
      )}
    </div>
  );
};

