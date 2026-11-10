import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import ShopBannerCard from "@/domains/shop/components/ShopBannerCard";
import ShopVoucherStrip from "@/domains/shop/components/ShopVoucherStrip";
import ShopCatalogToolbar, {
  type ShopTabKey,
  type ShopSortKey,
} from "@/domains/shop/components/ShopCatalogToolbar";
import ShopProductGrid from "@/domains/shop/components/ShopProductGrid";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  getShopDetail,
  getShopProducts,
  getShopFollowState,
  clearCurrentShop,
} from "@/domains/shop/state/publicShopSlice";
import type { CatalogQueryParams } from "@/shared/types";

export const InforShop: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const shopId = id ? parseInt(id, 10) : NaN;

  const dispatch = useAppDispatch();
  const {
    currentShop,
    shopProducts,
    shopProductsTotal,
    loading: shopLoading,
    productsLoading,
    error: shopError,
  } = useAppSelector((state) => state.publicShop);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<ShopTabKey>("all");
  const [sortKey, setSortKey] = useState<ShopSortKey>("popular");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [submittedSearch, setSubmittedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Reset filters and search input on page enter / shop change
  const [prevShopId, setPrevShopId] = useState(shopId);
  if (shopId !== prevShopId) {
    setPrevShopId(shopId);
    setSearchTerm("");
    setSubmittedSearch("");
    setActiveTab("all");
    setSortKey("popular");
    setCurrentPage(1);
  }

  // Tải chi tiết Shop và trạng thái Follow khi ID thay đổi
  useEffect(() => {
    if (!Number.isNaN(shopId) && shopId > 0) {
      dispatch(getShopDetail(shopId));
      if (isAuthenticated && (user?.roles?.includes("client") || user?.role === "client")) {
        dispatch(getShopFollowState(shopId));
      }
    }
    return () => {
      dispatch(clearCurrentShop());
    };
  }, [dispatch, shopId, isAuthenticated, user]);

  // Tải danh sách sản phẩm theo tab, sort, search và page
  const fetchProducts = useCallback(() => {
    if (Number.isNaN(shopId) || shopId <= 0) return;

    const params: CatalogQueryParams = {
      page: currentPage,
      limit: pageSize,
    };

    if (submittedSearch.trim()) {
      params.search = submittedSearch.trim();
    }

    // Mapping sortKey & activeTab sang query param hợp lệ của backend Go
    if (activeTab === "new") {
      params.sort = "latest";
    } else if (activeTab === "bestseller" || activeTab === "sale") {
      params.sort = "best_selling";
    } else {
      switch (sortKey) {
        case "newest":
          params.sort = "latest";
          break;
        case "sales":
          params.sort = "best_selling";
          break;
        case "price_asc":
          params.sort = "price_asc";
          break;
        case "price_desc":
          params.sort = "price_desc";
          break;
        case "popular":
        default:
          params.sort = "best_selling";
      }
    }

    dispatch(getShopProducts({ shopId, params }));
  }, [dispatch, shopId, currentPage, pageSize, submittedSearch, activeTab, sortKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleTabChange = (tab: ShopTabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: ShopSortKey) => {
    setSortKey(sort);
    setCurrentPage(1);
  };

  const handleSearchSubmit = () => {
    setSubmittedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  if (Number.isNaN(shopId) || shopId <= 0) {
    return (
      <CustomerLayout>
        <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            Mã gian hàng không hợp lệ
          </h2>
          <p className="text-on-surface-variant mb-6">
            Đường dẫn gian hàng không chính xác hoặc đã bị thay đổi.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Về trang chủ</span>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  if (shopLoading && !currentShop) {
    return (
      <CustomerLayout>
        <div className="max-w-[1440px] mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-semibold text-on-surface-variant animate-pulse">
            Đang tải thông tin gian hàng...
          </p>
        </div>
      </CustomerLayout>
    );
  }

  if (shopError && !currentShop) {
    return (
      <CustomerLayout>
        <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">storefront</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            Không tìm thấy gian hàng
          </h2>
          <p className="text-on-surface-variant max-w-md mx-auto mb-6">
            Gian hàng này không tồn tại hoặc đã tạm ngừng hoạt động trên hệ thống sàn MarketPulse.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Về trang chủ</span>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="w-full flex flex-col bg-background min-h-screen pb-16">
        {/* SECTION 1: Breadcrumbs + Storefront Hero Banner + Floating Identity Card */}
        {currentShop && (
          <ShopBannerCard
            shop={currentShop}
            totalProducts={shopProductsTotal}
          />
        )}

        {/* SECTION 2: Exclusive Shop Vouchers */}
        <ShopVoucherStrip
          shopId={currentShop?.id}
          shopName={currentShop?.name}
        />

        {/* SECTION 3: Catalog View Tabs, In-Shop Search, & Sort Toolbar */}
        <ShopCatalogToolbar
          totalCount={shopProductsTotal}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          sortKey={sortKey}
          onSortChange={handleSortChange}
        />

        {/* SECTION 4: 4-Column Responsive Product Grid & Pagination */}
        <ShopProductGrid
          products={shopProducts}
          totalProducts={shopProductsTotal}
          loading={productsLoading}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      </div>
    </CustomerLayout>
  );
};

export default InforShop;
