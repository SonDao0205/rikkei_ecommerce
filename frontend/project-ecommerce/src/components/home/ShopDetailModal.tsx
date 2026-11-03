import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getShopDetail,
  getShopProducts,
  getShopFollowState,
  toggleFollowShop,
  clearCurrentShop,
} from "../../redux/slices/shop/publicShopSlice";
import ProductCard from "./ProductCard";
import type { ProductItem } from "../../types";

interface ShopDetailModalProps {
  shopId: number | null;
  onClose: () => void;
  onSelectProduct?: (product: ProductItem) => void;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  shopId,
  onClose,
  onSelectProduct,
}) => {
  const dispatch = useAppDispatch();
  const { currentShop, shopProducts, shopProductsTotal, followState, loading, productsLoading, followLoading, error } =
    useAppSelector((state) => state.publicShop);
  const { user } = useAppSelector((state) => state.auth);

  const [followMessage, setFollowMessage] = useState<string | null>(null);

  useEffect(() => {
    if (shopId) {
      dispatch(getShopDetail(shopId));
      dispatch(getShopProducts({ shopId }));
      if (user && user.role?.toLowerCase() === "client") {
        dispatch(getShopFollowState(shopId));
      }
    }
    return () => {
      dispatch(clearCurrentShop());
    };
  }, [dispatch, shopId, user]);

  if (!shopId) return null;

  const handleFollowClick = async () => {
    if (!user) {
      setFollowMessage("Vui lòng đăng nhập với tài khoản khách hàng để theo dõi shop.");
      setTimeout(() => setFollowMessage(null), 3500);
      return;
    }
    if (user.role?.toLowerCase() !== "client") {
      setFollowMessage("Chức năng theo dõi shop chỉ dành cho người dùng có vai trò Khách hàng.");
      setTimeout(() => setFollowMessage(null), 3500);
      return;
    }

    try {
      setFollowMessage(null);
      await dispatch(
        toggleFollowShop({
          shopId,
          currentlyFollowing: followState.following,
        })
      ).unwrap();
    } catch (err: unknown) {
      setFollowMessage(err instanceof Error ? err.message : "Không thể cập nhật theo dõi.");
      setTimeout(() => setFollowMessage(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Section */}
        <div className="relative h-36 md:h-48 w-full bg-gradient-to-r from-primary to-primary-container overflow-hidden">
          {currentShop?.banner_url && (
            <img
              src={currentShop.banner_url}
              alt="Shop Banner"
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Shop Info Header */}
        <div className="px-6 pb-4 pt-0 border-b border-outline-variant/40 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-10 mb-2">
            <div className="flex items-end gap-3.5">
              <div className="w-20 h-20 rounded-2xl border-4 border-surface-container-lowest bg-surface-container-low shadow-md overflow-hidden flex items-center justify-center font-bold text-2xl text-primary shrink-0">
                {currentShop?.logo_url ? (
                  <img
                    src={currentShop.logo_url}
                    alt={currentShop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentShop?.name?.charAt(0).toUpperCase() || "S"
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-on-surface">
                    {currentShop?.name || "Đang tải shop..."}
                  </h2>
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    verified
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                  <span>
                    <strong className="text-on-surface font-semibold">
                      {followState.follower_count}
                    </strong>{" "}
                    người theo dõi
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-on-surface font-semibold">
                      {shopProductsTotal}
                    </strong>{" "}
                    sản phẩm
                  </span>
                  {currentShop?.phone && (
                    <>
                      <span>•</span>
                      <span>Hotline: {currentShop.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleFollowClick}
                disabled={followLoading}
                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                  followState.following
                    ? "bg-surface-container text-on-surface hover:bg-error-container/20 hover:text-error"
                    : "bg-primary text-on-primary hover:bg-primary-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {followState.following ? "check" : "add"}
                </span>
                <span>{followState.following ? "Đang theo dõi" : "Theo dõi shop"}</span>
              </button>
              {followMessage && (
                <span className="text-[11px] text-error font-medium animate-fade-in text-right">
                  {followMessage}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-error-container/20 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Shop Products Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {loading && !currentShop && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Đang tải thông tin cửa hàng...</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                storefront
              </span>
              <span>Sản phẩm của cửa hàng ({shopProductsTotal})</span>
            </h3>
          </div>

          {productsLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-on-surface-variant">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Đang tải sản phẩm của shop...</span>
            </div>
          )}

          {!productsLoading && shopProducts.length === 0 && (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] text-outline mb-2">
                production_quantity_limits
              </span>
              <p className="text-sm">Cửa hàng hiện chưa có sản phẩm nào được niêm yết.</p>
            </div>
          )}

          {!productsLoading && shopProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {shopProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={(p) => {
                    onClose();
                    onSelectProduct?.(p);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailModal;
