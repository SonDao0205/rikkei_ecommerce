import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  fetchShopDashboardData,
  setDateFilter,
  setChartTab,
  setSearchQuery,
  confirmShopOrder,
  printOrderLabel,
  setOrderFilterStatus,
} from "../../redux/slices/shop/shopDashboardSlice";
import type {
  ShopDateFilter,
  ShopChartMetricTab,
} from "../../types/shop/shopDashboard.types";
import {
  ShopSidebar,
  ShopHeader,
  ShopWelcomeBanner,
  ShopUrgentActions,
  ShopMetricStats,
  ShopSalesChart,
  ShopTopProducts,
  ShopUrgentOrdersTable,
} from "../../components/shop/dashboard";

export const ShopDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    isLoading,
    activeDateFilter,
    activeChartTab,
    searchQuery,
    orderFilterStatus,
  } = useAppSelector((state) => state.shopDashboard);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch initial dashboard data on mount
  useEffect(() => {
    dispatch(fetchShopDashboardData(activeDateFilter));
  }, [dispatch, activeDateFilter]);

  const handleDateFilterChange = useCallback(
    (filter: ShopDateFilter) => {
      dispatch(setDateFilter(filter));
      dispatch(fetchShopDashboardData(filter));
    },
    [dispatch]
  );

  const handleRefresh = useCallback(() => {
    dispatch(fetchShopDashboardData(activeDateFilter));
  }, [dispatch, activeDateFilter]);

  const handleChartTabChange = useCallback(
    (tab: ShopChartMetricTab) => {
      dispatch(setChartTab(tab));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const handleConfirmOrder = useCallback(
    (orderId: string) => {
      dispatch(confirmShopOrder(orderId));
    },
    [dispatch]
  );

  const handlePrintLabel = useCallback(
    (orderId: string) => {
      dispatch(printOrderLabel(orderId));
    },
    [dispatch]
  );

  const handleStatusFilterToggle = useCallback(() => {
    // Cycle through filter statuses: ALL -> PENDING -> PACKING -> ALL
    const nextStatus =
      orderFilterStatus === "ALL"
        ? "PENDING"
        : orderFilterStatus === "PENDING"
        ? "PACKING"
        : "ALL";
    dispatch(setOrderFilterStatus(nextStatus));
  }, [dispatch, orderFilterStatus]);

  // Filter urgent orders based on search and status
  const filteredOrders = useMemo(() => {
    return data.urgentOrders.filter((order) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        orderFilterStatus === "ALL" ||
        (orderFilterStatus === "PENDING" && order.status === "PENDING_CONFIRMATION") ||
        (orderFilterStatus === "PACKING" && order.status === "PACKING");

      return matchesSearch && matchesStatus;
    });
  }, [data.urgentOrders, searchQuery, orderFilterStatus]);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Sidebar Navigation */}
      <ShopSidebar
        currentPath="dashboard"
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-64 flex flex-col min-h-screen">
        {/* Fixed Topbar Header */}
        <ShopHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          shopStatusText={data.shopInfo.statusText}
        />

        {/* Dashboard Canvas */}
        <main className="relative pt-16 bg-surface flex-1">
          <div className="p-space-md lg:p-space-lg space-y-space-lg max-w-[1440px] mx-auto w-full">
            {/* 1. Welcome & Operational Status Bar */}
            <ShopWelcomeBanner
              shopInfo={data.shopInfo}
              activeFilter={activeDateFilter}
              onFilterChange={handleDateFilterChange}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />

            {/* 2. To-Do Urgent Action Banner */}
            <ShopUrgentActions urgentActions={data.urgentActions} />

            {/* 3. Performance Metric Cards */}
            <ShopMetricStats metrics={data.kpiMetrics} />

            {/* 4. Operational Body Sections (Two-column layout 65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-8">
                <ShopSalesChart
                  salesTrend={data.salesTrend.points}
                  summary={data.salesTrend.summary}
                  activeTab={activeChartTab}
                  onTabChange={handleChartTabChange}
                />
              </div>
              <div className="lg:col-span-4">
                <ShopTopProducts products={data.bestSellers} />
              </div>
            </div>

            {/* 5. Bottom Quick Table: Đơn hàng khẩn cấp */}
            <ShopUrgentOrdersTable
              orders={filteredOrders}
              onConfirmOrder={handleConfirmOrder}
              onPrintLabel={handlePrintLabel}
              onStatusFilterToggle={handleStatusFilterToggle}
              activeStatusFilter={orderFilterStatus}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopDashboard;
