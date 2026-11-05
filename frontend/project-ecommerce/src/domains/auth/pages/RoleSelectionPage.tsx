import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/state/store";

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const roles = new Set(user?.roles ?? (user?.role ? [user.role] : []));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Chọn không gian làm việc</h1>
        <p className="mt-2 text-slate-600">Tài khoản của bạn có nhiều vai trò. Hãy chọn nơi muốn tiếp tục.</p>
        <div className="mt-6 grid gap-3">
          {roles.has("client") && <button className="rounded-xl border p-4 text-left hover:border-indigo-500" onClick={() => navigate("/home", { replace: true })}>
            <strong className="block">Mua sắm</strong><span className="text-sm text-slate-500">Duyệt sản phẩm, đặt hàng và quản lý tài khoản.</span>
          </button>}
          {roles.has("seller") && <button className="rounded-xl border p-4 text-left hover:border-indigo-500" onClick={() => navigate(user?.shop_status === "ACTIVE" ? "/shop/dashboard" : "/register-open-shop", { replace: true })}>
            <strong className="block">Kênh người bán</strong><span className="text-sm text-slate-500">Quản lý gian hàng và sản phẩm.</span>
          </button>}
          {roles.has("admin") && <button className="rounded-xl border p-4 text-left hover:border-indigo-500" onClick={() => navigate("/admin/dashboard", { replace: true })}>
            <strong className="block">Quản trị hệ thống</strong><span className="text-sm text-slate-500">Quản lý hoạt động sàn thương mại.</span>
          </button>}
        </div>
        {user?.shop_status && user.shop_status !== "ACTIVE" && <p className="mt-5 text-sm text-amber-700">Hồ sơ shop của bạn đang ở trạng thái {user.shop_status}. Quyền quản lý shop chỉ hoạt động sau khi được duyệt.</p>}
      </section>
    </main>
  );
};

export default RoleSelectionPage;
