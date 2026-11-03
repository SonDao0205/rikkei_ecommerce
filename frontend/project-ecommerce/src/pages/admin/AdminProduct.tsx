import React, { useEffect } from "react";
import AdminLayout from "../../layout/AdminLayout";
import ProductHeader from "../../components/admin/product/ProductHeader";
import ProductStatsCards from "../../components/admin/product/ProductStatsCards";
import ProductFilters from "../../components/admin/product/ProductFilters";
import ProductTable from "../../components/admin/product/ProductTable";
import ProductPagination from "../../components/admin/product/ProductPagination";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getInventoryStats,
  getAdminProducts,
  toggleProductStatus,
  deleteProduct,
  executeBulkAction,
  setSearchQuery,
  setCategoryFilter,
  setStockStatusFilter,
  setVendorFilter,
  setSortBy,
  clearAllFilters,
  toggleSelectProduct,
  selectAllProducts,
  setCurrentPage,
  clearAdminProductError,
} from "../../redux/slices/admin/adminProductSlice";
import { getCategories } from "../../redux/slices/product/productSlice";
import type { AdminProductItem, AdminProductSortOption, AdminStockStatus } from "../../types/admin";

const AdminProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    stats,
    totalProducts,
    loading,
    error,
    searchQuery,
    categoryFilter,
    stockStatusFilter,
    vendorFilter,
    sortBy,
    selectedIds,
    currentPage,
    pageSize,
  } = useAppSelector((state) => state.adminProduct);
  const { categories } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(getInventoryStats());
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAdminProducts({
        search: searchQuery,
        category: categoryFilter,
        stock_status: stockStatusFilter || undefined,
        vendor: vendorFilter,
        sort_by: sortBy,
      })
    );
  }, [dispatch, searchQuery, categoryFilter, stockStatusFilter, vendorFilter, sortBy]);

  const handleSearchChange = (val: string) => {
    dispatch(setSearchQuery(val));
  };

  const handleCategoryChange = (val: string) => {
    dispatch(setCategoryFilter(val));
  };

  const handleStockStatusChange = (val: string) => {
    dispatch(setStockStatusFilter(val as AdminStockStatus | ""));
  };

  const handleVendorChange = (val: string) => {
    dispatch(setVendorFilter(val));
  };

  const handleSortChange = (val: string) => {
    dispatch(setSortBy(val as AdminProductSortOption));
  };

  const handleClearFilters = () => {
    dispatch(clearAllFilters());
  };

  const handleToggleSelect = (id: number) => {
    dispatch(toggleSelectProduct(id));
  };

  const handleSelectAll = (checked: boolean) => {
    dispatch(selectAllProducts(checked));
  };

  const handleToggleStatus = (id: number) => {
    dispatch(toggleProductStatus(id));
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleApplyBulkAction = (action: "activate" | "deactivate" | "delete") => {
    dispatch(executeBulkAction({ action, productIds: selectedIds }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleEditProduct = (product: AdminProductItem) => {
    alert(`Chỉnh sửa sản phẩm: ${product.name} (${product.sku})`);
  };

  const handleDuplicateProduct = (product: AdminProductItem) => {
    alert(`Nhân bản SKU cho: ${product.name}`);
  };

  const handleAddNewProduct = () => {
    alert("Mở giao diện tạo sản phẩm mới.");
  };

  // Client-side pagination slicing
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      {/* Page Title & Action Header */}
      <ProductHeader onAddNewProduct={handleAddNewProduct} />

      {/* Error notification banner */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-error-container text-on-error-container flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">error</span>
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearAdminProductError())}
            className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Telemetry / Inventory Health Mini-Strip */}
      <ProductStatsCards stats={stats} />

      {/* Filter & Command Center */}
      <ProductFilters
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        stockStatusFilter={stockStatusFilter}
        vendorFilter={vendorFilter}
        sortBy={sortBy}
        selectedCount={selectedIds.length}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onStockStatusChange={handleStockStatusChange}
        onVendorChange={handleVendorChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        onApplyBulkAction={handleApplyBulkAction}
      />

      {/* Dedicated Full-Width Inventory Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-surface-container-lowest/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Đang tải danh sách kho hàng...</span>
            </div>
          </div>
        )}

        <ProductTable
          products={paginatedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onToggleStatus={handleToggleStatus}
          onDeleteProduct={handleDeleteProduct}
          onEditProduct={handleEditProduct}
          onDuplicateProduct={handleDuplicateProduct}
        />

        {/* Table Footer & Standard Pagination */}
        <ProductPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalProducts || products.length}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProduct;
