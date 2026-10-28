import React, { useEffect } from "react";
import AdminLayout from "../layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchDashboardMetrics,
  setTimeRange,
  setTrendMetric,
  exportDashboardReport,
} from "../redux/slices/adminDashboardSlice";
import DashboardHeader from "../components/admin/DashboardHeader";
import DashboardKpiCards from "../components/admin/DashboardKpiCards";
import RevenueTrendChart from "../components/admin/RevenueTrendChart";
import CodSettlementDonut from "../components/admin/CodSettlementDonut";
import DashboardOperationsFeed from "../components/admin/DashboardOperationsFeed";
import type { TimeRangeFilter, TrendMetricType } from "../types/ecommerce";

const AdminDashBoard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    timeRange,
    trendMetric,
    isLoading,
    error,
    lastUpdated,
    isExporting,
  } = useAppSelector((state) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchDashboardMetrics(timeRange));
  }, [dispatch, timeRange]);

  const handleTimeRangeChange = (newRange: TimeRangeFilter) => {
    dispatch(setTimeRange(newRange));
    dispatch(fetchDashboardMetrics(newRange));
  };

  const handleTrendMetricChange = (metric: TrendMetricType) => {
    dispatch(setTrendMetric(metric));
  };

  const handleExport = () => {
    dispatch(exportDashboardReport());
  };

  const handleRetry = () => {
    dispatch(fetchDashboardMetrics(timeRange));
  };

  return (
    <AdminLayout>
      {/* Loading Skeleton */}
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

      {/* Error State */}
      {error && !data && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-3">
            error_outline
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Failed to Load Dashboard Data
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-1 mb-5">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md font-semibold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Main Dashboard View */}
      {data && (
        <div className="flex flex-col w-full pb-12">
          {/* Executive Header */}
          <DashboardHeader
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            onExport={handleExport}
            isExporting={isExporting}
            lastUpdated={lastUpdated}
          />

          {/* Key Metrics Row (4 Bento KPI Cards) */}
          <DashboardKpiCards
            revenue={data.kpis.revenue}
            orders={data.kpis.orders}
            inventory={data.kpis.inventory}
            customers={data.kpis.customers}
          />

          {/* Data Visualization Grid (Revenue Trend 66% + COD Settlement Donut 33%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <RevenueTrendChart
              weekLabel={data.revenueTrend.weekLabel}
              points={data.revenueTrend.points}
              avgBasketValue={data.revenueTrend.avgBasketValue}
              codVolumePercent={data.revenueTrend.codVolumePercent}
              digitalVolumePercent={data.revenueTrend.digitalVolumePercent}
              metricType={trendMetric}
              onMetricTypeChange={handleTrendMetricChange}
            />

            <CodSettlementDonut
              totalActiveBatch={data.codSettlement.totalActiveBatch}
              slices={data.codSettlement.slices}
              lastSynced={data.codSettlement.lastSynced}
            />
          </div>

          {/* Bottom Row: Operations Attention & Real-Time Activity Log */}
          <DashboardOperationsFeed
            operations={data.operations}
            activities={data.activities}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashBoard;
