import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/state/store";
import {
  reviewApi,
  type EligibleReviewItem,
  type ReviewRecord,
} from "@/domains/storefront/api/reviewApi";
import { uploadMedia } from "@/shared/api/mediaUpload";

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const { t } = useTranslation("customer");
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const roles =
    user?.roles?.map((role) => role.toUpperCase()) ??
    (user?.role ? [user.role.toUpperCase()] : []);
  const isBuyer = roles.includes("CLIENT");

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [eligible, setEligible] = useState<EligibleReviewItem[]>([]);
  const [orderItemID, setOrderItemID] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const eligibleForProduct = useMemo(
    () => eligible.filter((item) => item.product_id === productId),
    [eligible, productId]
  );

  const loadReviews = async () => {
    setLoading(true);
    try {
      setReviews(await reviewApi.listProduct(productId));
    } catch {
      setError(
        t("product.reviews.load_error", {
          defaultValue: "Chưa tải được đánh giá. Vui lòng thử lại.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    reviewApi
      .listProduct(productId)
      .then((items) => {
        if (active) setReviews(items);
      })
      .catch(() => {
        if (active)
          setError(
            t("product.reviews.load_error", {
              defaultValue: "Chưa tải được đánh giá. Vui lòng thử lại.",
            })
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, t]);

  useEffect(() => {
    if (!isAuthenticated || !isBuyer) return;
    let active = true;
    reviewApi
      .listEligible()
      .then((items) => {
        if (active) setEligible(items);
      })
      .catch(() => {
        if (active) setEligible([]);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, isBuyer, productId]);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = 5 - images.length;
    if (files.length > remaining) {
      setError(
        t("product.reviews.max_images_error", {
          defaultValue: "Mỗi đánh giá được đính kèm tối đa 5 ảnh.",
        })
      );
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const results = await Promise.allSettled(
        Array.from(files).map(
          async (file) => (await uploadMedia(file, "review-image")).url
        )
      );
      const urls = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : []
      );
      setImages((current) => [...current, ...urls].slice(0, 5));
      if (urls.length !== results.length) {
        setError(
          t("product.reviews.partial_upload_error", {
            defaultValue:
              "Một số ảnh chưa tải được. Bạn có thể thử tải lại các ảnh đó.",
          })
        );
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : t("product.reviews.upload_failed", {
              defaultValue: "Tải ảnh đánh giá thất bại.",
            })
      );
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!orderItemID || !content.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await reviewApi.create({
        order_item_id: Number(orderItemID),
        rating,
        content: content.trim(),
        images,
      });
      setContent("");
      setImages([]);
      setOrderItemID("");
      setEligible((items) =>
        items.filter((item) => String(item.order_item_id) !== orderItemID)
      );
      setNotice(
        t("product.reviews.review_posted_notice", {
          defaultValue:
            "Đánh giá đã được đăng. Quản trị viên có thể ẩn nội dung vi phạm quy định.",
        })
      );
      await loadReviews();
    } catch (submitError) {
      const responseMessage =
        typeof submitError === "object" &&
        submitError !== null &&
        "response" in submitError
          ? (
              submitError as {
                response?: { data?: { errors?: { message?: string }[] } };
              }
            ).response?.data?.errors?.[0]?.message
          : undefined;
      setError(
        responseMessage ||
          t("product.reviews.submit_failed", {
            defaultValue:
              "Không gửi được đánh giá. Vui lòng kiểm tra đơn hàng và thử lại.",
          })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const average = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
          <span className="material-symbols-outlined text-primary">rate_review</span>
          <span>{t("product.reviews.product_reviews_title", { defaultValue: "Đánh giá sản phẩm" })}</span>
        </h2>
        <span className="text-sm font-semibold text-amber-500">
          ★ {average} ·{" "}
          {t("product.reviews.review_count", {
            count: reviews.length,
            defaultValue: `${reviews.length} đánh giá`,
          })}
        </span>
      </header>

      {notice && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </p>
      )}

      {isAuthenticated && isBuyer ? (
        eligibleForProduct.length ? (
          <form onSubmit={submit} className="space-y-3 rounded-xl bg-surface-container-low/70 p-4">
            <label className="block text-sm font-semibold">
              {t("product.reviews.completed_order_label", { defaultValue: "Đơn hàng đã hoàn tất" })}
              <select
                required
                value={orderItemID}
                onChange={(event) => setOrderItemID(event.target.value)}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 text-sm"
              >
                <option value="">
                  {t("product.reviews.select_purchase", { defaultValue: "Chọn lượt mua của bạn" })}
                </option>
                {eligibleForProduct.map((item) => (
                  <option key={item.order_item_id} value={item.order_item_id}>
                    {item.order_code} · {item.product_name}
                  </option>
                ))}
              </select>
            </label>

            <div
              className="flex items-center gap-1"
              aria-label={t("product.reviews.star_aria", {
                rating,
                defaultValue: `Đánh giá ${rating} sao`,
              })}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} sao`}
                  className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                    star <= rating ? "text-amber-400" : "text-outline-variant"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              required
              maxLength={3000}
              rows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("product.reviews.comment_placeholder_named", {
                name: productName,
                defaultValue: `Chia sẻ trải nghiệm của bạn về ${productName}`,
              })}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="cursor-pointer text-sm font-semibold text-primary">
                {isUploading
                  ? t("product.reviews.uploading_images", { defaultValue: "Đang tải ảnh…" })
                  : t("product.reviews.add_images", {
                      current: images.length,
                      max: 5,
                      defaultValue: `Thêm ảnh (${images.length}/5)`,
                    })}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  multiple
                  disabled={isUploading || isSubmitting || images.length >= 5}
                  onChange={(event) => {
                    void uploadImages(event.target.files);
                    event.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>

              <button
                type="submit"
                disabled={!orderItemID || !content.trim() || isUploading || isSubmitting}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs hover:bg-primary/90 transition-colors"
              >
                {isSubmitting
                  ? t("product.reviews.sending", { defaultValue: "Đang gửi…" })
                  : t("product.reviews.send_review", { defaultValue: "Gửi đánh giá" })}
              </button>
            </div>

            {images.length > 0 && (
              <div className="flex gap-2">
                {images.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Ảnh đính kèm"
                    className="h-16 w-16 rounded-lg object-cover border border-outline-variant/30 shadow-xs"
                  />
                ))}
              </div>
            )}

            <p className="text-xs text-on-surface-variant">
              {t("product.reviews.notice_terms", {
                defaultValue:
                  "Chỉ đơn đã hoàn tất mới đủ điều kiện. Đánh giá được hiển thị ngay và có thể bị ẩn nếu vi phạm quy định.",
              })}
            </p>
          </form>
        ) : (
          <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            {t("product.reviews.must_buy_first", {
              defaultValue: "Bạn cần mua và nhận sản phẩm này trước khi đánh giá.",
            })}
          </p>
        )
      ) : (
        <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
          {t("product.reviews.login_prompt", {
            defaultValue: "Đăng nhập bằng tài khoản người mua và hoàn tất đơn hàng để gửi đánh giá.",
          })}
        </p>
      )}

      <div className="divide-y divide-outline-variant/20">
        {loading ? (
          <p className="py-6 text-center text-sm text-on-surface-variant">
            {t("product.reviews.loading_reviews", { defaultValue: "Đang tải đánh giá…" })}
          </p>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-on-surface-variant">
            {t("product.reviews.empty_reviews", {
              defaultValue: "Chưa có đánh giá công khai cho sản phẩm này.",
            })}
          </p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="space-y-2 py-4">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-on-surface">{review.customer_name}</strong>
                <time className="text-xs text-on-surface-variant">
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString("vi-VN")
                    : ""}
                </time>
              </div>

              <div className="text-amber-400" aria-label={`${review.rating} sao`}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>

              {review.content && (
                <p className="whitespace-pre-wrap text-sm text-on-surface-variant">
                  {review.content}
                </p>
              )}

              {review.images?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {review.images.map((url) => (
                    <a href={url} target="_blank" rel="noreferrer" key={url}>
                      <img
                        src={url}
                        alt="Ảnh khách hàng gửi"
                        loading="lazy"
                        className="h-20 w-20 rounded-lg object-cover border border-outline-variant/30 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              )}

              {review.shop_reply && (
                <div className="rounded-lg bg-surface-container-low p-3 text-sm">
                  <strong className="text-on-surface font-semibold">
                    {t("product.reviews.shop_reply_title", { defaultValue: "Phản hồi từ shop" })}
                  </strong>
                  <p className="mt-1 whitespace-pre-wrap text-on-surface-variant">
                    {review.shop_reply}
                  </p>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default ProductReviewsSection;
