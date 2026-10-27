import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>, next: () => void, success: string) => {
    setBusy(true); setError("");
    try { await action(); setMessage(success); next(); }
    catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  };
  const field = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm";
  return <main className="mx-auto mt-16 max-w-md rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
    <h1 className="mb-2 text-2xl font-bold text-slate-900">Reset your password</h1>
    <p className="mb-5 text-sm text-slate-600">{step === 0 ? "Enter your account email or phone number." : step === 1 ? "Enter the six digit code sent to your account." : "Choose a new password."}</p>
    {message && <p className="mb-4 text-sm text-emerald-700">{message}</p>}
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
    {step === 0 && <form onSubmit={e => { e.preventDefault(); void run(() => authApi.requestPasswordReset(identifier), () => setStep(1), "If the account exists, a reset code has been sent."); }} className="space-y-4"><label className="block text-sm">Email or phone<input required autoComplete="username" className={field} value={identifier} onChange={e => setIdentifier(e.target.value)} /></label><button disabled={busy} className="w-full rounded-lg bg-indigo-700 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? "Sending…" : "Send code"}</button></form>}
    {step === 1 && <form onSubmit={e => { e.preventDefault(); void run(() => authApi.verifyResetOTP(identifier, otp), () => setStep(2), "Code verified."); }} className="space-y-4"><label className="block text-sm">6 digit code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className={field} value={otp} onChange={e => setOtp(e.target.value)} /></label><button disabled={busy} className="w-full rounded-lg bg-indigo-700 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? "Checking…" : "Verify code"}</button></form>}
    {step === 2 && <form onSubmit={e => { e.preventDefault(); if (!/(?=.*[A-Za-z])(?=.*\d).{10,72}/.test(password)) { setError("Use 10–72 characters with at least one letter and one number."); return; } if (password !== confirm) { setError("Passwords do not match."); return; } void run(() => authApi.resetPassword(identifier, otp, password), () => navigate("/login?reset=success", { replace: true }), "Password updated."); }} className="space-y-4"><label className="block text-sm">New password<input required type="password" autoComplete="new-password" className={field} value={password} onChange={e => setPassword(e.target.value)} /></label><label className="block text-sm">Confirm password<input required type="password" autoComplete="new-password" className={field} value={confirm} onChange={e => setConfirm(e.target.value)} /></label><button disabled={busy} className="w-full rounded-lg bg-indigo-700 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button></form>}
    <button onClick={() => navigate("/login")} className="mt-5 text-sm font-semibold text-indigo-700">Back to sign in</button>
  </main>;
};
export default ForgotPasswordPage;
