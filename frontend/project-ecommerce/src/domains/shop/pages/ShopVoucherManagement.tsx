import React, { useEffect, useState, useMemo } from "react";
import ShopLayout from "@/app/layout/ShopLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchShopVoucherList,
  fetchShopVoucherStatsThunk,
  createShopVoucherThunk,
  updateShopVoucherThunk,
  deleteShopVoucherThunk,
  toggleShopVoucherStatusThunk,
  setStatusTab,
  setTypeFilter,
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeModal,
} from "@/domains/shop/state/shopVoucherSlice";
import type {
  ShopVoucherItem,
  ShopVoucherStatus,
  VoucherFilterCategory,
  CreateShopVoucherPayload,
} from "@/domains/shop/types/shopVoucher.types";
import {
  ShopVoucherHeader,
  ShopVoucherStatsCards,
  ShopVoucherTabs,
  ShopVoucherFilterBar,
  ShopVoucherTable,
  ShopVoucherFormModal,
} from "@/domains/shop/components/voucher";

export const ShopVoucherManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    vouchers,
    stats,
    filters,
    isLoading,
    isSaving,
    isModalOpen,
    editingVoucher,
  } = useAppSelector((state) => state.shopVoucher);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<ShopVoucherItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    dispatch(setSearchQuery(""));
    dispatch(setTypeFilter("all"));
    dispatch(setStatusTab("all"));
    dispatch(fetchShopVoucherStatsThunk());
    dispatch(fetchShopVoucherList());
  }, [dispatch]);

  // Compute counts per status
  const tabCounts = useMemo<Record<ShopVoucherStatus, number>>(() => {
    const counts: Record<ShopVoucherStatus, number> = {
      all: vouchers.length,
      ongoing: 0,
      upcoming: 0,
      expired: 0,
      paused: 0,
    };

    vouchers.forEach((v) => {
      if (counts[v.status] !== undefined) {
        counts[v.status]++;
      }
    });

    return counts;
  }, [vouchers]);

  // Filter vouchers based on current tab, type filter, and search
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((item) => {
      // Status filter
      if (filters.statusTab !== "all" && item.status !== filters.statusTab) {
        return false;
      }

      // Type filter
      if (filters.typeFilter !== "all" && item.type !== filters.typeFilter) {
        return false;
      }

      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        const codeMatch = item.code.toLowerCase().includes(query);
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        if (!codeMatch && !titleMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [vouchers, filters]);

  // Handle Tab change
  const handleTabChange = (tab: ShopVoucherStatus) => {
    dispatch(setStatusTab(tab));
  };

  // Handle Type filter change
  const handleTypeChange = (type: VoucherFilterCategory) => {
    dispatch(setTypeFilter(type));
  };

  // Handle Search change
  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  // Reset filters
  const handleResetFilters = () => {
    dispatch(setSearchQuery(""));
    dispatch(setTypeFilter("all"));
    dispatch(setStatusTab("all"));
  };

  // Submit create or edit form
  const handleFormSubmit = async (payload: CreateShopVoucherPayload) => {
    try {
      if (editingVoucher) {
        await dispatch(
          updateShopVoucherThunk({
            id: editingVoucher.id,
            payload,
          })
        ).unwrap();
        showToast(`Đã cập nhật mã voucher "${payload.code}" thành công!`);
      } else {
        await dispatch(createShopVoucherThunk(payload)).unwrap();
        showToast(`Đã tạo mã voucher "${payload.code}" thành công!`);
      }
      dispatch(closeModal());
    } catch (err) {
      const msg = typeof err === "string" ? err : "Có lỗi xảy ra khi lưu voucher";
      showToast(msg, true);
    }
  };

  // Toggle status
  const handleToggleStatus = async (voucher: ShopVoucherItem) => {
    try {
      const updated = await dispatch(toggleShopVoucherStatusThunk(voucher.id)).unwrap();
      const statusLabel = updated.status === "paused" ? "tạm dừng" : "kích hoạt lại";
      showToast(`Đã ${statusLabel} voucher ${voucher.code}`);
    } catch (err) {
      const msg = typeof err === "string" ? err : "Lỗi đổi trạng thái voucher";
      showToast(msg, true);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingVoucher) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteShopVoucherThunk(deletingVoucher.id)).unwrap();
      showToast(`Đã xoá voucher "${deletingVoucher.code}"`);
      setDeletingVoucher(null);
    } catch (err) {
      const msg = typeof err === "string" ? err : "Lỗi khi xoá voucher";
      showToast(msg, true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ShopLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <ShopVoucherHeader
          totalVouchers={vouchers.length}
          onOpenCreateModal={() => dispatch(openCreateModal())}
        />

        {/* Stats Cards */}
        <ShopVoucherStatsCards stats={stats} />

        {/* Tabs */}
        <ShopVoucherTabs
          currentTab={filters.statusTab}
          onTabChange={handleTabChange}
          tabCounts={tabCounts}
        />

        {/* Filter bar */}
        <ShopVoucherFilterBar
          search={filters.search}
          onSearchChange={handleSearchChange}
          typeFilter={filters.typeFilter}
          onTypeFilterChange={handleTypeChange}
          onResetFilters={handleResetFilters}
        />

        {/* Voucher Table */}
        <ShopVoucherTable
          vouchers={filteredVouchers}
          isLoading={isLoading}
          onEdit={(v) => dispatch(openEditModal(v))}
          onToggleStatus={handleToggleStatus}
          onDelete={(v) => setDeletingVoucher(v)}
          onOpenCreate={() => dispatch(openCreateModal())}
        />

        {/* Modal Create / Edit */}
        <ShopVoucherFormModal
          isOpen={isModalOpen}
          onClose={() => dispatch(closeModal())}
          onSubmit={handleFormSubmit}
          editingVoucher={editingVoucher}
          isSaving={isSaving}
        />

        {/* Modal Confirm Delete */}
        {deletingVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 border border-outline-variant/30 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Xác nhận xoá voucher?
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bạn có chắc chắn muốn xoá mã ưu đãi{" "}
                  <strong className="text-on-surface font-mono text-primary">
                    {deletingVoucher.code}
                  </strong>{" "}
                  ({deletingVoucher.title}) không? Thao tác này không thể hoàn tác.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingVoucher(null)}
                  className="px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl font-label-md text-label-md transition-colors"
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-error hover:bg-error/90 text-on-error rounded-xl font-label-md text-label-md font-semibold transition-all active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? "Đang xoá..." : "Xoá voucher"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-label-md text-label-md border animate-in slide-in-from-bottom duration-200 ${
              toastMessage.isError
                ? "bg-error text-on-error border-error"
                : "bg-inverse-surface text-inverse-on-surface border-outline-variant/30"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toastMessage.isError ? "error" : "check_circle"}
            </span>
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    </ShopLayout>
  );
};

export default ShopVoucherManagement;

