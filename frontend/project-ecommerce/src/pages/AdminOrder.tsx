import React, { useEffect } from "react";
import AdminLayout from "../layout/AdminLayout";
import OrderHeader from "../components/admin/order/OrderHeader";
import OrderStatusTabs from "../components/admin/order/OrderStatusTabs";
import OrderFilterBar from "../components/admin/order/OrderFilterBar";
import OrderTable from "../components/admin/order/OrderTable";
import OrderPagination from "../components/admin/order/OrderPagination";
import OrderDetailDrawer from "../components/admin/order/OrderDetailDrawer";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  getAdminOrders,
  getOrderStatusCounts,
  confirmOrderThunk,
  bulkConfirmOrdersThunk,
  cancelOrderThunk,
  exportOrdersCsvThunk,
  setStatusTab,
  setSearchQuery,
  setDateRangeFilter,
  setPaymentMethodFilter,
  setVendorFilter,
  setCourierFilter,
  clearAllFilters,
  toggleSelectOrder,
  selectAllOrders,
  openOrderDetail,
  closeOrderDetail,
  setCurrentPage,
} from "../redux/slices/adminOrderSlice";
import type { AdminOrderItem } from "../types/ecommerce";

const AdminOrder: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    orders,
    counts,
    selectedIds,
    selectedOrderForDetail,
    filters,
    currentPage,
    pageSize,
    totalOrders,
    isExporting,
  } = useAppSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(getOrderStatusCounts());
    dispatch(getAdminOrders());
  }, [dispatch]);

  const handleTabChange = (
    tab: "all" | "pending" | "shipping" | "delivered" | "cancelled"
  ) => {
    dispatch(setStatusTab(tab));
    dispatch(getAdminOrders({ statusTab: tab }));
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(getAdminOrders({ search: query }));
  };

  const handleDateRangeChange = (range: string) => {
    dispatch(setDateRangeFilter(range));
    dispatch(getAdminOrders({ dateRange: range }));
  };

  const handlePaymentMethodChange = (pm: string) => {
    dispatch(setPaymentMethodFilter(pm));
    dispatch(getAdminOrders({ paymentMethod: pm }));
  };

  const handleVendorChange = (v: string) => {
    dispatch(setVendorFilter(v));
    dispatch(getAdminOrders({ vendor: v }));
  };

  const handleCourierChange = (c: string) => {
    dispatch(setCourierFilter(c));
    dispatch(getAdminOrders({ courier: c }));
  };

  const handleClearFilters = () => {
    dispatch(clearAllFilters());
    dispatch(
      getAdminOrders({
        search: "",
        statusTab: "all",
        dateRange: "all",
        paymentMethod: "all",
        vendor: "all",
        courier: "all",
      })
    );
  };

  const handleBulkConfirm = () => {
    if (selectedIds.length === 0) return;
    dispatch(bulkConfirmOrdersThunk(selectedIds));
  };

  const handleBatchPrint = () => {
    window.print();
  };

  const handleExport = () => {
    dispatch(exportOrdersCsvThunk());
  };

  const handleViewDetail = (order: AdminOrderItem) => {
    dispatch(openOrderDetail(order));
  };

  const handlePrintOrder = (order: AdminOrderItem) => {
    alert(`Đang in phiếu giao nhận cho mã đơn: ${order.id}`);
  };

  const handleTrackOrder = (order: AdminOrderItem) => {
    alert(
      `Đơn vị vận chuyển: ${order.courierLabel}\nMã vận đơn: ${
        order.trackingCode || "Chưa tạo mã"
      }`
    );
  };

  const handleConfirmSingle = (orderId: string) => {
    dispatch(confirmOrderThunk(orderId));
  };

  const handleCancelSingle = (orderId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId}?`)) {
      dispatch(cancelOrderThunk(orderId));
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getAdminOrders({ page }));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col w-full pb-12">
        {/* Top Header & Actions */}
        <OrderHeader
          selectedCount={selectedIds.length}
          onExport={handleExport}
          onBatchPrint={handleBatchPrint}
          onBulkConfirm={handleBulkConfirm}
          isExporting={isExporting}
        />

        {/* Status Segment Tabs */}
        <OrderStatusTabs
          activeTab={filters.statusTab}
          counts={counts}
          onTabChange={handleTabChange}
        />

        {/* Command & Filter Bar */}
        <OrderFilterBar
          searchQuery={filters.search}
          dateRange={filters.dateRange}
          paymentMethod={filters.paymentMethod}
          vendor={filters.vendor}
          courier={filters.courier}
          onSearchChange={handleSearchChange}
          onDateRangeChange={handleDateRangeChange}
          onPaymentMethodChange={handlePaymentMethodChange}
          onVendorChange={handleVendorChange}
          onCourierChange={handleCourierChange}
          onClearFilters={handleClearFilters}
        />

        {/* Data Table & Pagination inside Card */}
        <div className="flex flex-col">
          <OrderTable
            orders={orders}
            selectedIds={selectedIds}
            onToggleSelect={(id) => dispatch(toggleSelectOrder(id))}
            onSelectAll={(checked) => dispatch(selectAllOrders(checked))}
            onViewDetail={handleViewDetail}
            onPrintOrder={handlePrintOrder}
            onTrackOrder={handleTrackOrder}
          />
          <OrderPagination
            currentPage={currentPage}
            totalOrders={totalOrders}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Quick Detail Drawer */}
        <OrderDetailDrawer
          order={selectedOrderForDetail}
          onClose={() => dispatch(closeOrderDetail())}
          onConfirm={handleConfirmSingle}
          onCancel={handleCancelSingle}
          onPrint={handlePrintOrder}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminOrder;
