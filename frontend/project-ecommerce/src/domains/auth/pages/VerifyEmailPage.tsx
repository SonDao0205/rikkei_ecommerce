import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "@/domains/auth/api/authApi";

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const email = (params.get("email") || "").trim().toLowerCase();
  const nextPath = params.get("next");
  const loginHref = nextPath?.startsWith("/") && !nextPath.startsWith("//")
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    try {
      await authApi.verifyEmailOtp(email, otp);
      setVerified(true);
      setMessage("Email đã được xác thực. Bạn có thể đăng nhập bằng tài khoản vừa tạo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xác thực mã. Vui lòng thử lại.");
    } finally { setBusy(false); }
  };

  const handleResend = async () => {
    setError(""); setMessage(""); setBusy(true);
    try {
      await authApi.requestEmailVerification(email);
      setCooldown(60);
      setMessage("Nếu đăng ký đang chờ xác thực, mã mới đã được gửi. Hãy kiểm tra cả thư mục spam.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa gửi được email. Vui lòng thử lại sau.");
    } finally { setBusy(false); }
  };

  if (!email || !email.includes("@")) {
    return <main className="mx-auto mt-24 max-w-md p-6 text-center"><p>Liên kết xác thực không hợp lệ.</p><Link className="mt-4 inline-block text-indigo-700 underline" to="/register">Quay lại đăng ký</Link></main>;
  }

  return (
    <main className="mx-auto mt-20 w-full max-w-md px-5 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"><span className="material-symbols-outlined">mark_email_read</span></div>
        <h1 className="text-2xl font-bold text-slate-900">Xác thực email</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Nhập mã 6 chữ số đã gửi đến <strong className="break-all">{email}</strong>. Mã có hiệu lực trong 10 phút.</p>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {!verified ? <>
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <label htmlFor="email-otp" className="block text-sm font-medium text-slate-700">Mã xác thực</label>
            <input id="email-otp" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" />
            <button disabled={busy || otp.length !== 6} className="w-full rounded-xl bg-indigo-700 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Đang xác thực…" : "Xác thực email"}</button>
          </form>
          <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-500">{cooldown ? `Gửi lại sau ${cooldown}s` : "Chưa nhận được mã?"}</span><button type="button" onClick={() => void handleResend()} disabled={busy || cooldown > 0} className="font-semibold text-indigo-700 disabled:text-slate-400">Gửi lại mã</button></div>
          <p className="mt-4 text-xs text-slate-500">Nếu chạy local chưa cấu hình SMTP, mã xác thực chỉ được ghi trong log backend ở chế độ development.</p>
        </> : <Link to={loginHref} className="mt-6 block w-full rounded-xl bg-indigo-700 py-3 text-center font-semibold text-white">Đến trang đăng nhập</Link>}
      </div>
    </main>
  );
};

export default VerifyEmailPage;
