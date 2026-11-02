import React, { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import ShopMetricStrip from "../../components/admin/shop/ShopMetricStrip";
import ShopStatusTabs from "../../components/admin/shop/ShopStatusTabs";
import ShopFilterBar from "../../components/admin/shop/ShopFilterBar";
import ShopTable from "../../components/admin/shop/ShopTable";
import ShopPagination from "../../components/admin/shop/ShopPagination";
import KycReviewDrawer from "../../components/admin/shop/KycReviewDrawer";
import {
  LockShopModal,
  EditCommissionModal,
} from "../../components/admin/shop/ShopActionModals";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getAdminShops,
  getShopMetrics,
  approveShopThunk,
  rejectShopThunk,
  toggleShopLiveThunk,
  lockShopThunk,
  unlockShopThunk,
  updateCommissionTierThunk,
  exportShopsCsvThunk,
  setStatusTab,
  setSearchQuery,
  setCategoryFilter,
  setCommissionFilter,
  setRatingFilter,
  clearFilters,
  setCurrentPage,
  toggleSelectShop,
  toggleSelectAllShops,
  openKycDrawer,
  closeKycDrawer,
  clearMessages,
} from "../../redux/slices/admin/adminShopSlice";
import type { AdminShopItem, ShopTier, AdminShopStatus } from "../../types/ecommerce";

