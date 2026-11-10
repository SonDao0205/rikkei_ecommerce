import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/app/state/store";
import type { ProductReview, ProductReviewReply } from "@/domains/storefront/types/review.types";
import ProductReviewItem from "./ProductReviewItem";
import ProductAllReviewsModal from "./ProductAllReviewsModal";

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
}

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "rev-1",
    productId: 0,
    userName: "Russell Santiago",
    userAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    timeAgo: "20 giờ",
    badge: "💎 Fan cứng",
    rating: 5,
    content: "Báo cáo tom, để biên soạn vayne chống lại renekton của BIN lol",
    likes: 106,
    dislikes: 0,
    userLiked: false,
    userDisliked: false,
    replies: [
      {
        id: "rep-1",
        userName: "MarketPulse Store",
        userAvatar:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
        timeAgo: "18 giờ",
        badge: "Quản trị viên",
        content:
          "Cảm ơn bạn đã luôn ủng hộ shop nhiệt tình! Chúc bạn có trải nghiệm tuyệt vời với sản phẩm nhé ❤️",
        likes: 12,
        dislikes: 0,
      },
    ],
  },
  {
    id: "rev-2",
    productId: 0,
    userName: "Hoàng Minh Quang",
    userAvatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    timeAgo: "1 ngày trước",
    badge: "✓ Đã mua hàng",
    rating: 5,
    content:
      "Hàng đóng gói cẩn thận, seal niêm phong nguyên vẹn. Máy dùng cực kỳ mượt mà, camera nét căng. Giao hàng hỏa tốc trong 2 giờ rất đúng hẹn!",
    likes: 45,
    dislikes: 1,
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "rev-3",
    productId: 0,
    userName: "Nguyễn Thùy Linh",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    timeAgo: "2 ngày trước",
    badge: "✓ Đã mua hàng",
    rating: 5,
    content:
      "Màu sắc bên ngoài đẹp hơn trong ảnh nhiều, nhân viên tư vấn nhiệt tình chu đáo. Sẽ tiếp tục ủng hộ shop các sản phẩm tiếp theo.",
    likes: 28,
    dislikes: 0,
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "rev-4",
    productId: 0,
    userName: "Trần Đình Trọng",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    timeAgo: "3 ngày trước",
    badge: "💎 Fan cứng",
    rating: 4,
    content:
      "Chất lượng sản phẩm rất tốt trong tầm giá. Thời gian giao hàng nhanh, nhân viên shipper lịch sự, tem bảo hành đầy đủ.",
    likes: 15,
    dislikes: 0,
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "rev-5",
    productId: 0,
    userName: "Lê Văn Nam",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    timeAgo: "4 ngày trước",
    badge: "✓ Đã mua hàng",
    rating: 5,
    content:
      "Đã test qua các chức năng, máy zin nguyên bản 100%. Rất an tâm khi mua hàng chính hãng tại MarketPulse.",
    likes: 19,
    dislikes: 1,
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "rev-6",
    productId: 0,
    userName: "Phạm Mai Anh",
    userAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    timeAgo: "5 ngày trước",
    badge: "✓ Đã mua hàng",
    rating: 5,
    content:
      "Rất ưng ý! Hộp đẹp, phụ kiện đi kèm đầy đủ, hỗ trợ bảo hành chính hãng uy tín.",
    likes: 9,
    dislikes: 0,
    userLiked: false,
    userDisliked: false,
  },
  {
    id: "rev-7",
    productId: 0,
    userName: "Đỗ Minh Triết",
    userAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    timeAgo: "1 tuần trước",
    badge: "✓ Đã mua hàng",
    rating: 5,
    content:
      "Sản phẩm chất lượng vượt mong đợi, săn được deal flash sale giá rất tốt. Đáng tiền từng xu!",
    likes: 34,
    dislikes: 0,
    userLiked: false,
    userDisliked: false,
  },
];

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const storageKey = `marketpulse_product_reviews_${productId}`;

  // Reviews state initialized from localStorage
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_REVIEWS.map((r) => ({ ...r, productId }));
  });

  // Sync state to localStorage whenever reviews change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews, storageKey]);

  // Form states
  const [commentText, setCommentText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Modal state
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);

  // Active current user info
  const currentUserName =
    isAuthenticated && user?.full_name
      ? user.full_name
      : guestName.trim() || "Khách hàng";
  const currentUserAvatar =
    isAuthenticated && user?.avatar_url
      ? user.avatar_url
      : undefined;

  // Handle Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      timeAgo: "Vừa xong",
      badge: isAuthenticated ? "✓ Đã mua hàng" : undefined,
      rating: selectedRating,
      content: commentText.trim(),
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setCommentText("");
    setSelectedRating(5);
    setIsSubmitting(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Like handler
  const handleLike = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const currentlyLiked = !!r.userLiked;
        const currentlyDisliked = !!r.userDisliked;

        return {
          ...r,
          userLiked: !currentlyLiked,
          likes: currentlyLiked ? Math.max(0, r.likes - 1) : r.likes + 1,
          userDisliked: false,
          dislikes: currentlyDisliked ? Math.max(0, r.dislikes - 1) : r.dislikes,
        };
      })
    );
  };

  // Dislike handler
  const handleDislike = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const currentlyLiked = !!r.userLiked;
        const currentlyDisliked = !!r.userDisliked;

        return {
          ...r,
          userDisliked: !currentlyDisliked,
          dislikes: currentlyDisliked ? Math.max(0, r.dislikes - 1) : r.dislikes + 1,
          userLiked: false,
          likes: currentlyLiked ? Math.max(0, r.likes - 1) : r.likes,
        };
      })
    );
  };

  // Reply handler
  const handleAddReply = (reviewId: string, replyContent: string, authorName?: string) => {
    const newReply: ProductReviewReply = {
      id: `rep-${Date.now()}`,
      userName: authorName || currentUserName,
      userAvatar: currentUserAvatar,
      timeAgo: "Vừa xong",
      content: replyContent,
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
    };

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          replies: [...(r.replies || []), newReply],
        };
      })
    );
  };

  // Limit to at most 5 latest reviews on the main page
  const latestFiveReviews = reviews.slice(0, 5);

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-2xl">
            rate_review
          </span>
          <h2 className="text-base sm:text-lg font-bold text-on-surface">
            Đánh giá sản phẩm
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {reviews.length}
          </span>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="font-bold text-amber-500 flex items-center gap-0.5">
              {(
                reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
              ).toFixed(1)}
              <span
                className="material-symbols-outlined text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </span>
            <span>• Dựa trên {reviews.length} nhận xét</span>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400/50 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-emerald-950 dark:text-emerald-50 font-semibold text-xs sm:text-sm leading-snug">
              Đánh giá của bạn đã được đăng thành công! Cảm ơn bạn đã chia sẻ.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Input Box for Creating Review */}
      <form
        onSubmit={handleSubmitReview}
        className="bg-surface-container-low/70 rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs sm:text-sm font-semibold text-on-surface">
            Bạn đánh giá sản phẩm này thế nào?
          </span>

          {/* Interactive Star Picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating ?? selectedRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setSelectedRating(star)}
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  title={`${star} sao`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] transition-colors ${
                      active ? "text-amber-400" : "text-outline-variant"
                    }`}
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              );
            })}
            <span className="text-xs font-semibold text-on-surface-variant ml-1">
              {selectedRating === 5
                ? "Tuyệt vời"
                : selectedRating === 4
                ? "Rất tốt"
                : selectedRating === 3
                ? "Bình thường"
                : selectedRating === 2
                ? "Kém"
                : "Rất kém"}
            </span>
          </div>
        </div>

        {/* Guest Name Input (if not authenticated) */}
        {!isAuthenticated && (
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nhập họ và tên của bạn..."
            className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-xs sm:text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
          />
        )}

        {/* Review Textarea */}
        <div className="relative">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Chia sẻ trải nghiệm hoặc cảm nhận của bạn về sản phẩm này... (chất lượng, độ bền, trải nghiệm sử dụng)"
            className="w-full bg-surface-container-lowest p-3 rounded-lg text-xs sm:text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline resize-y"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-on-surface-variant">
            Đánh giá của bạn sẽ được hiển thị công khai ngay lập tức.
          </span>
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Gửi đánh giá</span>
          </button>
        </div>
      </form>

      {/* Reviews List Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-sm font-bold text-on-surface">
          Đánh giá từ người mua ({reviews.length})
        </h3>
        {reviews.length > 5 && (
          <span className="text-xs text-on-surface-variant">
            Hiển thị 5 đánh giá mới nhất
          </span>
        )}
      </div>

      {/* Latest 5 Reviews List */}
      <div className="divide-y divide-outline-variant/15">
        {latestFiveReviews.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl text-outline mb-1">
              chat_bubble_outline
            </span>
            <p className="text-xs sm:text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          latestFiveReviews.map((review) => (
            <ProductReviewItem
              key={review.id}
              review={review}
              onLike={handleLike}
              onDislike={handleDislike}
              onAddReply={handleAddReply}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
            />
          ))
        )}
      </div>

      {/* "Xem tất cả đánh giá" Button */}
      {reviews.length > 0 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setIsAllReviewsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-primary/30 hover:bg-primary/5 text-primary font-bold text-xs sm:text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>Xem tất cả đánh giá ({reviews.length})</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>
      )}

      {/* All Reviews Popup Modal */}
      <ProductAllReviewsModal
        isOpen={isAllReviewsModalOpen}
        onClose={() => setIsAllReviewsModalOpen(false)}
        productName={productName}
        reviews={reviews}
        onLike={handleLike}
        onDislike={handleDislike}
        onAddReply={handleAddReply}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />
    </section>
  );
};

export default ProductReviewsSection;
