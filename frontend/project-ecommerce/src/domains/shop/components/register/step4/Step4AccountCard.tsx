import React from "react";
import { Link } from "react-router-dom";
import type { ShopAccountData } from "@/shared/types";

interface Step4AccountCardProps {
  account: ShopAccountData;
}

export const Step4AccountCard: React.FC<Step4AccountCardProps> = ({ account }) => (
  <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-sm">
    <div className="mb-space-md flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
      <h2 className="font-headline-lg font-bold text-on-surface">Tài khoản chủ shop</h2>
      <Link to="/register-open-shop" className="text-primary underline">Xem thông tin tài khoản</Link>
    </div>
    <dl className="grid gap-space-md sm:grid-cols-3">
      <div><dt className="text-sm text-on-surface-variant">Họ tên</dt><dd className="font-semibold">{account.fullName || "—"}</dd></div>
      <div><dt className="text-sm text-on-surface-variant">Email</dt><dd className="font-semibold">{account.email || "—"}</dd></div>
      <div><dt className="text-sm text-on-surface-variant">Điện thoại</dt><dd className="font-semibold">{account.phone || "—"}</dd></div>
    </dl>
    <p className="mt-4 text-sm text-on-surface-variant">
      Đây là tài khoản hiện tại của bạn; hệ thống không tạo tài khoản hoặc mật khẩu seller riêng.
    </p>
  </section>
);

export default Step4AccountCard;
