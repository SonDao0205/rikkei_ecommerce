import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ShopLayout from "@/app/layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchShopProductList,
  removeShopProduct,
  saveShopProductItem,
  setStatusTab,
  setSearchQuery,
  setCategory,
  setPriceRange,
  setStockLevel,
  setCurrentPage,
  setPageSize,
  resetFilters,
  toggleSelectProduct,
  selectAllProducts,
  openEditModal,
  closeModal,
} from "@/domains/shop/state/shopProductSlice";
import type {
  ShopProductItem,
  ShopProductStatusTab,
  ShopProductPriceRange,
  ShopProductStockFilter,
} from "@/domains/shop/types/shopProduct.types";
import {
  ShopProductHeader,
  ShopProductStatsCards,
  ShopProductFilters,
  ShopProductTable,
  ShopProductPagination,
  ShopProductModal,
} from "@/domains/shop/components/product";

export const ShopProductManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = React.useState<{ text: string; isError?: boolean } | null>(null);
  const {
    items,
    stats,
    filters,
    selectedIds,
    isLoading,
    error,
    isModalOpen,
    editingProduct,
  } = useAppSelector((state) => state.shopProduct);

  useEffect(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchShopProductList());
  }, [dispatch, filters.statusTab, filters.category, filters.priceRange, filters.stockLevel]);

  // Handlers
  const handleTabChange = useCallback(
    (tab: ShopProductStatusTab) => {
      dispatch(setStatusTab(tab));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const handleCategoryChange = useCallback(
    (cat: string) => {
      dispatch(setCategory(cat));
    },
    [dispatch]
  );

  const handlePriceRangeChange = useCallback(
    (range: ShopProductPriceRange) => {
      dispatch(setPriceRange(range));
    },
    [dispatch]
  );

  const handleStockLevelChange = useCallback(
    (level: ShopProductStockFilter) => {
      dispatch(setStockLevel(level));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(fetchShopProductList());
  }, [dispatch]);

  const handleToggleSelect = useCallback(
    (id: string) => {
      dispatch(toggleSelectProduct(id));
    },
    [dispatch]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      dispatch(selectAllProducts(checked));
    },
    [dispatch]
  );

  const handleEditProduct = useCallback(
    (product: ShopProductItem) => {
      dispatch(openEditModal(product));
    },
    [dispatch]
  );

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      if (window.confirm("Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xoÃ¡ sáº£n pháº©m nÃ y khá»i kho?")) {
        const res = await dispatch(removeShopProduct(id));
        if (removeShopProduct.fulfilled.match(res)) {
          dispatch(fetchShopProductList());
        }
      }
    },
    [dispatch]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xoÃ¡ ${selectedIds.length} sáº£n pháº©m Ä‘Ã£ chá»n?`)) {
      for (const id of selectedIds) {
        await dispatch(removeShopProduct(id));
      }
      dispatch(fetchShopProductList());
    }
  }, [dispatch, selectedIds]);

  const handleSaveProduct = useCallback(
    async (product: Partial<ShopProductItem>) => {
      const res = await dispatch(saveShopProductItem(product));
      if (saveShopProductItem.fulfilled.match(res)) {
        setToastMessage({
          text: product.id ? "Cáº­p nháº­t sáº£n pháº©m thÃ nh cÃ´ng!" : "Táº¡o sáº£n pháº©m má»›i vÃ  gá»­i duyá»‡t thÃ nh cÃ´ng!",
          isError: false,
        });
        setTimeout(() => setToastMessage(null), 4000);
        dispatch(fetchShopProductList());
      } else {
        const errorMsg = (res.payload as string) || "Lá»—i lÆ°u sáº£n pháº©m";
        setToastMessage({ text: errorMsg, isError: true });
        setTimeout(() => setToastMessage(null), 6000);
      }
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      dispatch(setPageSize(size));
    },
    [dispatch]
  );

  // Client-side search filtering if API is mocked
  const filteredProducts = useMemo(() => {
    return items.filter((item) => {
      const q = filters.searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [items, filters.searchQuery]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (filters.currentPage - 1) * filters.pageSize;
    return filteredProducts.slice(start, start + filters.pageSize);
  }, [filteredProducts, filters.currentPage, filters.pageSize]);

  return (
    <ShopLayout>
      {/* Loading Skeleton */}
      {isLoading && items.length === 0 && (
        <div className="flex flex-col gap-6 py-6 animate-pulse">
          <div className="h-16 bg-surface-container rounded-xl w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface-container rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-surface-container rounded-xl mt-6" />
        </div>
      )}

      {/* Error state */}
      {error && items.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-3">
            error_outline
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u sáº£n pháº©m
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1 mb-5">
            {error}
          </p>
          <button
            type="button"
            onClick={() => dispatch(fetchShopProductList())}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            Thá»­ táº£i láº¡i
          </button>
        </div>
      )}

      {/* Main Product Management Content */}
      <div className="flex flex-col w-full">
        {/* 1. Header Toolbar */}
        <ShopProductHeader
          totalSkus={stats.totalProductsCount}
          lowStockCount={stats.lowStockSkusCount}
          onAddNewProduct={() => navigate("/shop/products/add")}
        />

        {/* 2. Inventory Health Summary Cards */}
        <ShopProductStatsCards
          stats={stats}
          onFilterLowStock={() => dispatch(setStatusTab("low_stock"))}
          onFilterOutOfStock={() => dispatch(setStatusTab("out_of_stock"))}
        />

        {/* 3. Catalog Control Hub: Tabs & Filters */}
        <ShopProductFilters
          currentTab={filters.statusTab}
          onTabChange={handleTabChange}
          tabCounts={stats.statusTabCounts}
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={filters.category}
          onCategoryChange={handleCategoryChange}
          selectedPriceRange={filters.priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          selectedStockLevel={filters.stockLevel}
          onStockLevelChange={handleStockLevelChange}
          onResetFilters={handleResetFilters}
          selectedCount={selectedIds.length}
          onBulkDelete={handleBulkDelete}
        />

        {/* 4. Product Table */}
        <ShopProductTable
          products={paginatedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        {/* 5. Pagination */}
        <ShopProductPagination
          total={filteredProducts.length}
          currentPage={filters.currentPage}
          pageSize={filters.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <ShopProductModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        onClose={() => dispatch(closeModal())}
        onSave={handleSaveProduct}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toastMessage.isError
              ? "bg-error-container text-on-error-container border border-error/30"
              : "bg-inverse-surface text-inverse-on-surface"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] ${
              toastMessage.isError ? "text-error" : "text-primary-fixed"
            }`}
          >
            {toastMessage.isError ? "error" : "check_circle"}
          </span>
          <span className="font-body-md text-body-md font-medium">
            {toastMessage.text}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-inherit"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </ShopLayout>
  );
};

export default ShopProductManagement;

