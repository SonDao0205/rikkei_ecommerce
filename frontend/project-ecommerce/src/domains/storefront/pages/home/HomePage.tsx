import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import FlashNotificationBar from "@/domains/storefront/components/home/FlashNotificationBar";
import CategoryBar from "@/domains/storefront/components/home/CategoryBar";
import FlashSaleSection from "@/domains/storefront/components/home/FlashSaleSection";
import CatalogSection from "@/domains/storefront/components/home/CatalogSection";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  getCategories,
  getFlashSaleProducts,
  getCatalogProducts,
  setSelectedCategory,
  setSortBy,
} from "@/domains/storefront/state/productSlice";
import type { ProductItem } from "@/shared/types";
import { addCartItem } from "@/domains/customer/state/cartSlice";
import { productApi } from "@/domains/storefront/api/productApi";
import { promotionApi, type PromotionBanner } from "@/domains/storefront/api/promotionApi";
import PromotionBannerStrip from "@/domains/storefront/components/home/PromotionBannerStrip";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const categoryParam = searchParams.get("category_id");

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const roles = user?.roles?.map((role) => role.toLowerCase()) ?? (user?.role ? [user.role] : []);
  const canUseCustomerFeatures = roles.includes("client");
  const {
    categories,
    flashSaleProducts,
    flashSaleLoading,
    catalogProducts,
    totalCatalogProducts,
    selectedCategoryId,
    sortBy,
  } = useAppSelector((state) => state.product);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedCategoryName =
    selectedCategory && selectedCategory.id !== 0 ? selectedCategory.name : undefined;

  // Đồng bộ danh mục từ URL query parameters nếu có
  useEffect(() => {
    if (categoryParam !== null) {
      const parsedId = parseInt(categoryParam, 10);
      if (!isNaN(parsedId) && parsedId !== selectedCategoryId) {
        dispatch(setSelectedCategory(parsedId));
      }
    } else if (selectedCategoryId !== 0 && !location.search) {
      dispatch(setSelectedCategory(0));
    }
  }, [categoryParam, location.search, dispatch, selectedCategoryId]);

  // Nạp danh mục 1 lần khi trang được khởi tạo
  useEffect(() => {
    dispatch(getCategories());
    promotionApi.getBanners()
      .then((items) => setBanners(items.filter((item) => item.position === "HOME_HERO" || item.position === "HOME_MIDDLE")))
      .catch(() => setBanners([]));
  }, [dispatch]);

  // Cập nhật sản phẩm nổi bật khi danh mục thay đổi
  useEffect(() => {
    dispatch(getFlashSaleProducts(selectedCategoryId));
  }, [dispatch, selectedCategoryId]);

  // Tải danh sách catalog khi thay đổi danh mục hoặc tiêu chí sắp xếp
  useEffect(() => {
    dispatch(
      getCatalogProducts({
        category_id: selectedCategoryId,
        sort: sortBy,
      })
    );
  }, [dispatch, selectedCategoryId, sortBy]);

  const handleSelectCategory = (categoryId: number) => {
    dispatch(setSelectedCategory(categoryId));
    if (categoryId > 0) {
      setSearchParams({ category_id: String(categoryId) }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSortChange = (newSort: string) => {
    dispatch(setSortBy(newSort));
  };

  const handleLoadMore = () => {
    dispatch(
      getCatalogProducts({
        category_id: selectedCategoryId,
        sort: sortBy,
        limit: catalogProducts.length + 20,
      })
    );
  };

  const handleSelectProduct = (product: ProductItem) => {
    navigate(`/product/${product.id}`);
  };

  const handleSelectShop = (shopId: number) => {
    navigate(`/shop/${shopId}`);
  };

  const handleQuickAdd = async (product: ProductItem) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/product/${product.id}` } } });
      return;
    }
    if (!canUseCustomerFeatures) throw new Error("Giỏ hàng chỉ dành cho tài khoản người mua.");
    const detail = await productApi.fetchProductDetail(product.id);
    const availableVariants = detail.variants.filter((variant) => variant.stock > 0);
    if (availableVariants.length !== 1) {
      navigate(`/product/${product.id}`);
      return;
    }
    await dispatch(addCartItem({ variantId: availableVariants[0].id, quantity: 1 })).unwrap();
  };

  return (
    <CustomerLayout>
      {/* Top Notification Flash Strip */}
      <FlashNotificationBar />
      <PromotionBannerStrip banners={banners} />

      {/* SECTION 1: Category Circles Bar */}
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* SECTION 2: Featured products from the backend */}
      <FlashSaleSection
        products={flashSaleProducts}
        categoryName={selectedCategoryName}
        loading={flashSaleLoading}
        onQuickAdd={handleQuickAdd}
        onSelectProduct={handleSelectProduct}
        onSelectShop={handleSelectShop}
      />

      {/* SECTION 3: Full Marketplace Filter & Browsing Catalog */}
      <CatalogSection
        products={catalogProducts}
        totalProducts={totalCatalogProducts}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onAddToCart={handleQuickAdd}
        onLoadMore={handleLoadMore}
        onSelectProduct={handleSelectProduct}
        onSelectShop={handleSelectShop}
      />
    </CustomerLayout>
  );
};

export default HomePage;
