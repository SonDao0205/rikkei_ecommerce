import React from "react";
import type { PromotionBanner } from "@/domains/storefront/api/promotionApi";

export const PromotionBannerStrip: React.FC<{ banners: PromotionBanner[] }> = ({ banners }) => {
  if (!banners.length) return null;
  return (
    <section aria-label="Khuyến mãi nổi bật" className="mx-auto w-full max-w-[1440px] px-margin-lg pb-space-lg">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {banners.slice(0, 2).map((banner) => {
          const content = <img src={banner.image_url} alt={banner.title} className="h-40 w-full rounded-2xl object-cover sm:h-56" loading="lazy" />;
          return banner.target_url ? (
            <a key={banner.id} href={banner.target_url} aria-label={banner.title}>
              {content}
            </a>
          ) : <div key={banner.id}>{content}</div>;
        })}
      </div>
    </section>
  );
};

export default PromotionBannerStrip;
