import React, { useEffect, useState, useCallback } from "react";
import ShopLayout from "@/app/layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchShopOrderList,
  fetchShopOrderCountsThunk,
  confirmShopOrderThunk,
  startPackingShopOrderThunk,
  dispatchShopOrderThunk,
  cancelShopOrderThunk,
  bulkConfirmShopOrdersThunk,
  exportShopOrdersCsvThunk,
  setStatusTab,
  setSearchQuery,
  setDateRangeFilter,
  setPaymentMethodFilter,
  setCourierFilter,
  clearAllFilters,
  toggleSelectOrder,
  selectAllOrders,
  setCurrentPage,
  openOrderDetail,
  closeOrderDetail,
} from "@/domains/shop/state/shopOrderSlice";
import type { ShopOrderStatus } from "@/domains/shop/types/shopOrder.types";
import {
  ShopOrderHeader,
  ShopOrderStatsCards,
  ShopOrderStatusTabs,
  ShopOrderFilterBar,
  ShopOrderTable,
  ShopOrderPagination,
  ShopOrderDetailDrawer,
} from "@/domains/shop/components/order";

export const ShopOrderManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    orders,
    totalOrders,
    counts,
    selectedIds,
    selectedOrderForDetail,
    filters,
    currentPage,
    pageSize,
    isLoading,
    isExporting,
    error,
  } = useAppSelector((state) => state.shopOrder);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    dispatch(clearAllFilters());
    dispatch(fetchShopOrderCountsThunk());
    dispatch(fetchShopOrderList());
  }, [dispatch]);

  const handleTabChange = useCallback(
    (tab: ShopOrderStatus) => {
      dispatch(setStatusTab(tab));
      dispatch(fetchShopOrderList({ statusTab: tab, page: 1 }));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
      dispatch(fetchShopOrderList({ search: query, page: 1 }));
    },
    [dispatch]
  );

  const handleDateRangeChange = useCallback(
    (range: string) => {
      dispatch(setDateRangeFilter(range));
      dispatch(fetchShopOrderList({ dateRange: range, page: 1 }));
    },
    [dispatch]
  );

  const handlePaymentMethodChange = useCallback(
    (pm: string) => {
      dispatch(setPaymentMethodFilter(pm));
      dispatch(fetchShopOrderList({ paymentMethod: pm, page: 1 }));
    },
    [dispatch]
  );

  const handleCourierChange = useCallback(
    (c: string) => {
      dispatch(setCourierFilter(c));
      dispatch(fetchShopOrderList({ courier: c, page: 1 }));
    },
    [dispatch]
  );

  const handleClearFilters = useCallback(() => {
    dispatch(clearAllFilters());
    dispatch(fetchShopOrderList({ statusTab: "all", search: "", dateRange: "all", paymentMethod: "all", courier: "all", page: 1 }));
  }, [dispatch]);

  const handleConfirmOrder = useCallback(
    async (id: string) => {
      const res = await dispatch(confirmShopOrderThunk(id));
      if (confirmShopOrderThunk.fulfilled.match(res)) {
        showToast(`Đã xác nhận đơn hàng ${id}! Shop có thể tiến hành đóng gói.`);
        dispatch(fetchShopOrderList());
      } else {
        showToast("Lỗi xác nhận đơn hàng", true);
      }
    },
    [dispatch]
  );

  const handleDispatchOrder = useCallback(
    async (id: string) => {
      const order = orders.find((item) => item.id === id);
      if (order?.workflowStatus === "CONFIRMED") {
        const res = await dispatch(startPackingShopOrderThunk(id));
        if (startPackingShopOrderThunk.fulfilled.match(res)) {
          showToast(`Đơn ${order.orderCode} đã chuyển sang đóng gói.`);
          dispatch(fetchShopOrderList());
        } else showToast("Không thể bắt đầu đóng gói đơn hàng", true);
        return;
      }
      const carrier = window.prompt("Nhập mã đơn vị vận chuyển (GHN, GHTK, SPX, VIETTEL_POST):", order?.shipping.courier || "GHN");
      if (!carrier) return;
      const trackingCode = window.prompt("Nhập mã vận đơn:", order?.shipping.trackingCode || "");
      if (!trackingCode) return;
      const res = await dispatch(dispatchShopOrderThunk({ orderId: id, carrier: carrier.trim(), trackingCode: trackingCode.trim() }));
      if (dispatchShopOrderThunk.fulfilled.match(res)) {
        showToast(`Đã chuyển đơn hàng ${id} sang trạng thái Giao cho ĐVVC thành công!`);
        dispatch(fetchShopOrderList());
      } else {
        showToast("Lỗi chuyển trạng thái giao hàng", true);
      }
    },
    [dispatch, orders]
  );

  const handleCancelOrder = useCallback(
    async (id: string) => {
      const reason = window.prompt("Nhập lý do huỷ đơn hàng:", "Hết hàng tại kho hoặc người mua yêu cầu huỷ");
      if (reason && reason.trim()) {
        const res = await dispatch(cancelShopOrderThunk({ orderId: id, reason }));
        if (cancelShopOrderThunk.fulfilled.match(res)) {
          showToast(`Đã huỷ đơn hàng ${id}. Lý do: ${reason}`);
          dispatch(fetchShopOrderList());
        }
      }
    },
    [dispatch]
  );

  const handleBulkConfirm = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const res = await dispatch(bulkConfirmShopOrdersThunk(selectedIds));
    if (bulkConfirmShopOrdersThunk.fulfilled.match(res)) {
      showToast(`Đã xác nhận thành công ${selectedIds.length} đơn hàng đã chọn!`);
    }
  }, [dispatch, selectedIds]);

  const handleExportCsv = useCallback(async () => {
    await dispatch(exportShopOrdersCsvThunk());
    showToast("Đã xuất báo cáo danh sách đơn hàng thành công!");
  }, [dispatch]);

  return (
    <ShopLayout>
      <div className="flex flex-col w-full">
        {/* 1. Header Toolbar */}
        <ShopOrderHeader
          totalOrders={totalOrders}
          selectedCount={selectedIds.length}
          isExporting={isExporting}
          onExportCsv={handleExportCsv}
          onBulkConfirm={handleBulkConfirm}
        />

        {/* 2. Order Stats Metric Cards */}
        <ShopOrderStatsCards
          counts={counts}
          orders={orders}
          onSelectTab={handleTabChange}
        />

        {/* 3. Status Tabs */}
        <ShopOrderStatusTabs
          currentTab={filters.statusTab}
          counts={counts}
          onTabChange={handleTabChange}
        />

        {/* 4. Filter Toolbar */}
        <ShopOrderFilterBar
          searchQuery={filters.search}
          dateRange={filters.dateRange}
          paymentMethod={filters.paymentMethod}
          courier={filters.courier}
          onSearchChange={handleSearchChange}
          onDateRangeChange={handleDateRangeChange}
          onPaymentMethodChange={handlePaymentMethodChange}
          onCourierChange={handleCourierChange}
          onClearFilters={handleClearFilters}
        />

        {/* Error state */}
        {error && (
          <div className="p-4 my-2 rounded-xl bg-error/10 text-error flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => dispatch(fetchShopOrderList())}
              className="text-xs font-bold underline cursor-pointer"
            >
              Tải lại
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && orders.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-outline">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : (
          <>
            {/* 5. Order Table */}
            <ShopOrderTable
              orders={orders}
              selectedIds={selectedIds}
              onToggleSelect={(id) => dispatch(toggleSelectOrder(id))}
              onSelectAll={(checked) => dispatch(selectAllOrders(checked))}
              onConfirmOrder={handleConfirmOrder}
              onDispatchOrder={handleDispatchOrder}
              onCancelOrder={handleCancelOrder}
              onOpenQuickDetail={(order) => dispatch(openOrderDetail(order))}
            />

            {/* 6. Pagination */}
            <ShopOrderPagination
              total={totalOrders}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => {
                dispatch(setCurrentPage(page));
                dispatch(fetchShopOrderList({ page }));
              }}
            />
          </>
        )}

        {/* Quick Detail Drawer */}
        <ShopOrderDetailDrawer
          order={selectedOrderForDetail}
          onClose={() => dispatch(closeOrderDetail())}
          onConfirmOrder={handleConfirmOrder}
          onDispatchOrder={handleDispatchOrder}
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
      </div>
    </ShopLayout>
  );
};

export default ShopOrderManagement;

