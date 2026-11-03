import React, { useEffect, useMemo, useCallback } from "react";
import ShopLayout from "../../layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store";
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
  openCreateModal,
  openEditModal,
  closeModal,
} from "../../redux/slices/shop/shopProductSlice";
import type {
  ShopProductItem,
  ShopProductStatusTab,
  ShopProductPriceRange,
  ShopProductStockFilter,
} from "../../types/shop/shopProduct.types";
import {
  ShopProductHeader,
  ShopProductStatsCards,
  ShopProductFilters,
  ShopProductTable,
  ShopProductPagination,
  ShopProductModal,
} from "../../components/shop/product";

export const ShopProductManagement: React.FC = () => {
  const dispatch = useAppDispatch();
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
    (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này khỏi kho?")) {
        dispatch(removeShopProduct(id));
      }
    },
    [dispatch]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xoá ${selectedIds.length} sản phẩm đã chọn?`)) {
      selectedIds.forEach((id) => dispatch(removeShopProduct(id)));
    }
  }, [dispatch, selectedIds]);

  const handleSaveProduct = useCallback(
    (product: Partial<ShopProductItem>) => {
      dispatch(saveShopProductItem(product));
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
            Không thể tải dữ liệu sản phẩm
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1 mb-5">
            {error}
          </p>
          <button
            type="button"
            onClick={() => dispatch(fetchShopProductList())}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* Main Product Management Content */}
      <div className="flex flex-col w-full">
        {/* 1. Header Toolbar */}
        <ShopProductHeader
          totalSkus={stats.totalProductsCount}
          lowStockCount={stats.lowStockSkusCount}
          onAddNewProduct={() => dispatch(openCreateModal())}
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
    </ShopLayout>
  );
};

export default ShopProductManagement;

