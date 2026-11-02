import React from "react";
import type { OrderDetailProductItem } from "../../../../types/ecommerce";

interface OrderItemsCardProps {
  items: OrderDetailProductItem[];
  shopName: string;
  shopCode: string;
  shopBadge?: "verified" | "official";
  packageSpec: string;
  packageWeight: string;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({
  items,
  shopName,
  shopCode,
  shopBadge = "verified",
  packageSpec,
  packageWeight,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + " ₫";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-slate-900">
                Kiện hàng &amp; Chi tiết SKU
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                {items.length} món
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Gian hàng:</span>
              <span className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer">
                {shopName}
                {shopBadge === "verified" && (
                  <span
                    className="material-symbols-outlined text-[14px] text-sky-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                )}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[10px] font-mono">
                {shopCode}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-slate-400">info</span>
            <span>Do Shop trực tiếp đóng gói &amp; xuất kho</span>
          </span>
        </div>
      </div>

      {/* Products Table-like List iterating using .map() */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-18 h-18 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
              />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-sm font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                  {item.tag && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        item.tagType === "emerald"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                          : "bg-sky-50 text-sky-700 border-sky-200/60"
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                    {item.variant}
                  </span>
                  <span className="font-mono text-slate-500 font-medium">
                    SKU: <strong className="text-slate-800">{item.sku}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>
                    Vị trí kho:{" "}
                    <strong className="text-slate-800 font-semibold font-mono">
                      {item.warehouse}
                    </strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>
                    Tồn kho khả dụng:{" "}
                    <strong className="text-emerald-600 font-semibold">
                      {item.availableStock}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
              <div className="text-xs text-slate-500 font-medium">
                {formatCurrency(item.price)} × {item.quantity}
              </div>
              <div className="font-display text-sm md:text-base font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(item.total)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Specs */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-[18px]">
            package_2
          </span>
          <span>
            Quy cách đóng gói:{" "}
            <strong className="text-slate-800 font-medium">{packageSpec}</strong>
          </span>
        </div>
        <span className="font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          {packageWeight}
        </span>
      </div>
    </div>
  );
};

export default OrderItemsCard;
