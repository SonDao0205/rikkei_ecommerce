import React from "react";
import { Link } from "react-router-dom";
import type { ShopBestSellerProduct } from "../../../types/shop/shopDashboard.types";

interface ShopTopProductsProps {
  products: ShopBestSellerProduct[];
}

const getRankBadgeClasses = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-amber-400 text-amber-950 font-bold shadow-xs";
    case 2:
      return "bg-slate-300 text-slate-900 font-bold";
    case 3:
      return "bg-amber-700 text-amber-50 font-bold";
    default:
      return "bg-surface-container text-on-surface-variant font-medium";
  }
};

export const ShopTopProducts: React.FC<ShopTopProductsProps> = ({ products }) => {
  return (
    <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-outline-variant/30">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              Top 5 Bán Chạy
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Thống kê 30 ngày qua
            </p>
          </div>
          <Link
            to="/shop/products"
            className="font-label-sm text-label-sm text-primary font-semibold hover:underline"
          >
            Chi tiết
          </Link>
        </div>

        {/* Best-Selling List */}
        <div className="space-y-3 mt-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/20"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-label-sm text-label-sm shrink-0 ${getRankBadgeClasses(
                  item.rank
                )}`}
              >
                {item.rank}
              </div>

              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0 bg-surface-container border border-outline-variant/30"
                loading="lazy"
              />

              <div className="min-w-0 flex-1">
                <h3 className="font-label-md text-label-md font-semibold text-on-surface truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  <span className="font-mono text-xs">{item.soldCount} đã bán</span>
                  <span className="text-outline-variant">•</span>
                  <span
                    className={`font-mono text-xs ${
                      item.isLowStock
                        ? "text-error font-semibold"
                        : item.rank === 1
                        ? "text-secondary font-medium"
                        : item.rank === 3
                        ? "text-tertiary font-medium"
                        : "text-on-surface-variant"
                    }`}
                  >
                    Kho: {item.stockQuantity} {item.isLowStock && "(Sắp hết)"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-outline-variant/30">
        <Link
          to="/shop/products"
          className="block w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-semibold text-center transition-colors border border-outline-variant/20"
        >
          Xem báo cáo phân tích mặt hàng
        </Link>
      </div>
    </div>
  );
};

export default ShopTopProducts;
