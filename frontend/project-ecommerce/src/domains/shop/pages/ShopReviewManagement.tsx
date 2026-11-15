import React, { useCallback, useEffect, useState } from "react";
import ShopLayout from "@/app/layout/ShopLayout";
import axiosClient from "@/shared/api/axiosClient";

interface SellerReview { id: number; product_id: number; customer_name: string; rating: number; content: string | null; status: string; shop_reply: string | null; created_at: string }
interface Envelope<T> { success: boolean; data: T }

const ShopReviewManagement: React.FC = () => {
  const [items, setItems] = useState<SellerReview[]>([]);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [busyID, setBusyID] = useState<number | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get<Envelope<SellerReview[]>>("/api/v1/seller/reviews");
      setItems((data.data ?? []).filter((item) => item.status === "VISIBLE"));
      setError("");
    } catch { setError("Không tải được đánh giá của shop. Hãy thử tải lại trang."); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const reply = async (id: number) => {
    const text = (replies[id] ?? "").trim();
    if (!text) return;
    setBusyID(id); setError("");
    try {
      await axiosClient.post(`/api/v1/seller/reviews/${id}/reply`, { reply: text });
      setItems((current) => current.map((item) => item.id === id ? { ...item, shop_reply: text } : item));
      setReplies((current) => ({ ...current, [id]: "" }));
    } catch { setError("Phản hồi chưa được lưu. Vui lòng thử lại."); }
    finally { setBusyID(null); }
  };
  return <ShopLayout><main className="space-y-5 py-6"><header><h1 className="text-2xl font-bold">Đánh giá của khách hàng</h1><p className="text-sm text-on-surface-variant">Phản hồi lịch sự, tập trung vào trải nghiệm và xử lý vấn đề của khách.</p></header>{error && <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}{items.length === 0 ? <p className="rounded-xl bg-surface-container-lowest p-6 text-center text-sm text-on-surface-variant">Chưa có đánh giá công khai cho shop.</p> : items.map((item) => <article key={item.id} className="space-y-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"><div className="flex justify-between"><strong>{item.customer_name} · Sản phẩm #{item.product_id}</strong><span className="text-amber-500">{"★".repeat(item.rating)}</span></div><p className="whitespace-pre-wrap text-sm">{item.content || "Đánh giá không kèm nội dung"}</p>{item.shop_reply ? <div className="rounded-lg bg-surface-container-low p-3"><strong className="text-sm">Phản hồi của shop</strong><p className="mt-1 whitespace-pre-wrap text-sm">{item.shop_reply}</p></div> : <div className="flex flex-col gap-2 sm:flex-row"><textarea maxLength={2000} rows={2} value={replies[item.id] ?? ""} onChange={(event) => setReplies((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Viết phản hồi (tối đa 2000 ký tự)" className="min-w-0 flex-1 rounded-lg border border-outline-variant p-3 text-sm"/><button disabled={busyID === item.id || !(replies[item.id] ?? "").trim()} onClick={() => void reply(item.id)} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary disabled:opacity-50">{busyID === item.id ? "Đang gửi…" : "Gửi phản hồi"}</button></div>}</article>)}</main></ShopLayout>;
};
export default ShopReviewManagement;
