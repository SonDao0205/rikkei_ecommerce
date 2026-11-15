import React, { useState, useEffect } from "react";
import type { ProductReview } from "@/domains/storefront/types/review.types";
import ProductReviewItem from "./ProductReviewItem";

interface ProductAllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  reviews: ProductReview[];
  onLike: (reviewId: string) => void;
  onDislike: (reviewId: string) => void;
  onAddReply: (reviewId: string, content: string, userName?: string) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export const ProductAllReviewsModal: React.FC<ProductAllReviewsModalProps> = ({
  isOpen,
  onClose,
  productName,
  reviews,
  onLike,
  onDislike,
  onAddReply,
  currentUserName,
  currentUserAvatar,
}) => {
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate average rating
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  // Filtered reviews
  const filteredReviews = selectedRatingFilter === null
    ? reviews
    : reviews.filter((r) => r.rating === selectedRatingFilter);

  // Rating counts
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating] = (starCounts[r.rating] || 0) + 1;
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-reviews-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/60 shrink-0">
          <div>
            <h3 id="all-reviews-title" className="font-bold text-lg sm:text-xl text-on-surface">
              Tất cả đánh giá ({totalReviews})
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-1 mt-0.5">
              {productName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Đóng popup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Rating Overview & Filter Chips */}
        <div className="px-5 sm:px-6 py-3.5 bg-surface-container-lowest border-b border-outline-variant/20 flex flex-wrap items-center gap-3 shrink-0">
          {/* Average Badge */}
          <div className="flex items-center gap-2 pr-4 border-r border-outline-variant/30">
            <span className="text-2xl font-black text-primary">{averageRating}</span>
            <div>
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {totalReviews} đánh giá
              </span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setSelectedRatingFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedRatingFilter === null
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              Tất cả ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setSelectedRatingFilter(selectedRatingFilter === star ? null : star)
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  selectedRatingFilter === star
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>{star}</span>
                <span
                  className="material-symbols-outlined text-[13px] text-amber-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span>({starCounts[star] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Reviews List */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3 divide-y divide-outline-variant/15">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">
                rate_review
              </span>
              <p className="text-sm">Không có đánh giá nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <ProductReviewItem
                key={review.id}
                review={review}
                onLike={onLike}
                onDislike={onDislike}
                onAddReply={onAddReply}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-outline-variant/20 bg-surface-container-low/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAllReviewsModal;

