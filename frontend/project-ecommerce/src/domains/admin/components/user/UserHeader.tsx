import React from "react";

interface UserHeaderProps {
  totalUsers: number;
  onOpenCreate: () => void;
  onExportCsv: () => void;
  isExporting: boolean;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  totalUsers,
  onOpenCreate,
  onExportCsv,
  isExporting,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Quản lý Người dùng &amp; Tài khoản
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {totalUsers} tài khoản
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Giám sát tài khoản toàn hệ thống, cấp quyền vai trò (Khách hàng, Người bán, Admin) và kiểm soát trạng thái hoạt động.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high/60 font-label-md text-label-md font-medium text-on-surface transition-colors cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExporting ? "hourglass_top" : "download"}
          </span>
          <span>{isExporting ? "Đang xuất..." : "Xuất CSV"}</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Thêm người dùng</span>
        </button>
      </div>
    </div>
  );
};

