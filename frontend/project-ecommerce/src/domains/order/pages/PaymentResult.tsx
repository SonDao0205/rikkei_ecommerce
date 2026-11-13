import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import { cartApi } from "@/domains/customer/api/cartApi";
import { formatCurrencyVND } from "@/shared/utils/currency";

type PaymentState = Awaited<ReturnType<typeof cartApi.getPaymentStatus>>;

export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = Number(params.get("orderId"));
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isSafeInteger(orderId) || orderId < 1) { setError("Thiếu mã đơn hàng hợp lệ."); return; }
    let active = true;
    const refresh = async () => {
      try { const result = await cartApi.getPaymentStatus(orderId); if (active) { setPayment(result); setError(""); } }
      catch { if (active) setError("Chưa thể kiểm tra trạng thái thanh toán. Vui lòng thử tải lại."); }
    };
    void refresh();
    const timer = window.setInterval(() => { if (active) void refresh(); }, 4000);
    return () => { active = false; window.clearInterval(timer); };
  }, [orderId]);

  const reopen = async () => {
    try { const result = await cartApi.createPaymentLink(orderId); window.location.assign(result.checkout_url); }
    catch { setError("Không thể mở lại liên kết thanh toán. Trạng thái đơn hàng vẫn được bảo toàn; vui lòng thử lại."); }
  };

  return <CustomerLayout cartItemCount={0} cartTotal={formatCurrencyVND(0)}>
    <main className="mx-auto my-16 max-w-xl rounded-2xl bg-white p-8 text-center shadow">
      <h1 className="text-2xl font-bold">Trạng thái thanh toán</h1>
      {payment ? <>
        <p className="mt-4">Số tiền: <strong>{formatCurrencyVND(payment.amount)}</strong></p>
        <p className="mt-2" aria-live="polite">{payment.status === "PAID" ? "Thanh toán thành công" : payment.status === "FAILED" ? "Thanh toán chưa thành công" : "Đang chờ PayOS xác nhận giao dịch…"}</p>
        {(payment.status === "PENDING" || payment.status === "FAILED") && <button className="mt-5 rounded-lg bg-primary px-5 py-3 font-semibold text-white" onClick={() => void reopen()}>Mở hoặc thử lại thanh toán</button>}
        <p className="mt-3 text-sm text-gray-600">Trang này kiểm tra trạng thái với máy chủ; kết quả chuyển hướng từ ngân hàng không tự xác nhận thanh toán.</p>
      </> : <p className="mt-4">Đang kiểm tra trạng thái…</p>}
      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
      <div className="mt-6"><Link className="underline" to="/my-orders">Xem đơn hàng</Link></div>
    </main>
  </CustomerLayout>;
}
