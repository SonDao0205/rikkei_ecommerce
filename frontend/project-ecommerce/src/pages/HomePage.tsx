import React, { useEffect } from "react";
import CustomerLayout from "../layout/CustomerLayout";
import FlashNotificationBar from "../components/home/FlashNotificationBar";
import CategoryBar from "../components/home/CategoryBar";
import FlashSaleSection from "../components/home/FlashSaleSection";
import CatalogSection from "../components/home/CatalogSection";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  getCategories,
  getFlashSaleProducts,
  getCatalogProducts,
  setSelectedCategory,
  setSortBy,
} from "../redux/slices/productSlice";
import type { ProductItem } from "../types/ecommerce";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    categories,
    flashSaleProducts,
    catalogProducts,
    totalCatalogProducts,
    selectedCategoryId,
    sortBy,
  } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getFlashSaleProducts());
    dispatch(getCatalogProducts({ categoryId: selectedCategoryId, sort: sortBy }));
  }, [dispatch]);

  const handleSelectCategory = (categoryId: number) => {
    dispatch(setSelectedCategory(categoryId));
    dispatch(getCatalogProducts({ categoryId, sort: sortBy }));
  };

  const handleSortChange = (newSort: string) => {
    dispatch(setSortBy(newSort));
    dispatch(getCatalogProducts({ categoryId: selectedCategoryId, sort: newSort }));
  };

  const handleQuickAdd = (product: ProductItem) => {
    // Quick Add handler (placeholder for cart integration)
    console.log("Quick added product:", product.name);
  };

  const handleLoadMore = () => {
    dispatch(getCatalogProducts({ categoryId: selectedCategoryId, sort: sortBy }));
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

      {/* SECTION 2: Curated Flash Sale Drops with Countdown */}
      <FlashSaleSection
        products={flashSaleProducts}
        onQuickAdd={handleQuickAdd}
      />

      {/* SECTION 3: Full Marketplace Filter & Browsing Catalog */}
      <CatalogSection
        products={catalogProducts}
        totalProducts={totalCatalogProducts}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onAddToCart={handleQuickAdd}
        onLoadMore={handleLoadMore}
      />
    </CustomerLayout>
  );
};

export default HomePage;
