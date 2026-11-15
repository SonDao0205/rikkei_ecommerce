export interface ProductReviewReply {
  id: string;
  userName: string;
  userAvatar?: string;
  timeAgo: string;
  badge?: string;
  content: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

export interface ProductReview {
  id: string;
  productId: number;
  userName: string;
  userAvatar?: string;
  timeAgo: string;
  badge?: string; // e.g. "💎 Fan cứng", "✓ Đã mua hàng"
  rating: number; // 1 to 5
  content: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  replies?: ProductReviewReply[];
  createdAt?: string;
}

