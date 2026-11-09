import React from "react";
import { Link } from "react-router-dom";

export interface WishlistEmptyStateProps {
  isDemoView?: boolean;
  onExitDemoView?: () => void;
}

export const WishlistEmptyState: React.FC<WishlistEmptyStateProps> = ({
  isDemoView = false,
  onExitDemoView,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/60">
      <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-6">
        <span className="material-symbols-outlined text-[54px]">favorite_border</span>
      </div>

      <h3 className="font-headline-xl text-xl sm:text-2xl text-on-surface font-bold mb-2">
        Danh sách yêu thích trống
      </h3>

      <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mb-8">
        Bạn chưa lưu sản phẩm nào. Hãy dạo quanh các cửa hàng thủ công, thời trang và đồ gia dụng tuyển chọn để tìm món đồ ưng ý nhé!
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="h-12 px-6 sm:px-8 rounded-xl bg-primary-container text-on-primary text-xs sm:text-sm font-bold hover:bg-primary transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span>Khám phá sản phẩm hot hôm nay</span>
        </Link>

        {isDemoView && onExitDemoView && (
          <button
            type="button"
            onClick={onExitDemoView}
            className="h-12 px-5 rounded-xl bg-surface-container text-on-surface text-xs sm:text-sm font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Quay lại danh sách đã lưu
          </button>
        )}
      </div>
    </div>
  );
};

export default WishlistEmptyState;

