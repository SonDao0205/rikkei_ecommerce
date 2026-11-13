import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/app/layout/AdminLayout";
import { adminPromotionApi, type AdminBanner, type AdminFlashSale, type AdminReview, type AdminVoucher, type AuditLog } from "@/domains/admin/api/adminPromotionApi";

type Tab = "vouchers" | "banners" | "flash-sales" | "reviews" | "audit";
const localISO = (value: string) => new Date(value).toISOString();
const field = "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm";

const AdminPromotionReview: React.FC = () => {
  const [tab, setTab] = useState<Tab>("vouchers");
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [sales, setSales] = useState<AdminFlashSale[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [reviewStatus, setReviewStatus] = useState<"VISIBLE" | "HIDDEN">("VISIBLE");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setError("");
    try {
      if (tab === "vouchers") setVouchers(await adminPromotionApi.vouchers());
      else if (tab === "banners") setBanners(await adminPromotionApi.banners());
      else if (tab === "flash-sales") setSales(await adminPromotionApi.flashSales());
      else if (tab === "reviews") setReviews(await adminPromotionApi.reviews(reviewStatus));
      else setLogs(await adminPromotionApi.auditLogs());
    } catch { setError("Không tải được dữ liệu. Hãy kiểm tra quyền quản trị và thử lại."); }
  }, [tab, reviewStatus]);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true); setError("");
    try { await action(); await reload(); }
    catch { setError("Thao tác thất bại. Hãy kiểm tra dữ liệu và thử lại."); }
    finally { setBusy(false); }
  };

  const createVoucher = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    void run(() => adminPromotionApi.createVoucher({ code: f.get("code"), title: f.get("title"), description: f.get("description"), discount_type: f.get("discount_type"), discount_value: Number(f.get("discount_value")), max_discount_amount: f.get("max_discount_amount") ? Number(f.get("max_discount_amount")) : null, min_order_value: Number(f.get("min_order_value") || 0), usage_limit: f.get("usage_limit") ? Number(f.get("usage_limit")) : null, usage_per_user: 1, start_at: localISO(String(f.get("start_at"))), end_at: localISO(String(f.get("end_at"))) }));
    event.currentTarget.reset();
  };
  const createBanner = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    void run(() => adminPromotionApi.createBanner({ title: f.get("title"), image_url: f.get("image_url"), target_url: f.get("target_url"), position: f.get("position"), start_at: localISO(String(f.get("start_at"))), end_at: localISO(String(f.get("end_at"))), sort_order: Number(f.get("sort_order") || 0) }));
    event.currentTarget.reset();
  };
  const createSale = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    void run(() => adminPromotionApi.createFlashSale({ product_id: Number(f.get("product_id")), sale_price: Number(f.get("sale_price")), quantity_limit: Number(f.get("quantity_limit")), start_at: localISO(String(f.get("start_at"))), end_at: localISO(String(f.get("end_at"))) }));
    event.currentTarget.reset();
  };

  const tabs: Array<[Tab, string]> = [["vouchers", "Voucher sàn"], ["banners", "Banner"], ["flash-sales", "Flash sale"], ["reviews", "Kiểm duyệt đánh giá"], ["audit", "Audit log"]];
  return <AdminLayout><div className="space-y-5 py-6">
    <div><h1 className="text-2xl font-bold">Khuyến mãi và đánh giá</h1><p className="mt-1 text-sm text-on-surface-variant">Quản lý chiến dịch sàn, kiểm duyệt nội dung và truy vết thao tác.</p></div>
    <nav className="flex flex-wrap gap-2">{tabs.map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"}`}>{label}</button>)}</nav>
    {error && <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}

    {tab === "vouchers" && <>
      <form onSubmit={createVoucher} className="grid gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 md:grid-cols-4">
        <input name="code" required minLength={4} maxLength={50} pattern="[A-Za-z0-9_-]+" placeholder="Mã voucher" className={field} />
        <input name="title" required minLength={2} maxLength={200} placeholder="Tên chương trình" className={field} />
        <select name="discount_type" className={field}><option value="FIXED">Giảm số tiền</option><option value="PERCENT">Giảm phần trăm</option></select>
        <input name="discount_value" type="number" required min="0.01" step="0.01" placeholder="Mức giảm" className={field} />
        <input name="max_discount_amount" type="number" min="0.01" step="0.01" placeholder="Giảm tối đa (tùy chọn)" className={field} />
        <input name="min_order_value" type="number" min="0" step="0.01" placeholder="Đơn tối thiểu" className={field} />
        <input name="usage_limit" type="number" min="1" placeholder="Lượt dùng tối đa" className={field} />
        <input name="description" maxLength={500} placeholder="Mô tả" className={field} />
        <label className="text-xs">Bắt đầu<input name="start_at" type="datetime-local" required className={field} /></label><label className="text-xs">Kết thúc<input name="end_at" type="datetime-local" required className={field} /></label>
        <button disabled={busy} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary disabled:opacity-50">Tạo voucher sàn</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Mã</th><th>Tên</th><th>Mức giảm</th><th>Đã dùng</th><th>Thời hạn</th><th>Trạng thái</th><th /></tr></thead><tbody>{vouchers.filter((v) => v.scope === "PLATFORM").map((v) => <tr key={v.id} className="border-b border-outline-variant/20"><td className="p-3 font-mono">{v.code}</td><td>{v.title}</td><td>{v.discount_type === "PERCENT" ? `${v.discount_value}%` : `${v.discount_value.toLocaleString("vi-VN")} ₫`}</td><td>{v.used_count}{v.usage_limit ? ` / ${v.usage_limit}` : ""}</td><td>{new Date(v.end_at).toLocaleString("vi-VN")}</td><td>{v.is_active ? "Đang bật" : "Đã tắt"}</td><td><button disabled={busy} onClick={() => void run(() => adminPromotionApi.voucherStatus(v.id, !v.is_active))} className="text-primary">{v.is_active ? "Tắt" : "Bật"}</button></td></tr>)}</tbody></table></div>
    </>}

    {tab === "banners" && <>
      <form onSubmit={createBanner} className="grid gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 md:grid-cols-3">
        <input name="title" required minLength={2} maxLength={160} placeholder="Tiêu đề banner" className={field} /><input name="image_url" type="url" required placeholder="URL ảnh HTTPS" className={field} /><input name="target_url" type="url" placeholder="URL đích (tùy chọn)" className={field} />
        <select name="position" className={field}><option value="HOME_HERO">Trang chủ hero</option><option value="HOME_MIDDLE">Trang chủ giữa trang</option><option value="SHOP">Trang shop</option></select><input name="sort_order" type="number" min="0" max="10000" defaultValue="0" className={field} />
        <label className="text-xs">Bắt đầu<input name="start_at" type="datetime-local" required className={field} /></label><label className="text-xs">Kết thúc<input name="end_at" type="datetime-local" required className={field} /></label><button disabled={busy} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">Tạo banner</button>
      </form>
      <div className="space-y-3">{banners.map((banner: AdminBanner) => <article key={banner.id} className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-3"><img src={banner.image_url} alt="" className="h-16 w-28 rounded-lg object-cover"/><div className="min-w-0 flex-1"><strong>{banner.title}</strong><p className="text-xs text-on-surface-variant">{banner.position} · {new Date(banner.start_at).toLocaleString("vi-VN")}–{new Date(banner.end_at).toLocaleString("vi-VN")}</p></div><button onClick={() => void run(() => adminPromotionApi.bannerStatus(banner.id, !banner.is_active))} className="text-primary">{banner.is_active ? "Tắt" : "Bật"}</button></article>)}</div>
    </>}

    {tab === "flash-sales" && <>
      <form onSubmit={createSale} className="grid gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 md:grid-cols-3"><input name="product_id" type="number" required min="1" placeholder="Product ID" className={field}/><input name="sale_price" type="number" required min="0.01" step="0.01" placeholder="Giá sale" className={field}/><input name="quantity_limit" type="number" required min="1" placeholder="Số lượng ưu đãi" className={field}/><label className="text-xs">Bắt đầu<input name="start_at" type="datetime-local" required className={field}/></label><label className="text-xs">Kết thúc<input name="end_at" type="datetime-local" required className={field}/></label><button disabled={busy} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">Tạo flash sale</button></form>
      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Sản phẩm</th><th>Giá sale</th><th>Đã bán / giới hạn</th><th>Thời gian</th><th>Trạng thái</th><th/></tr></thead><tbody>{sales.map((sale: AdminFlashSale) => <tr key={sale.id} className="border-b border-outline-variant/20"><td className="p-3">#{sale.product_id}</td><td>{sale.sale_price.toLocaleString("vi-VN")} ₫</td><td>{sale.quantity_sold} / {sale.quantity_limit}</td><td>{new Date(sale.start_at).toLocaleString("vi-VN")} – {new Date(sale.end_at).toLocaleString("vi-VN")}</td><td>{sale.is_active ? "Đang bật" : "Đã tắt"}</td><td><button onClick={() => void run(() => adminPromotionApi.flashSaleStatus(sale.id, !sale.is_active))} className="text-primary">{sale.is_active ? "Tắt" : "Bật"}</button></td></tr>)}</tbody></table></div>
    </>}

    {tab === "reviews" && <>
      <div className="flex flex-wrap items-center gap-3"><select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as "VISIBLE" | "HIDDEN")} className={field}><option value="VISIBLE">Đang hiển thị</option><option value="HIDDEN">Đã ẩn</option></select><input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Lý do kiểm duyệt (bắt buộc khi ẩn)" className={`${field} max-w-xl`}/></div>
      <div className="space-y-3">{reviews.map((review: AdminReview) => <article key={review.id} className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"><div className="flex justify-between gap-3"><strong>{review.customer_name} · Sản phẩm #{review.product_id}</strong><span className="text-amber-500">{"★".repeat(review.rating)}</span></div><p className="my-2 whitespace-pre-wrap text-sm">{review.content || "Đánh giá không kèm nội dung"}</p><div className="flex justify-between text-xs text-on-surface-variant"><time>{new Date(review.created_at).toLocaleString("vi-VN")}</time><button disabled={busy || (review.status === "VISIBLE" && !reason.trim())} onClick={() => void run(() => adminPromotionApi.moderateReview(review.id, review.status === "VISIBLE" ? "HIDDEN" : "VISIBLE", review.status === "VISIBLE" ? reason.trim() : "Khôi phục sau kiểm duyệt"))} className="font-semibold text-primary">{review.status === "VISIBLE" ? "Ẩn đánh giá" : "Khôi phục"}</button></div></article>)}</div>
    </>}

    {tab === "audit" && <div className="overflow-x-auto rounded-xl bg-surface-container-lowest"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết mới</th><th>Request ID</th></tr></thead><tbody>{logs.map((log: AuditLog) => <tr key={log.id} className="border-b border-outline-variant/20 align-top"><td className="p-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString("vi-VN")}</td><td>{log.user_id ?? "System"}</td><td>{log.action}</td><td>{log.entity_type} #{log.entity_id}</td><td className="max-w-sm break-all">{log.new_value}</td><td>{log.request_id}</td></tr>)}</tbody></table></div>}
  </div></AdminLayout>;
};

export default AdminPromotionReview;
