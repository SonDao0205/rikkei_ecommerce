import React, { useEffect } from "react";
import AdminLayout from "../layout/AdminLayout";
import ProductHeader from "../components/admin/ProductHeader";
import ProductStatsCards from "../components/admin/ProductStatsCards";
import ProductFilters from "../components/admin/ProductFilters";
import ProductTable from "../components/admin/ProductTable";
import ProductPagination from "../components/admin/ProductPagination";
import { useAppDispatch, useAppSelector } from "../redux/store";
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
} from "../redux/slices/adminProductSlice";
import type { AdminProductItem } from "../types/ecommerce";

const AdminProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    stats,
    totalProducts,
    searchQuery,
    categoryFilter,
    stockStatusFilter,
    vendorFilter,
    sortBy,
    selectedIds,
    currentPage,
    pageSize,
  } = useAppSelector((state) => state.adminProduct);

  useEffect(() => {
    dispatch(getInventoryStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAdminProducts({
        search: searchQuery,
        category: categoryFilter,
        stockStatus: stockStatusFilter,
        vendor: vendorFilter,
        sortBy,
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
    dispatch(setStockStatusFilter(val));
  };

  const handleVendorChange = (val: string) => {
    dispatch(setVendorFilter(val));
  };

  const handleSortChange = (val: string) => {
    dispatch(setSortBy(val));
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
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleApplyBulkAction = (action: string) => {
    dispatch(executeBulkAction({ action, productIds: selectedIds }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleEditProduct = (product: AdminProductItem) => {
    alert(`Edit product: ${product.name} (${product.sku})`);
  };

  const handleDuplicateProduct = (product: AdminProductItem) => {
    alert(`Duplicated SKU for: ${product.name}`);
  };

  const handleAddNewProduct = () => {
    alert("Open 'Add New Product' modal/form.");
  };

  return (
    <AdminLayout>
      {/* Page Title & Action Header */}
      <ProductHeader onAddNewProduct={handleAddNewProduct} />

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
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onStockStatusChange={handleStockStatusChange}
        onVendorChange={handleVendorChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        onApplyBulkAction={handleApplyBulkAction}
      />

      {/* Dedicated Full-Width Inventory Data Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
        <ProductTable
          products={products}
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
          totalItems={totalProducts}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProduct;
