import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/layout/AdminLayout";
import ProductHeader from "@/domains/admin/components/product/ProductHeader";
import ProductStatsCards from "@/domains/admin/components/product/ProductStatsCards";
import ProductFilters from "@/domains/admin/components/product/ProductFilters";
import ProductTable from "@/domains/admin/components/product/ProductTable";
import ProductPagination from "@/domains/admin/components/product/ProductPagination";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
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
} from "@/domains/admin/state/adminProductSlice";
import { getCategories } from "@/domains/storefront/state/productSlice";
import type { AdminProductItem, AdminProductSortOption, AdminStockStatus } from "@/domains/admin/types";

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

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

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await dispatch(toggleProductStatus(id)).unwrap();
      showFeedback(
        `Đã chuyển trạng thái sản phẩm #${id} sang ${
          res.is_active ? "BẬT (ACTIVE)" : "TẮT (HIDDEN)"
        }.`
      );
    } catch {
      // Error handled in slice state.error
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        showFeedback(`Đã xóa sản phẩm #${id} thành công.`);
      } catch {
        // Error handled in slice state.error
      }
    }
  };

  const handleApplyBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    try {
      const res = await dispatch(executeBulkAction({ action, productIds: selectedIds })).unwrap();
      const actionName =
        action === "activate"
          ? "kích hoạt"
          : action === "deactivate"
          ? "hủy kích hoạt"
          : "xóa";
      showFeedback(`Đã ${actionName} thành công ${res.count} sản phẩm.`);
    } catch {
      // Error handled in slice state.error
    }
  };

  const handleAddNewProduct = () => {
    showFeedback("Tính năng thêm sản phẩm trực tiếp dành cho Kênh người bán.");
  };

  const handleExportCsv = () => {
    if (products.length === 0) return;
    const columns: Array<[string, (product: AdminProductItem) => string | number]> = [
      ["ID", (product) => product.id],
      ["Product", (product) => product.name],
      ["SKU", (product) => product.sku],
      ["Shop", (product) => product.shop_name],
      ["Category", (product) => product.category_name],
      ["Price", (product) => product.price],
      ["Stock", (product) => product.stock],
      ["Status", (product) => product.status],
      ["Active", (product) => product.is_active ? "Yes" : "No"],
    ];
    const escapeCell = (value: string | number) => {
      const text = String(value ?? "");
      const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csv = [
      columns.map(([label]) => escapeCell(label)).join(","),
      ...products.map((product) => columns.map(([, value]) => escapeCell(value(product))).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  // Client-side pagination slicing
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      {/* Page Title & Action Header */}
      <ProductHeader
        onAddNewProduct={handleAddNewProduct}
        onExportCsv={handleExportCsv}
      />

      {/* Success feedback banner */}
      {feedbackMessage && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-emerald-600">
              check_circle
            </span>
            <span className="text-sm font-semibold">{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

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
