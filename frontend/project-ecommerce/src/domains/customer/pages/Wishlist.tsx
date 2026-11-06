import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import {
  WishlistBreadcrumb,
  WishlistToolbar,
  WishlistFilterBar,
  WishlistCard,
  WishlistEmptyState,
  WishlistRecommendations,
  WishlistTrustBanner,
  WishlistToast,
} from "@/domains/customer/components/wishlist";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  addToWishlist,
  setWishlistFilter,
  setWishlistSort,
  setWishlistSearchQuery,
} from "@/domains/customer/state/wishlistSlice";
import { addToCart } from "@/domains/customer/state/cartSlice";
import axiosClient from "@/shared/api/axiosClient";
import type {
  WishlistItem,
  WishlistRecommendation,
  WishlistFilterType,
  WishlistSortType,
} from "@/domains/customer/types/wishlist.types";

export const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items, recommendations, filter, sortBy, searchQuery } =
    useAppSelector((state) => state.wishlist);

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionText?: string;
    actionLink?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionText: "Xem yêu thích",
    actionLink: "/wishlist",
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Toast timer auto-close
  useEffect(() => {
    if (toastState.isOpen) {
      const timer = setTimeout(() => {
        setToastState((prev) => ({ ...prev, isOpen: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastState.isOpen]);

  const showToast = (
    title: string,
    message: string,
    actionText: string = "Xem yêu thích",
    actionLink: string = "/wishlist"
  ) => {
    setToastState({
      isOpen: true,
      title,
      message,
      actionText,
      actionLink,
    });
  };

  // Counts for filter tabs
  const filterCounts = useMemo(() => {
    return {
      all: items.length,
      sale: items.filter((it) => it.is_sale).length,
      inStock: items.filter((it) => it.status === "in-stock").length,
      outOfStock: items.filter((it) => it.status === "out-of-stock").length,
    };
  }, [items]);

  // Filtered and sorted items
  const displayedItems = useMemo(() => {
    let result = [...items];

    // 1. Tab filter
    if (filter === "sale") {
      result = result.filter((it) => it.is_sale);
    } else if (filter === "in-stock") {
      result = result.filter((it) => it.status === "in-stock");
    } else if (filter === "out-of-stock") {
      result = result.filter((it) => it.status === "out-of-stock");
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(query) ||
          it.shop_name.toLowerCase().includes(query) ||
          it.variant_label.toLowerCase().includes(query)
      );
    }

    // 3. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      result.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
    } else {
      // "recent"
      result.sort(
        (a, b) =>
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      );
    }

    return result;
  }, [items, filter, searchQuery, sortBy]);

  // Handlers
  const handleRemoveItem = async (id: number) => {
    const item = items.find((it) => it.id === id || it.product_id === id);
    const productId = item?.product_id || id;
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      showToast("Đã bỏ thích sản phẩm", `"${item?.name || "Sản phẩm"}" đã được xóa khỏi danh sách.`);
    } catch {
      showToast("Lỗi", "Không thể xóa sản phẩm khỏi danh sách yêu thích.");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      const res = await axiosClient.get<{
        success: boolean;
        data: { variants?: { id: number; status: string; stock: number }[] };
      }>(`/api/v1/products/${item.product_id}`);
      const variants = res.data.data?.variants || [];
      const defaultVariant =
        variants.find((v) => v.status === "ACTIVE" && v.stock > 0) || variants[0];
      if (defaultVariant) {
        await dispatch(
          addToCart({ variantId: defaultVariant.id, quantity: 1 })
        ).unwrap();
        showToast(
          "Đã thêm vào giỏ hàng",
          `"${item.name}" đã được thêm vào giỏ.`,
          "Xem giỏ",
          "/cart"
        );
      } else {
        navigate(`/product/${item.product_id}`);
        showToast(
          "Đang mở trang sản phẩm",
          `Vui lòng chọn size/màu sắc của "${item.name}".`
        );
      }
    } catch {
      navigate(`/product/${item.product_id}`);
      showToast(
        "Đang mở trang sản phẩm",
        `Vui lòng chọn size/màu sắc của "${item.name}".`
      );
    }
  };

  const handleAddAllInStockToCart = async () => {
    const inStockItems = items.filter((it) => it.status === "in-stock");
    if (inStockItems.length === 0) return;

    let addedCount = 0;
    for (const item of inStockItems) {
      try {
        const res = await axiosClient.get<{
          success: boolean;
          data: { variants?: { id: number; status: string; stock: number }[] };
        }>(`/api/v1/products/${item.product_id}`);
        const variants = res.data.data?.variants || [];
        const defaultVariant =
          variants.find((v) => v.status === "ACTIVE" && v.stock > 0) || variants[0];
        if (defaultVariant) {
          await dispatch(
            addToCart({ variantId: defaultVariant.id, quantity: 1 })
          ).unwrap();
          addedCount++;
        }
      } catch {
        // continue to next item
      }
    }

    if (addedCount > 0) {
      showToast(
        "Đã thêm vào giỏ hàng",
        `Đã chuyển ${addedCount} sản phẩm còn hàng vào giỏ.`,
        "Xem giỏ",
        "/cart"
      );
    } else {
      navigate(`/product/${inStockItems[0].product_id}`);
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách yêu thích?"
      )
    ) {
      try {
        await dispatch(clearWishlist()).unwrap();
        showToast("Đã xóa tất cả", "Danh sách yêu thích của bạn hiện đang trống.");
      } catch {
        showToast("Lỗi", "Không thể làm sạch danh sách yêu thích.");
      }
    }
  };

  const handleNotifyRestock = (item: WishlistItem) => {
    alert(
      `Hệ thống sẽ gửi thông báo qua Zalo/Email cho bạn ngay khi sản phẩm "${item.name}" có sẵn trở lại!`
    );
  };

  const handleAddToWishlistFromReco = async (reco: WishlistRecommendation) => {
    try {
      await dispatch(addToWishlist(reco.product_id)).unwrap();
      showToast(
        "Đã thêm vào yêu thích!",
        `"${reco.name}" đã được lưu vào danh sách yêu thích.`
      );
    } catch {
      showToast("Lỗi", "Không thể thêm vào danh sách yêu thích.");
    }
  };

  const handleFilterChange = (newFilter: WishlistFilterType) => {
    dispatch(setWishlistFilter(newFilter));
  };

  const handleSortChange = (newSort: WishlistSortType) => {
    dispatch(setWishlistSort(newSort));
  };

  const handleSearchChange = (query: string) => {
    dispatch(setWishlistSearchQuery(query));
  };

  const isActuallyEmpty = items.length === 0;
  const showEmptyState = isActuallyEmpty;

  return (
    <CustomerLayout wishlistCount={items.length}>
      {/* Pinned Bottom-Right Toast */}
      <WishlistToast
        isOpen={toastState.isOpen}
        title={toastState.title}
        message={toastState.message}
        actionText={toastState.actionText || "Xem yêu thích"}
        actionLink={toastState.actionLink || "/wishlist"}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Breadcrumbs & Page Meta */}
      <WishlistBreadcrumb />

      {/* Main View Container */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
        {/* Title & Toolbar */}
        <div className="flex flex-col gap-6">
          <WishlistToolbar
            totalCount={items.length}
            inStockCount={filterCounts.inStock}
            onAddAllToCart={handleAddAllInStockToCart}
            onClearAll={handleClearAll}
            onGoBack={handleGoBack}
          />

          {!showEmptyState && (
            <WishlistFilterBar
              activeFilter={filter}
              counts={filterCounts}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          )}
        </div>

        {/* Wishlist Grid or Empty State */}
        {!isAuthenticated ? (
          <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[40px]">lock</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Đăng nhập để xem danh sách yêu thích</h2>
            <p className="text-sm text-outline mb-6">
              Vui lòng đăng nhập tài khoản để xem các sản phẩm bạn đã lưu và nhận thông báo khi có ưu đãi.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login?redirect=/wishlist")}
              className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary-container transition-all cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : showEmptyState ? (
          <WishlistEmptyState />
        ) : displayedItems.length === 0 ? (
          <div className="py-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/50">
            <p className="text-sm text-on-surface-variant font-semibold">
              Không tìm thấy sản phẩm yêu thích nào khớp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onAddToCart={handleAddToCart}
                onNotifyRestock={handleNotifyRestock}
              />
            ))}
          </div>
        )}

        {/* Cross-Sell Recommendations */}
        <WishlistRecommendations
          recommendations={recommendations}
          onAddToWishlist={handleAddToWishlistFromReco}
        />

        {/* Marketplace Trust Assurance Banner */}
        <WishlistTrustBanner />
      </div>
    </CustomerLayout>
  );
};

export default Wishlist;
