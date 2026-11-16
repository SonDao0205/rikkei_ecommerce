import React, { useEffect, useMemo, useState } from "react";
import { reviewApi, type EligibleReviewItem } from "@/domains/storefront/api/reviewApi";

interface ReviewProductModalProps {
  orderCode?: string;
  orderItemId?: number;
  productName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

function normalizeOrderCode(value: string): string {
  return value.trim().replace(/^#/, "").toUpperCase();
}

export const ReviewProductModal: React.FC<ReviewProductModalProps> = ({
  orderCode,
  orderItemId,
  productName,
  onClose,
  onSubmitted,
}) => {
  const [eligibleItems, setEligibleItems] = useState<EligibleReviewItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(orderItemId ?? null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    reviewApi.listEligible()
      .then((items) => {
        if (!active) return;
        setEligibleItems(items);
        const scopedItems = orderItemId
          ? items.filter((item) => item.order_item_id === orderItemId)
          : orderCode
            ? items.filter((item) => normalizeOrderCode(item.order_code) === normalizeOrderCode(orderCode))
            : items;
        setSelectedItemId((current) =>
          current && scopedItems.some((item) => item.order_item_id === current)
            ? current
            : scopedItems[0]?.order_item_id ?? null
        );
      })
      .catch(() => {
        if (active) setError("Không thể tải danh sách sản phẩm đủ điều kiện đánh giá.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [orderCode, orderItemId]);

  const scopedItems = useMemo(() => {
    if (orderItemId) return eligibleItems.filter((item) => item.order_item_id === orderItemId);
    if (orderCode) {
      return eligibleItems.filter((item) => normalizeOrderCode(item.order_code) === normalizeOrderCode(orderCode));
    }
    return eligibleItems;
  }, [eligibleItems, orderCode, orderItemId]);
  const selectedItem = scopedItems.find((item) => item.order_item_id === selectedItemId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedItemId || !rating) {
      setError("Vui lòng chọn sản phẩm và số sao đánh giá.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await reviewApi.create({
        order_item_id: selectedItemId,
        rating,
        content: content.trim(),
        images: [],
      });
      onSubmitted?.();
      onClose();
    } catch {
      setError("Gửi đánh giá chưa thành công. Sản phẩm có thể đã được đánh giá trước đó.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = productName || selectedItem?.product_name || "sản phẩm";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="review-modal-title" className="text-xl font-bold text-on-surface">Đánh giá sản phẩm</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Chia sẻ trải nghiệm của bạn về {title}.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-1 text-outline hover:bg-surface-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-on-surface-variant">Đang tải sản phẩm...</p>
        ) : scopedItems.length === 0 ? (
          <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            {error || "Không còn sản phẩm nào trong đơn này đủ điều kiện đánh giá."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {scopedItems.length > 1 && (
              <label className="flex flex-col gap-2 text-sm font-medium text-on-surface">
                Sản phẩm
                <select
                  value={selectedItemId ?? ""}
                  onChange={(event) => setSelectedItemId(Number(event.target.value))}
                  className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5"
                >
                  {scopedItems.map((item) => (
                    <option key={item.order_item_id} value={item.order_item_id}>{item.product_name}</option>
                  ))}
                </select>
              </label>
            )}
            <div>
              <p className="mb-2 text-sm font-medium text-on-surface">Mức độ hài lòng</p>
              <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoveredRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} sao`}
                      aria-pressed={rating === star}
                      onMouseEnter={() => setHoveredRating(star)}
                      onFocus={() => setHoveredRating(star)}
                      onBlur={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="rounded-md p-1 text-4xl leading-none transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className={`material-symbols-outlined ${active ? "text-amber-500" : "text-outline-variant"}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    </button>
                  );
                })}
                <span className="ml-2 text-sm text-on-surface-variant">{rating ? `${rating}/5` : "Chọn số sao"}</span>
              </div>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-on-surface">
              Nội dung đánh giá
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={3000}
                rows={5}
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                className="resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-right text-xs font-normal text-outline">{content.length}/3000</span>
            </label>
            {error && <p role="alert" className="text-sm text-error">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-4">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container">Hủy</button>
              <button type="submit" disabled={submitting || !rating || !selectedItem} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-on-primary hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ReviewProductModal;
