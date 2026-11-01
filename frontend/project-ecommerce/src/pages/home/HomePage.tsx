import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../layout/CustomerLayout";
import FlashNotificationBar from "../../components/home/FlashNotificationBar";
import CategoryBar from "../../components/home/CategoryBar";
import FlashSaleSection from "../../components/home/FlashSaleSection";
import CatalogSection from "../../components/home/CatalogSection";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getCategories,
  getFlashSaleProducts,
  getCatalogProducts,
  setSelectedCategory,
  setSortBy,
} from "../../redux/slices/product/productSlice";
import type { ProductItem } from "../../types/ecommerce";

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
        onSelectProduct={handleSelectProduct}
        onSelectShop={handleSelectShop}
      />

      {/* SECTION 3: Full Marketplace Filter & Browsing Catalog */}
      <CatalogSection
        products={catalogProducts}
        totalProducts={totalCatalogProducts}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onLoadMore={handleLoadMore}
        onSelectProduct={handleSelectProduct}
        onSelectShop={handleSelectShop}
      />
    </CustomerLayout>
  );
};

export default HomePage;
