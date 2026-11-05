import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../layout/CustomerLayout";
import {
  WishlistBreadcrumb,
  WishlistToolbar,
  WishlistFilterBar,
  WishlistCard,
  WishlistEmptyState,
  WishlistRecommendations,
  WishlistTrustBanner,
  WishlistToast,
} from "../../components/wishlist";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  addToWishlist,
  setWishlistFilter,
  setWishlistSort,
  setWishlistSearchQuery,
} from "../../redux/slices/wishlist/wishlistSlice";
import { updateItemQuantity } from "../../redux/slices/cart/cartSlice";
import type {
  WishlistItem,
  WishlistRecommendation,
  WishlistFilterType,
  WishlistSortType,
} from "../../types/wishlist/wishlist.types";

export const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, recommendations, filter, sortBy, searchQuery } =
    useAppSelector((state) => state.wishlist);

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const [isDemoEmptyActive, setIsDemoEmptyActive] = useState(false);
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Toast timer auto-close
  useEffect(() => {
    if (toastState.isOpen) {
      const timer = setTimeout(() => {
        setToastState((prev) => ({ ...prev, isOpen: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastState.isOpen]);

  const showToast = (title: string, message: string) => {
    setToastState({
      isOpen: true,
      title,
      message,
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
  const handleRemoveItem = (id: number) => {
    const item = items.find((it) => it.id === id);
    dispatch(removeFromWishlist(id));
    if (item) {
      showToast("Đã bỏ thích sản phẩm", `"${item.name}" đã được xóa khỏi danh sách.`);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Add 1 quantity to cart
    dispatch(updateItemQuantity({ itemId: item.product_id, quantity: 1 }));
    showToast(
      "Thêm vào giỏ hàng thành công!",
      `"${item.name}" đã được chuyển vào giỏ.`
    );
  };

  const handleAddAllInStockToCart = () => {
    const inStockItems = items.filter((it) => it.status === "in-stock");
    if (inStockItems.length === 0) return;

    inStockItems.forEach((it) => {
      dispatch(updateItemQuantity({ itemId: it.product_id, quantity: 1 }));
    });

    showToast(
      "Đã thêm vào giỏ hàng!",
      `Toàn bộ ${inStockItems.length} sản phẩm còn hàng đã được chuyển vào giỏ.`
    );
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách yêu thích?"
      )
    ) {
      dispatch(clearWishlist());
      showToast("Đã xóa tất cả", "Danh sách yêu thích của bạn hiện đang trống.");
    }
  };

  const handleNotifyRestock = (item: WishlistItem) => {
    alert(
      `Hệ thống sẽ gửi thông báo qua Zalo/Email cho bạn ngay khi sản phẩm "${item.name}" có sẵn trở lại!`
    );
  };

  const handleAddToWishlistFromReco = (reco: WishlistRecommendation) => {
    dispatch(
      addToWishlist({
        product_id: reco.product_id,
        name: reco.name,
        shop_name: reco.shop_name,
        is_verified_shop: true,
        image_url: reco.image_url,
        price: reco.price,
        original_price: reco.price,
        variant_label: "Mặc định",
        is_sale: Boolean(reco.is_discounted),
        status: "in-stock",
        stock_count: 10,
      })
    );
    showToast(
      "Đã thêm vào yêu thích!",
      `"${reco.name}" đã được lưu vào danh sách yêu thích.`
    );
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
  const showEmptyState = isActuallyEmpty || isDemoEmptyActive;

  return (
    <CustomerLayout wishlistCount={items.length}>
      {/* Pinned Bottom-Right Toast */}
      <WishlistToast
        isOpen={toastState.isOpen}
        title={toastState.title}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Breadcrumbs & Page Meta */}
      <WishlistBreadcrumb
        isEmptyViewActive={isDemoEmptyActive}
        onToggleEmptyView={() => setIsDemoEmptyActive((v) => !v)}
      />

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
        {showEmptyState ? (
          <WishlistEmptyState
            isDemoView={isDemoEmptyActive}
            onExitDemoView={() => setIsDemoEmptyActive(false)}
          />
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

