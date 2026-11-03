import React, { useEffect, useMemo, useCallback } from "react";
import ShopLayout from "../../layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  fetchShopDashboardData,
  setDateFilter,
  setChartTab,
  confirmShopOrder,
  printOrderLabel,
  setOrderFilterStatus,
} from "../../redux/slices/shop/shopDashboardSlice";
import type {
  ShopDateFilter,
  ShopChartMetricTab,
} from "../../types/shop/shopDashboard.types";
import {
  ShopWelcomeBanner,
  ShopMetricStats,
  ShopUrgentActions,
  ShopSalesChart,
  ShopTopProducts,
  ShopUrgentOrdersTable,
} from "../../components/shop/dashboard";

export const ShopDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    isLoading,
    error,
    activeDateFilter,
    activeChartTab,
    searchQuery,
    orderFilterStatus,
  } = useAppSelector((state) => state.shopDashboard);

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
    <ShopLayout>
      {/* Loading Skeleton matching AdminDashBoard */}
      {isLoading && !data && (
        <div className="flex flex-col gap-6 py-6 animate-pulse">
          <div className="h-16 bg-surface-container rounded-xl w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-surface-container rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96 bg-surface-container rounded-xl" />
            <div className="lg:col-span-4 h-96 bg-surface-container rounded-xl" />
          </div>
        </div>
      )}

      {/* Error State matching AdminDashBoard */}
      {error && !data && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-3">
            error_outline
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Không thể tải dữ liệu Bảng điều khiển
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1 mb-5">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* Main Dashboard View */}
      {data && (
        <div className="flex flex-col w-full">
          {/* 1. Header Banner & Quick Date Filter */}
          <ShopWelcomeBanner
            shopInfo={data.shopInfo}
            activeFilter={activeDateFilter}
            onFilterChange={handleDateFilterChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* 2. Key Metrics Row (4 Bento KPI Cards) */}
          <ShopMetricStats metrics={data.kpiMetrics} />

          {/* 3. Urgent Action Tasks Bento */}
          <ShopUrgentActions urgentActions={data.urgentActions} />

          {/* 4. Data Visualization Grid (Sales Trend 66% + Top 5 Products 33%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <ShopSalesChart
              salesTrend={data.salesTrend.points}
              summary={data.salesTrend.summary}
              activeTab={activeChartTab}
              onTabChange={handleChartTabChange}
            />

            <ShopTopProducts products={data.bestSellers} />
          </div>

          {/* 5. Bottom Urgent Orders Table */}
          <ShopUrgentOrdersTable
            orders={filteredOrders}
            onConfirmOrder={handleConfirmOrder}
            onPrintLabel={handlePrintLabel}
            onStatusFilterToggle={handleStatusFilterToggle}
            activeStatusFilter={orderFilterStatus}
          />
        </div>
      )}
    </ShopLayout>
  );
};

export default ShopDashboard;
