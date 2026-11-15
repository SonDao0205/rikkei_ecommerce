import React, { useState } from "react";
import type { AdminUserItem } from "@/domains/admin/types/adminUser.types";

interface UserLockModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => Promise<void>;
  isLoading: boolean;
}

const PRESET_REASONS = [
  "Nghi vấn gian lận đặt đơn ảo",
  "Bùng hàng COD nhiều lần",
  "Đăng tải sản phẩm cấm / hàng giả",
  "Spam đánh giá tiêu cực / tống tiền",
  "Vi phạm điều khoản dịch vụ",
];

export const UserLockModal: React.FC<UserLockModalProps> = ({
  user,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do khoá tài khoản");
      return;
    }
    await onConfirm(user.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 border border-outline-variant/30 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
          <span className="material-symbols-outlined text-[26px]">lock</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Khoá tài khoản người dùng
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Bạn đang chuẩn bị khoá tài khoản của{" "}
            <strong className="text-on-surface font-semibold">{user.fullName}</strong> ({user.email}). Tài khoản này sẽ không thể đăng nhập hoặc thực hiện bất kỳ giao dịch nào.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {/* Quick Reasons */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Lý do nhanh:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setReason(r);
                    setError("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    reason === r
                      ? "bg-rose-50 text-rose-700 border-rose-300 font-semibold"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Chi tiết lý do khoá <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Nhập lý do chi tiết để thông báo cho người dùng và lưu vết audit log..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-3 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-rose-500 resize-none"
            />
            {error && <p className="text-error text-xs mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl font-label-md text-label-md transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-label-md text-label-md font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang khoá...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Xác nhận khoá</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

