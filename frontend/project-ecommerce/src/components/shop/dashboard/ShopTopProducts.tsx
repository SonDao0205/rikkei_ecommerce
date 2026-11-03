import React from "react";
import { Link } from "react-router-dom";
import type { ShopBestSellerProduct } from "../../../types/shop/shopDashboard.types";

interface ShopTopProductsProps {
  products: ShopBestSellerProduct[];
}

const getRankBadgeClasses = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-amber-400 text-amber-950";
    case 2:
      return "bg-slate-300 text-slate-900";
    case 3:
      return "bg-amber-700 text-amber-50";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
};

export const ShopTopProducts: React.FC<ShopTopProductsProps> = ({ products }) => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Top 5 Bán Chạy</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Thống kê 30 ngày qua</p>
        </div>
        <Link
          to="/shop/products"
          className="font-label-sm text-label-sm text-primary hover:underline"
        >
          Chi tiết
        </Link>
      </div>

      {/* Best-Selling List */}
      <div className="space-y-space-sm">
        {products.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-space-sm p-2 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm flex-shrink-0 ${getRankBadgeClasses(
                item.rank
              )}`}
            >
              {item.rank}
            </div>

            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-surface-container"
              loading="lazy"
            />

            <div className="min-w-0 flex-1">
              <h3 className="font-label-md text-label-md text-on-surface truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>{item.soldCount} đã bán</span>
                <span className="text-outline-variant">•</span>
                <span
                  className={`font-label-sm text-label-sm ${
                    item.isLowStock
                      ? "text-error font-semibold"
                      : item.rank === 1
                      ? "text-secondary"
                      : item.rank === 3
                      ? "text-tertiary font-semibold"
                      : "text-on-surface-variant"
                  }`}
                >
                  Kho: {item.stockQuantity} chiếc {item.isLowStock && "(Sắp hết)"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/shop/analytics/products"
        className="block w-full py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md text-center transition-colors"
      >
        Xem báo cáo phân tích mặt hàng
      </Link>
    </div>
  );
};
export default ShopTopProducts;