export const AdminShop: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    shops,
    metrics,
    selectedIds,
    selectedShopForKyc,
    isKycDrawerOpen,
    filters,
    currentPage,
    pageSize,
    totalShops,
    isLoading,
    isActionLoading,
    isExporting,
    error,
    successMessage,
  } = useAppSelector((state) => state.adminShop);

  // Local state for modals
  const [lockingShop, setLockingShop] = useState<AdminShopItem | null>(null);
  const [editingShop, setEditingShop] = useState<AdminShopItem | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getShopMetrics());
    dispatch(getAdminShops());
  }, [dispatch]);

  // Handle Tab Change
  const handleTabChange = (tab: AdminShopStatus) => {
    dispatch(setStatusTab(tab));
    dispatch(getAdminShops({ statusTab: tab, page: 1 }));
  };

  // Handle Search Change
  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(getAdminShops({ search: query, page: 1 }));
  };

  // Handle Category Change
  const handleCategoryChange = (category: string) => {
    dispatch(setCategoryFilter(category));
    dispatch(getAdminShops({ category, page: 1 }));
  };

  // Handle Commission Tier Change
  const handleCommissionChange = (commissionTier: string) => {
    dispatch(setCommissionFilter(commissionTier));
    dispatch(getAdminShops({ commissionTier, page: 1 }));
  };

  // Handle Rating Change
  const handleRatingChange = (rating: string) => {
    dispatch(setRatingFilter(rating));
    dispatch(getAdminShops({ rating, page: 1 }));
  };

  // Handle Reset Filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(getAdminShops({ statusTab: "all", search: "", category: "all", commissionTier: "all", rating: "all", page: 1 }));
  };

  // Handle Page Change
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getAdminShops({ page }));
  };

  // Quick Actions
  const handleQuickApprove = (shopId: number) => {
    dispatch(approveShopThunk({ shopId, notes: "Phê duyệt nhanh từ bảng điều khiển quản trị viên" }));
  };

  const handleQuickReject = (shop: AdminShopItem) => {
    dispatch(openKycDrawer(shop));
  };

  const handleToggleLive = (shopId: number, is_live: boolean) => {
    dispatch(toggleShopLiveThunk({ shopId, is_live }));
  };

  const handleLockConfirm = (shopId: number, reason: string) => {
    dispatch(lockShopThunk({ shopId, reason }));
    setLockingShop(null);
  };

  const handleUnlockConfirm = (shopId: number) => {
    dispatch(unlockShopThunk(shopId));
  };

  const handleCommissionConfirm = (shopId: number, tier: ShopTier, rate: number) => {
    dispatch(updateCommissionTierThunk({ shopId, tier, rate }));
    setEditingShop(null);
  };

  const handleExportCsv = () => {
    dispatch(exportShopsCsvThunk());
  };

  return (
    <AdminLayout>
      <div className="relative w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Toast / Notification Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-secondary-fixed/40 border border-secondary text-on-secondary-fixed flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                check_circle
              </span>
              <span className="font-label-md text-label-md">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(clearMessages())}
              className="text-on-secondary-fixed/70 hover:text-on-secondary-fixed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <span className="font-label-md text-label-md">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(clearMessages())}
              className="text-on-error-container/70 hover:text-on-error-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* 1. Page Header & Quick Metric Strip */}
        <section className="flex flex-col gap-5">
          {/* Top Title & Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                  Merchant &amp; Store Management
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  Live Directory
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                Monitor registered vendors, approve shop onboarding applications, enforce marketplace policies, and manage commission tiers.
              </p>
            </div>

            {/* Action Button Group */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isExporting ? "sync" : "download"}
                </span>
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_business</span>
                <span>+ Onboard New Merchant</span>
              </button>
            </div>
          </div>

          {/* 4-Column Quick Metric Strip */}
          <ShopMetricStrip metrics={metrics} />
        </section>

        {/* 2. Status Tabs & Operational Filter Bar */}
        <section className="flex flex-col gap-3">
          <ShopStatusTabs
            currentTab={filters.statusTab}
            counts={metrics.statusCounts}
            onTabChange={handleTabChange}
          />
          <ShopFilterBar
            filters={filters}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onCommissionChange={handleCommissionChange}
            onRatingChange={handleRatingChange}
            onClearFilters={handleClearFilters}
          />
        </section>

        {/* 3. Dedicated Merchant Management Data Table */}
        <ShopTable
          shops={shops}
          selectedIds={selectedIds}
          isLoading={isLoading}
          onToggleSelectShop={(id) => dispatch(toggleSelectShop(id))}
          onToggleSelectAll={() => dispatch(toggleSelectAllShops())}
          onViewKyc={(shop) => dispatch(openKycDrawer(shop))}
          onQuickApprove={handleQuickApprove}
          onQuickReject={handleQuickReject}
          onToggleLive={handleToggleLive}
          onEditShop={(shop) => setEditingShop(shop)}
          onLockShop={(shop) => setLockingShop(shop)}
          onUnlockShop={handleUnlockConfirm}
        />

        {/* 5. Table Footer & Pagination */}
        <ShopPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalShops}
          onPageChange={handlePageChange}
        />

        {/* 4. Slide-over KYC Review Drawer */}
        <KycReviewDrawer
          isOpen={isKycDrawerOpen}
          shop={selectedShopForKyc}
          isActionLoading={isActionLoading}
          onClose={() => dispatch(closeKycDrawer())}
          onApprove={(shopId, notes) => dispatch(approveShopThunk({ shopId, notes }))}
          onReject={(shopId, reason) => dispatch(rejectShopThunk({ shopId, reason }))}
          onUpdateCommission={(shopId, tier, rate) =>
            dispatch(updateCommissionTierThunk({ shopId, tier, rate }))
          }
        />

        {/* Lock Merchant Modal */}
        <LockShopModal
          isOpen={Boolean(lockingShop)}
          shop={lockingShop}
          onClose={() => setLockingShop(null)}
          onConfirm={handleLockConfirm}
        />

        {/* Edit Commission Modal */}
        <EditCommissionModal
          isOpen={Boolean(editingShop)}
          shop={editingShop}
          onClose={() => setEditingShop(null)}
          onConfirm={handleCommissionConfirm}
        />

        {/* Onboard New Merchant Modal */}
        {isOnboardingModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setIsOnboardingModalOpen(false)}
          >
            <div
              className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_business</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Mời Đối Tác Gian Hàng Mới
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Gửi đường dẫn đăng ký và biểu mẫu thẩm định KYC trực tiếp
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-[13px]">
                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Tên thương nhân / Doanh nghiệp:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Công ty TNHH Sáng Tạo Nghệ Thuật"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Email nhận liên kết xác thực KYC:
                  </label>
                  <input
                    type="email"
                    placeholder="merchant-contact@domain.vn"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Ngành hàng đăng ký dự kiến:
                  </label>
                  <select className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Artisan Craft</option>
                    <option>Footwear &amp; Fashion</option>
                    <option>Electronics</option>
                    <option>Ceramics &amp; Heritage</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardingModalOpen(false);
                    alert("Đã gửi lời mời khởi tạo gian hàng kèm liên kết KYC qua email!");
                  }}
                  className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary cursor-pointer"
                >
                  Gửi Lời Mời Onboarding
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminShop;
