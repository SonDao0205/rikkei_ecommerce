import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { toggleFollowShop } from "@/domains/shop/state/publicShopSlice";
import WishlistToast from "@/domains/customer/components/wishlist/WishlistToast";
import type { PublicShop } from "@/shared/types";
import { getShopDefaultLogo } from "@/shared/utils/avatar";

interface ProductShopInfoProps {
  shop?: PublicShop;
}

export const ProductShopInfo: React.FC<ProductShopInfoProps> = ({ shop }) => {
  const { t } = useTranslation("customer");
  const dispatch = useAppDispatch();
  const { followState, followLoading } = useAppSelector((state) => state.publicShop);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionText?: string;
    actionLink?: string;
    type?: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  if (!shop) return null;

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !user) {
      setToast({
        isOpen: true,
        title: t("product.shop_info.auth_required_title"),
        message: t("product.shop_info.auth_required_msg"),
        actionText: t("header.actions.sign_in", { defaultValue: "Đăng nhập ngay" }),
        actionLink: "/login",
        type: "error",
      });
      return;
    }

    if (!user.roles?.includes("client") && user.role !== "client") {
      setToast({
        isOpen: true,
        title: t("product.shop_info.buyer_only_title"),
        message: t("product.shop_info.buyer_only_msg"),
        type: "error",
      });
      return;
    }

    try {
      const isCurrentlyFollowing = followState.following;
      const result = await dispatch(
        toggleFollowShop({
          shopId: shop.id,
          currentlyFollowing: isCurrentlyFollowing,
        })
      ).unwrap();

      setToast({
        isOpen: true,
        title: result.following
          ? t("product.shop_info.follow_success_title")
          : t("product.shop_info.unfollow_success_title"),
        message: result.following
          ? t("product.shop_info.follow_success_msg", { name: shop.name })
          : t("product.shop_info.unfollow_success_msg", { name: shop.name }),
        actionText: t("product.shop_info.view_shop"),
        actionLink: `/shop/${shop.id}`,
        type: "success",
      });
    } catch (err: unknown) {
      setToast({
        isOpen: true,
        title: t("product.shop_info.buyer_only_title"),
        message: err instanceof Error ? err.message : t("product.shop_info.action_failed"),
        type: "error",
      });
    }
  };

  const followerDisplay = followState.follower_count ?? shop.follower_count ?? 0;
  const formattedFollowers =
    followerDisplay >= 1000
      ? `${(followerDisplay / 1000).toFixed(1)}k`
      : `${followerDisplay}`;

  return (
    <div className="w-full rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex items-center justify-between border border-outline-variant/30 flex-wrap gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/shop/${shop.id}`}
          className="w-12 h-12 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-center justify-center font-bold text-headline-md shrink-0 shadow-sm overflow-hidden hover:opacity-90 transition-opacity"
        >
          <img
            src={shop.logo_url || getShopDefaultLogo(shop.name)}
            alt={shop.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getShopDefaultLogo(shop.name);
            }}
          />
        </Link>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              to={`/shop/${shop.id}`}
              className="font-label-lg font-bold text-on-surface truncate hover:text-primary transition-colors"
            >
              {shop.name}
            </Link>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              {t("product.shop_info.partner_badge")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant flex-wrap text-xs">
            <span className="flex items-center text-amber-500 font-bold">
              ★ 4.9 <span className="text-outline font-normal ml-0.5">(18.4k)</span>
            </span>
            <span>•</span>
            <span>{t("product.shop_info.followers", { count: formattedFollowers })}</span>
            <span>•</span>
            <span className="text-primary font-semibold">{t("product.shop_info.chat_response")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => alert(t("product.shop_info.chat_alert", { name: shop.name }))}
          className="w-9 h-9 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all flex items-center justify-center cursor-pointer"
          title={t("product.shop_info.chat_btn_title")}
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
        </button>

        <button
          type="button"
          onClick={handleFollowToggle}
          disabled={followLoading}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
            followState.following
              ? "bg-surface-container text-on-surface hover:bg-error-container/20 hover:text-error"
              : "bg-primary text-on-primary hover:bg-primary-container"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {followState.following ? "check" : "add"}
          </span>
          <span>
            {followState.following
              ? t("product.shop_info.following")
              : t("product.shop_info.follow")}
          </span>
        </button>

        <Link
          to={`/shop/${shop.id}`}
          className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold transition-all inline-flex items-center"
        >
          {t("product.shop_info.view_shop")}
        </Link>
      </div>

      <WishlistToast
        isOpen={toast.isOpen}
        title={toast.title}
        message={toast.message}
        actionText={toast.actionText}
        actionLink={toast.actionLink}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ProductShopInfo;
