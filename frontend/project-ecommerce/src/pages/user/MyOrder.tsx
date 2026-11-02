import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerLayout from "../../layout/CustomerLayout";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import OrderSearchBar from "../../components/user/order/OrderSearchBar";
import OrderTabs from "../../components/user/order/OrderTabs";
import OrderCard from "../../components/user/order/OrderCard";
import CancelOrderModal from "../../components/user/order/CancelOrderModal";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  getUserOrders,
  getUserOrderCounts,
  setCurrentTab,
  setSearchQuery,
  setCurrentPage,
  openCancelModal,
  closeCancelModal,
  cancelOrderAction,
  confirmReceivedAction,
} from "../../redux/slices/user/orderSlice";
import { fetchUserProfile } from "../../redux/slices/user/profileSlice";
import type { UserOrder, UserOrderStatusTab } from "../../types/order";

export const MyOrder: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    orders,
    counts,
    total,
    currentTab,
    searchQuery,
    currentPage,
    pageSize,
    loading,
    actionLoading,
    selectedOrderForCancel,
  } = useAppSelector((state) => state.userOrder);

  const { profile } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Fetch profile and order counts once
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(getUserOrderCounts());
  }, [dispatch]);

  // Fetch orders when tab, search, or page changes
  useEffect(() => {
    dispatch(
      getUserOrders({
        tab: currentTab,
        search: searchQuery,
        page: currentPage,
        pageSize,
      })
    );
  }, [dispatch, currentTab, searchQuery, currentPage, pageSize]);

  const handleTabChange = (tab: UserOrderStatusTab) => {
    dispatch(setCurrentTab(tab));
  };

  const handleSearchSubmit = () => {
    dispatch(setSearchQuery(localSearch));
  };

  const handleCancelClick = (order: UserOrder) => {
    dispatch(openCancelModal(order));
  };

  const handleConfirmCancel = async (orderId: number, reason: string) => {
    try {
      await dispatch(cancelOrderAction({ orderId, cancelReason: reason })).unwrap();
    } catch {
      // Error handled in slice
    }
  };

  const handleConfirmReceived = async (orderId: number) => {
    if (window.confirm("Bạn xác nhận đã nhận được đầy đủ hàng và hài lòng với kiện hàng?")) {
      try {
        await dispatch(confirmReceivedAction(orderId)).unwrap();
      } catch {
        // Error handled in slice
      }
    }
  };

  const handleRepurchase = (order: UserOrder) => {
    if (order.items.length > 0) {
      navigate(`/product/${order.items[0].productId}`);
    } else {
      navigate("/");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  // Merged profile for sidebar
  const mergedProfile = profile
    ? {
        ...profile,
        full_name: user?.full_name || profile.full_name,
        email: user?.email || profile.email,
        phone: user?.phone || profile.phone,
        role: user?.role || profile.role,
      }
    : null;

  return (
    <CustomerLayout>
      <main className="w-full bg-surface min-h-[calc(100vh-164px)] pb-12">
        <div className="max-w-[1440px] mx-auto px-4 md:px-margin-lg pt-4">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant mb-5"
          >
            <Link
              to="/"
              className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Trang chủ</span>
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">
              chevron_right
            </span>
            <Link
              to="/profile"
              className="hover:text-primary transition-colors font-medium text-on-surface-variant"
            >
              Tài khoản của tôi
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">
              chevron_right
            </span>
            <span className="text-on-surface font-bold">Lịch sử đơn hàng</span>
          </nav>

          {/* Two-Column Architecture */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* LEFT ACCOUNT SIDEBAR */}
            <aside className="w-full lg:w-72 shrink-0">
              <ProfileSidebar
                profile={mergedProfile}
                activeTab="my-orders"
              />
            </aside>

            {/* RIGHT MAIN CONTENT AREA */}
            <section className="flex-1 min-w-0 flex flex-col gap-5">
              {/* Page Header & Search Bar */}
              <OrderSearchBar
                totalCount={total}
                searchQuery={localSearch}
                onSearchChange={setLocalSearch}
                onSearchSubmit={handleSearchSubmit}
              />

              {/* Horizontal Status Tabs */}
              <OrderTabs
                currentTab={currentTab}
                counts={counts}
                onTabChange={handleTabChange}
              />

              {/* ORDERS FEED */}
              {loading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4 animate-pulse"
                    >
                      <div className="h-6 bg-surface-container-high rounded w-1/3" />
                      <div className="h-16 bg-surface-container-high rounded w-full" />
                      <div className="h-8 bg-surface-container-high rounded w-1/4 self-end" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/40 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl">
                      shopping_bag
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                    Chưa có đơn hàng nào
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
                    {searchQuery
                      ? `Không tìm thấy đơn hàng nào khớp với từ khóa "${searchQuery}".`
                      : "Bạn chưa có đơn hàng nào trong trạng thái này. Hãy dạo quanh sàn và chọn cho mình những món đồ yêu thích!"}
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary-container transition-all"
                  >
                    <span>Khám phá sản phẩm</span>
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onCancelClick={handleCancelClick}
                      onConfirmReceived={handleConfirmReceived}
                      onRepurchase={handleRepurchase}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Pagination Container */}
              {total > 0 && (
                <div className="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="font-body-sm text-body-sm text-on-surface-variant order-2 sm:order-1">
                    Hiển thị <strong className="text-on-surface">{startIndex} - {endIndex}</strong> trong tổng số{" "}
                    <strong className="text-on-surface">{total}</strong> đơn hàng
                  </span>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                      className="w-9 h-9 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chevron_left
                      </span>
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => dispatch(setCurrentPage(pageNum))}
                          className={`w-9 h-9 rounded-lg font-label-md text-label-md font-bold transition-colors cursor-pointer ${
                            isActive
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                      className="w-9 h-9 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Cancel Order Modal */}
        <CancelOrderModal
          order={selectedOrderForCancel}
          isOpen={!!selectedOrderForCancel}
          onClose={() => dispatch(closeCancelModal())}
          onConfirmCancel={handleConfirmCancel}
          loading={actionLoading}
        />
      </main>
    </CustomerLayout>
  );
};

export default MyOrder;
