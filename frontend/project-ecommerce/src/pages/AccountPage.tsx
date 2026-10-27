import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, type AuthUser } from "../api/authApi";

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; authApi.restoreSession().then(value => { if (active) setUser(value); }).catch(() => { if (active) navigate("/login", { replace: true }); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [navigate]);
  const logout = async () => { try { await authApi.logout(); } finally { navigate("/login", { replace: true }); } };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!/(?=.*[A-Za-z])(?=.*\d).{10,72}/.test(password)) { setError("Use 10–72 characters with at least one letter and one number."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      await authApi.changePassword({
        currentPassword: current,
        newPassword: password,
        confirmPassword: confirm,
      });
      setCurrent("");
      setPassword("");
      setConfirm("");
      setNotice("Đổi mật khẩu thành công, bạn có thể đăng nhập lại bằng mật khẩu mới");
    }
    catch (e) { setError(e instanceof Error ? e.message : "Password update failed."); }
    finally { setBusy(false); }
  };
  if (loading) return <main className="mx-auto max-w-xl p-8">Loading account…</main>;
  if (!user) return null;
  return (
    <main className="mx-auto my-12 max-w-xl space-y-6 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account security</h1>
          <p className="text-sm text-slate-600">{user.full_name} · {user.email}</p>
        </div>
        <button onClick={() => void logout()} className="text-sm font-semibold text-indigo-700">Sign out</button>
      </header>
      <section className="rounded-lg bg-slate-50 p-4 text-sm">
        <p>Phone: {user.phone || "Not set"}</p>
        <p>Role: {user.role}</p>
        <p>Email verified: {user.email_verified ? "Yes" : "No"}</p>
      </section>
      <form onSubmit={changePassword} className="space-y-4">
        <h2 className="text-lg font-semibold">Change password</h2>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {notice && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="ml-3 shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Đăng nhập lại
            </button>
          </div>
        )}
        <label className="block text-sm">Current password<input required type="password" autoComplete="current-password" className="mt-1 w-full rounded-lg border p-2.5" value={current} onChange={e => setCurrent(e.target.value)} /></label>
        <label className="block text-sm">New password<input required type="password" autoComplete="new-password" className="mt-1 w-full rounded-lg border p-2.5" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label className="block text-sm">Confirm new password<input required type="password" autoComplete="new-password" className="mt-1 w-full rounded-lg border p-2.5" value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
        <button disabled={busy} className="rounded-lg bg-indigo-700 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
      </form>
    </main>
  );
};
export default AccountPage;

