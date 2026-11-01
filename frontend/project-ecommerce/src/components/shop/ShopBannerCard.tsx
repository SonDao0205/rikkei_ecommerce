import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { toggleFollowShop } from "../../redux/slices/shop/publicShopSlice";
import type { PublicShop } from "../../types/ecommerce";

interface ShopBannerCardProps {
  shop: PublicShop;
  totalProducts?: number;
}

const DEFAULT_BANNER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCWStVA70OCRI-vo76GhJ6KLk3Esn2fiZQIfuypPvpWVmh5ZnLbEus2_RHDQDE_6g2ordJI2a3eeZFx8xynJsbHbAQEhHWzCIlTQ1Kwvr7dGhAjHiBLnW1Oaz4hTJxMzUcClG79RadMfdEc8yF4qxf7qT8ZKz-GiCHd45Hv52Wo9WrU4zKQx4u1hbLVPQN4HsmF-HA2Sk0lp3_MpflPuwvmM4cfpWX0u-YitoJ6mWE";

export const ShopBannerCard: React.FC<ShopBannerCardProps> = ({
  shop,
  totalProducts = 0,
}) => {
  const dispatch = useAppDispatch();
  const { followState, followLoading } = useAppSelector(
    (state) => state.publicShop
  );
  const [followFeedback, setFollowFeedback] = useState<string | null>(null);

  const handleFollowToggle = async () => {
    try {
      setFollowFeedback(null);
      await dispatch(
        toggleFollowShop({
          shopId: shop.id,
          currentlyFollowing: followState.following,
        })
      ).unwrap();
    } catch (err: unknown) {
      setFollowFeedback(
        err instanceof Error ? err.message : "Thao tác thất bại, vui lòng đăng nhập"
      );
      setTimeout(() => setFollowFeedback(null), 3500);
    }
  };

  const handleChatClick = () => {
    alert(`Bắt đầu kết nối trò chuyện với gian hàng ${shop.name}`);
  };

  const bannerBg = shop.banner_url || DEFAULT_BANNER;
  const followerDisplay =
    followState.follower_count > 0
      ? followState.follower_count
      : shop.follower_count > 0
      ? shop.follower_count
      : 1480;

  const formattedFollowers =
    followerDisplay >= 1000
      ? `${(followerDisplay / 1000).toFixed(1)}k`
      : `${followerDisplay}`;

  return (
    <div className="w-full flex flex-col">
      {/* Breadcrumbs */}
      <div className="w-full bg-surface-container-lowest border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-margin-lg py-2.5">
          <nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant flex-wrap">
            <Link
              to="/"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Trang chủ</span>
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">
              chevron_right
            </span>
            <span className="hover:text-primary transition-colors text-on-surface-variant">
              Gian hàng & Đối tác
            </span>
            <span className="material-symbols-outlined text-[14px] text-outline">
              chevron_right
            </span>
            <span className="text-on-surface font-bold truncate max-w-xs md:max-w-md">
              {shop.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-lg pt-4 pb-6">
        {/* Storefront Hero Banner */}
        <div className="relative w-full h-[260px] md:h-[380px] rounded-2xl overflow-hidden shadow-md">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-102"
            style={{ backgroundImage: `url('${bannerBg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent" />

          {/* Verified Flagship Overlay Info */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider">
              STORE ACTIVE • GIAO HỎA TỐC 24H
            </span>
          </div>

          <div className="absolute bottom-16 md:bottom-16 left-6 md:left-8 text-on-primary hidden md:block">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed font-bold drop-shadow-sm">
              Flagship Marketplace Partner
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-primary font-bold mt-1 drop-shadow-md">
              {shop.name}
            </h1>
          </div>
        </div>

        {/* Floating Shop Identity Card (Negative margin overlap) */}
        <div className="relative z-10 -mt-10 mx-2 md:mx-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-lg p-5 lg:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 lg:gap-6">
          {/* Shop Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-md bg-surface-container-low flex items-center justify-center ring-3 ring-surface-container-lowest">
                {shop.logo_url ? (
                  <img
                    className="w-full h-full object-cover"
                    src={shop.logo_url}
                    alt={shop.name}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                    {shop.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[17px]">verified</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  {shop.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary font-label-sm text-label-sm font-bold tracking-wider uppercase">
                  MALL
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-primary font-label-sm text-label-sm font-bold uppercase">
                  Official Partner
                </span>
                <span className="font-label-sm text-label-sm text-outline">
                  #SHOP-{String(shop.id).padStart(4, "0")}
                </span>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                {shop.description ||
                  "Phân phối độc quyền thương hiệu chính hãng, cam kết 100% xuất xứ chuẩn mực và chính sách bảo hành sàn MarketPulse."}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body-sm text-body-sm text-on-surface-variant pt-0.5 text-xs">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    location_on
                  </span>
                  <span>Giao hàng từ: TP. Hồ Chí Minh</span>
                </span>
                <span className="text-outline">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    support_agent
                  </span>
                  <span>
                    Hotline: {shop.phone ? shop.phone : "+84 909 *** 456"}
                  </span>
                </span>
                <span className="text-outline">•</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Đang hoạt động</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-2 rounded-xl">
              <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs min-w-[76px]">
                <div className="flex items-center gap-1 text-amber-500">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    4.9
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  2.4k Đánh giá
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs min-w-[76px]">
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    {formattedFollowers}
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  Theo dõi
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs min-w-[76px]">
                <div className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">
                    inventory_2
                  </span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    {totalProducts || 86}
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  Sản phẩm
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs min-w-[76px]">
                <div className="flex items-center gap-1 text-emerald-600">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    98%
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  Phản hồi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`h-10 px-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer ${
                  followState.following
                    ? "bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold"
                    : "bg-primary-container hover:bg-primary text-on-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {followState.following ? "check" : "person_add"}
                </span>
                <span>
                  {followState.following ? "Đang theo dõi" : "Theo dõi Shop"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleChatClick}
                className="h-10 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  chat
                </span>
                <span>Chat ngay</span>
              </button>
            </div>
          </div>
        </div>

        {followFeedback && (
          <div className="mx-6 mt-2 px-4 py-2 rounded-xl bg-error-container text-on-error-container text-xs font-semibold animate-fade-in">
            {followFeedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopBannerCard;
