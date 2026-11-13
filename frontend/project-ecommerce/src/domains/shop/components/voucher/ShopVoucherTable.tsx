import React, { useState } from "react";
import type { ShopVoucherItem } from "@/domains/shop/types/shopVoucher.types";

interface ShopVoucherTableProps {
  vouchers: ShopVoucherItem[];
  isLoading: boolean;
  onEdit: (voucher: ShopVoucherItem) => void;
  onToggleStatus: (voucher: ShopVoucherItem) => void;
  onDelete: (voucher: ShopVoucherItem) => void;
  onOpenCreate: () => void;
}

export const ShopVoucherTable: React.FC<ShopVoucherTableProps> = ({
  vouchers,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
  onOpenCreate,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const formatVnd = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const getStatusBadge = (status: ShopVoucherItem["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Đang diễn ra</span>
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-300 shadow-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>Sắp diễn ra</span>
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Đã tạm dừng</span>
          </span>
        );
      case "expired":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            <span>Đã kết thúc</span>
          </span>
        );
    }
  };

  const getTypeBadge = (type: ShopVoucherItem["type"]) => {
    switch (type) {
      case "money":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">payments</span>
            Giảm tiền mặt
          </span>
        );
      case "percent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-purple-600">percent</span>
            Giảm phần trăm
          </span>
        );
      case "shipping":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-sky-600">local_shipping</span>
            Freeship
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-body-sm text-body-sm text-on-surface-variant">Đang tải danh sách voucher...</p>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">confirmation_number</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">
          Không tìm thấy voucher phù hợp
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
          Chưa có mã giảm giá nào thuộc bộ lọc này. Hãy thử chọn tab khác hoặc tạo voucher mới để kích hoạt chương trình khuyến mãi!
        </p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Tạo Voucher Ngay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/60 border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
              <th className="py-3.5 px-4 font-semibold min-w-[210px]">Mã & Tên Voucher</th>
              <th className="py-3.5 px-3 font-semibold min-w-[160px]">Mức giảm & Loại</th>
              <th className="py-3.5 px-3 font-semibold min-w-[140px]">Đơn tối thiểu</th>
              <th className="py-3.5 px-2.5 font-semibold min-w-[140px]">Thời hạn áp dụng</th>
              <th className="py-3.5 px-2.5 font-semibold min-w-[125px]">Đã sử dụng</th>
              <th className="py-3.5 px-4 font-semibold min-w-[160px]">Trạng thái</th>
              <th className="py-3.5 px-4 font-semibold text-right min-w-[130px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
            {vouchers.map((voucher) => {
              const usageCount = voucher.usageCount ?? 0;
              const maxUsage = voucher.maxUsageCount ?? 100;
              const usagePct = voucher.usagePercent ?? Math.min(100, Math.round((usageCount / maxUsage) * 100));

              return (
                <tr
                  key={voucher.id}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  {/* Mã & Tên */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs tracking-wider border border-primary/20">
                          {voucher.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(voucher.code)}
                          title="Sao chép mã"
                          className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedCode === voucher.code ? "done" : "content_copy"}
                          </span>
                        </button>
                        {voucher.badge && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            {voucher.badge}
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-on-surface line-clamp-1" title={voucher.title}>
                        {voucher.title}
                      </div>
                      <p className="text-on-surface-variant font-body-xs text-body-xs line-clamp-1" title={voucher.description}>
                        {voucher.description}
                      </p>
                    </div>
                  </td>

                  {/* Mức giảm & Loại */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-on-surface">
                        {voucher.amountText}
                      </div>
                      <div>{getTypeBadge(voucher.type)}</div>
                    </div>
                  </td>

                  {/* Đơn tối thiểu */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-on-surface">
                        {formatVnd(voucher.minOrderAmount)}
                      </div>
                      {voucher.maxDiscountAmount && voucher.type === "percent" && (
                        <div className="text-on-surface-variant text-xs">
                          Tối đa: {formatVnd(voucher.maxDiscountAmount)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Thời hạn */}
                  <td className="py-4 px-2.5">
                    <div className="space-y-0.5 text-xs text-on-surface-variant">
                      <div className="font-medium text-on-surface whitespace-nowrap">
                        {voucher.expiryText || `Đến: ${voucher.expiryDate}`}
                      </div>
                      {voucher.startDate && (
                        <div className="whitespace-nowrap">Từ: {voucher.startDate}</div>
                      )}
                    </div>
                  </td>

                  {/* Tiến độ sử dụng */}
                  <td className="py-4 px-2.5">
                    <div className="space-y-1.5 w-28">
                      <div className="flex justify-between text-xs whitespace-nowrap">
                        <span className="font-semibold text-on-surface">{usageCount}</span>
                        <span className="text-on-surface-variant">/ {maxUsage} ({usagePct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            usagePct >= 90
                              ? "bg-error"
                              : usagePct >= 70
                              ? "bg-amber-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(100, usagePct)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getStatusBadge(voucher.status)}
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Toggle status (pause/resume) */}
                      {voucher.status !== "expired" && (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(voucher)}
                          title={voucher.status === "paused" ? "Kích hoạt lại voucher" : "Tạm dừng voucher"}
                          className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {voucher.status === "paused" ? "play_arrow" : "pause"}
                          </span>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(voucher)}
                        title="Chỉnh sửa voucher"
                        className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(voucher)}
                        title="Ngừng voucher"
                        className="p-1.5 rounded-lg text-error bg-error/10 hover:bg-error/20 border border-error/20 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

