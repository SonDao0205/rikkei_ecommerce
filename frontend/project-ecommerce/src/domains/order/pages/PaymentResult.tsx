import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import { apiErrorMessage, cartApi } from "@/domains/customer/api/cartApi";
import { formatCurrencyVND } from "@/shared/utils/currency";

type PaymentState = Awaited<ReturnType<typeof cartApi.getPaymentStatus>>;

export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = Number(params.get("orderId"));
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!Number.isSafeInteger(orderId) || orderId < 1) return;
    let active = true;
    const refresh = async () => {
      try {
        const result = await cartApi.getPaymentStatus(orderId);
        if (active) {
          setPayment(result);
          setLoadError("");
        }
      } catch {
        if (active) setLoadError("Chưa thể kiểm tra trạng thái thanh toán. Hãy thử tải lại trang.");
      }
    };
    void refresh();
    const timer = window.setInterval(() => { if (active) void refresh(); }, 4000);
    return () => { active = false; window.clearInterval(timer); };
  }, [orderId]);

  const openPayment = async () => {
    if (!payment || payment.status !== "PENDING" || isOpening) return;
    setIsOpening(true);
    setActionError("");
    try {
      const result = await cartApi.createPaymentLink(orderId);
      if (!result.checkout_url) {
        setActionError("PayOS chưa trả về liên kết thanh toán. Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ; không cần tạo đơn hàng mới.");
        return;
      }
      window.location.assign(result.checkout_url);
    } catch (error: unknown) {
      setActionError(apiErrorMessage(error, "Chưa tạo/mở được liên kết PayOS. Đơn hàng vẫn được lưu và chưa được xác nhận đã thanh toán. Hãy thử lại sau ít phút; không tạo đơn hàng mới."));
    } finally {
      setIsOpening(false);
    }
  };

  const hasPayOSLink = Boolean(payment?.checkout_url);

  return <CustomerLayout cartItemCount={0} cartTotal={formatCurrencyVND(0)}>
    <main className="mx-auto my-16 max-w-xl rounded-2xl bg-white p-8 text-center shadow">
      <h1 className="text-2xl font-bold">Trạng thái thanh toán</h1>
      {!Number.isSafeInteger(orderId) || orderId < 1 ? <p className="mt-4 text-red-700" role="alert">Thiếu mã đơn hàng hợp lệ.</p> : payment ? <>
        <p className="mt-4">Số tiền: <strong>{formatCurrencyVND(payment.amount)}</strong></p>
        {payment.status === "PAID" ? <p className="mt-2 text-green-700" aria-live="polite">Thanh toán thành công. Đơn hàng đã được xác nhận.</p> : payment.status === "FAILED" ? <p className="mt-2 text-red-700" aria-live="polite">Thanh toán chưa thành công. Trạng thái đơn hàng chưa được xác nhận là đã thanh toán.</p> : <>
          <p className="mt-2" aria-live="polite">Đơn hàng đang chờ thanh toán.</p>
          {hasPayOSLink ? <p className="mt-2 text-sm text-gray-700">Liên kết PayOS đã sẵn sàng. Mở liên kết để xem mã QR, quét bằng ứng dụng ngân hàng và hoàn tất thanh toán. Trang này tự kiểm tra trạng thái mỗi vài giây; bạn không cần đặt lại đơn.</p> : <p className="mt-2 text-sm text-amber-800">Đơn hàng đã được tạo nhưng hiện chưa có liên kết/QR PayOS. Không cần chờ ở trang này: bấm nút bên dưới để thử tạo liên kết. Nếu vẫn lỗi, hãy thử lại sau ít phút hoặc liên hệ hỗ trợ; đừng đặt lại đơn hàng.</p>}
          <button className="mt-5 rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60" onClick={() => void openPayment()} disabled={isOpening}>
            {isOpening ? "Đang kết nối PayOS…" : hasPayOSLink ? "Mở trang thanh toán và quét QR" : "Thử tạo liên kết thanh toán"}
          </button>
        </>}
        <p className="mt-3 text-sm text-gray-600">Trạng thái được xác nhận từ máy chủ qua PayOS; việc quay lại từ ngân hàng tự nó không xác nhận đã thanh toán.</p>
      </> : <p className="mt-4" aria-live="polite">Đang kiểm tra trạng thái thanh toán…</p>}
      {loadError && <p className="mt-4 text-red-700" role="alert">{loadError}</p>}
      {actionError && <p className="mt-4 text-red-700" role="alert">{actionError}</p>}
      <div className="mt-6"><Link className="underline" to="/my-orders">Xem đơn hàng</Link></div>
    </main>
  </CustomerLayout>;
}
