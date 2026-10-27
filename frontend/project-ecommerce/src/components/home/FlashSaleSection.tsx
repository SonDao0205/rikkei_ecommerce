import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import type { ProductItem } from "../../types/ecommerce";

interface FlashSaleSectionProps {
  products: ProductItem[];
  onQuickAdd?: (product: ProductItem) => void;
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products, onQuickAdd }) => {
  const [totalSeconds, setTotalSeconds] = useState(2 * 3600 + 45 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const padZero = (num: number) => String(num).padStart(2, "0");

  return (
    <section className="w-full max-w-[1440px] mx-auto px-margin-lg pb-space-xl">
      {/* Header with Countdown Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tertiary-container text-on-primary font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>FLASH SALE</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            Curated Timed Drops
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px] text-tertiary-container">
              schedule
            </span>
            <span>Ends in:</span>
            {/* Live Countdown Blocks */}
            <div className="flex items-center gap-1 font-mono font-bold text-on-surface">
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary">
                {padZero(hours)}
              </span>
              <span>:</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary">
                {padZero(minutes)}
              </span>
              <span>:</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary">
                {padZero(seconds)}
              </span>
            </div>
          </div>
        </div>

        <Link
          className="flex items-center gap-1 text-primary font-label-md text-label-md font-bold hover:underline"
          to="#"
        >
          <span>View All Deals (84 items)</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* 4-Column Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </section>
  );
};

export default FlashSaleSection;
