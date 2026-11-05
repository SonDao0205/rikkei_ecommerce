import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const roles = user?.roles?.map((role) => role.toLowerCase()) ?? (user?.role ? [user.role] : []);
  const canUseCustomerFeatures = roles.includes("client");
  const {
    categories,
    flashSaleProducts,
    catalogProducts,
    totalCatalogProducts,
    selectedCategoryId,
    sortBy,
  } = useAppSelector((state) => state.product);

  // Nạp danh mục và flash sale 1 lần khi trang được khởi tạo
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getFlashSaleProducts());
  }, [dispatch]);

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

      {/* SECTION 1: Category Circles Bar */}
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* SECTION 2: Featured products from the backend */}
      <FlashSaleSection
        products={flashSaleProducts}
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
