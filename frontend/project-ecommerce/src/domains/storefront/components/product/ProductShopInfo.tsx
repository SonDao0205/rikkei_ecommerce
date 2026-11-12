import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { toggleFollowShop } from "@/domains/shop/state/publicShopSlice";
import WishlistToast from "@/domains/customer/components/wishlist/WishlistToast";
import type { PublicShop } from "@/shared/types";
import { getShopDefaultLogo } from "@/shared/utils/avatar";

interface ProductShopInfoProps {
  shop?: PublicShop;
}

export const ProductShopInfo: React.FC<ProductShopInfoProps> = ({ shop }) => {
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
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập với tài khoản khách hàng để theo dõi cửa hàng.",
        actionText: "Đăng nhập ngay",
        actionLink: "/login",
        type: "error",
      });
      return;
    }

    if (!user.roles?.includes("client") && user.role !== "client") {
      setToast({
        isOpen: true,
        title: "Không thể thao tác",
        message: "Tính năng theo dõi cửa hàng chỉ dành cho tài khoản Người mua.",
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
        title: result.following ? "Đã theo dõi cửa hàng" : "Đã bỏ theo dõi cửa hàng",
        message: result.following
          ? `Bạn đã theo dõi thành công gian hàng "${shop.name}".`
          : `Bạn đã bỏ theo dõi gian hàng "${shop.name}".`,
        actionText: "Xem gian hàng",
        actionLink: `/shop/${shop.id}`,
        type: "success",
      });
    } catch (err: unknown) {
      setToast({
        isOpen: true,
        title: "Không thể thao tác",
        message: err instanceof Error ? err.message : "Thao tác thất bại, vui lòng thử lại.",
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
              Mall Partner
            </span>
          </div>

          <div className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant flex-wrap text-xs">
            <span className="flex items-center text-amber-500 font-bold">
              ★ 4.9 <span className="text-outline font-normal ml-0.5">(18.4k)</span>
            </span>
            <span>•</span>
            <span>{formattedFollowers} người theo dõi</span>
            <span>•</span>
            <span className="text-primary font-semibold">98% Phản hồi chat</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => alert(`Bắt đầu chat với ${shop.name}`)}
          className="w-9 h-9 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all flex items-center justify-center cursor-pointer"
          title="Nhắn tin với Shop"
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
          <span>{followState.following ? "Đang theo dõi" : "Theo dõi"}</span>
        </button>

        <Link
          to={`/shop/${shop.id}`}
          className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold transition-all inline-flex items-center"
        >
          Xem Shop
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
