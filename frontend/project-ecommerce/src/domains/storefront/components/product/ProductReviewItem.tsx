import React, { useState } from "react";
import type { ProductReview } from "@/domains/storefront/types/review.types";

interface ProductReviewItemProps {
  review: ProductReview;
  onLike: (reviewId: string) => void;
  onDislike: (reviewId: string) => void;
  onAddReply: (reviewId: string, content: string, userName?: string) => void;
  currentUserName?: string;
  currentUserAvatar?: string;
}

export const ProductReviewItem: React.FC<ProductReviewItemProps> = ({
  review,
  onLike,
  onDislike,
  onAddReply,
  currentUserName = "Bạn",
  currentUserAvatar,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState(currentUserName !== "Bạn" ? currentUserName : "");

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onAddReply(review.id, replyText.trim(), replyName.trim() || currentUserName);
    setReplyText("");
    setIsReplying(false);
  };

  return (
    <div className="flex gap-3 sm:gap-3.5 py-3.5 border-b border-outline-variant/15 last:border-b-0 text-on-surface">
      {/* User Avatar */}
      <div className="shrink-0">
        {review.userAvatar ? (
          <img
            src={review.userAvatar}
            alt={review.userName}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-outline-variant/30"
          />
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-high text-primary font-bold text-sm sm:text-base flex items-center justify-center ring-1 ring-outline-variant/30">
            {review.userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Main Review Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Name • Time • Badge • Rating Stars */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold text-sm sm:text-base text-on-surface">
            {review.userName}
          </span>

          <span className="text-outline text-xs">•</span>

          <span className="text-xs sm:text-sm text-on-surface-variant font-normal">
            {review.timeAgo}
          </span>

          {review.badge && (
            <>
              <span className="text-outline text-xs">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant/90">
                {review.badge.includes("Fan") ? (
                  <span
                    className="material-symbols-outlined text-[14px] text-amber-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    diamond
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    verified
                  </span>
                )}
                <span>{review.badge.replace("💎", "").replace("✓", "").trim()}</span>
              </span>
            </>
          )}

          {/* Star rating */}
          {review.rating > 0 && (
            <div className="flex items-center gap-0.5 ml-auto sm:ml-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined text-[15px] ${
                    i < review.rating ? "text-amber-400" : "text-outline-variant"
                  }`}
                  style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comment Text Content */}
        <p className="text-sm sm:text-[15px] text-on-surface leading-relaxed mt-1.5 break-words whitespace-pre-line">
          {review.content}
        </p>

        {/* Actions Row: Like, Dislike, Trả lời (No translate / No emoji reactions) */}
        <div className="flex items-center gap-4 mt-2.5 text-xs sm:text-sm">
          {/* Like */}
          <button
            type="button"
            onClick={() => onLike(review.id)}
            className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              review.userLiked
                ? "text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            title="Thích đánh giá này"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: review.userLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              thumb_up
            </span>
            {review.likes > 0 && <span>{review.likes}</span>}
          </button>

          {/* Dislike */}
          <button
            type="button"
            onClick={() => onDislike(review.id)}
            className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              review.userDisliked
                ? "text-error font-bold"
                : "text-on-surface-variant hover:text-error"
            }`}
            title="Không thích"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: review.userDisliked ? "'FILL' 1" : "'FILL' 0" }}
            >
              thumb_down
            </span>
            {review.dislikes > 0 && <span>{review.dislikes}</span>}
          </button>

          {/* Reply */}
          <button
            type="button"
            onClick={() => setIsReplying((prev) => !prev)}
            className="font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Trả lời
          </button>
        </div>

        {/* Inline Reply Form */}
        {isReplying && (
          <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col gap-2.5 animate-in fade-in duration-150">
            {currentUserName === "Bạn" && (
              <input
                type="text"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Tên của bạn..."
                className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-xs font-medium outline-none ring-1 ring-outline-variant/30 focus:ring-1 focus:ring-primary"
              />
            )}
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 mt-0.5">
                {currentUserAvatar ? (
                  <img
                    src={currentUserAvatar}
                    alt={currentUserName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Trả lời @${review.userName}...`}
                className="flex-1 bg-surface-container-lowest p-2 rounded-lg text-xs sm:text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-1 focus:ring-primary resize-y"
              />
            </div>
            <div className="flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyText("");
                }}
                className="px-3 py-1 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-3.5 py-1 rounded-lg text-xs font-bold bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 transition-colors cursor-pointer"
              >
                Gửi
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies List */}
        {review.replies && review.replies.length > 0 && (
          <div className="mt-3.5 space-y-3 pl-3 sm:pl-4 border-l-2 border-outline-variant/30">
            {review.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2.5 items-start text-xs sm:text-sm">
                <div className="shrink-0">
                  {reply.userAvatar ? (
                    <img
                      src={reply.userAvatar}
                      alt={reply.userName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-container-high text-secondary font-bold text-xs flex items-center justify-center">
                      {reply.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-on-surface">{reply.userName}</span>
                    <span className="text-outline text-xs">•</span>
                    <span className="text-on-surface-variant text-xs">{reply.timeAgo}</span>
                  </div>
                  <p className="text-on-surface mt-0.5 leading-relaxed break-words">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewItem;
