import React from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  openEditForm,
  deleteAddressThunk,
  setDefaultAddressThunk,
} from "../../../redux/slices/user/addressSlice";
import type { Address } from "../../../types/ecommerce";

interface AddressListProps {
  onAddNewClick: () => void;
}

export const AddressList: React.FC<AddressListProps> = ({ onAddNewClick }) => {
  const dispatch = useAppDispatch();
  const { addresses, loading } = useAppSelector((state) => state.address);

  const handleDelete = (addr: Address) => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa địa chỉ của "${addr.recipient_name}" (${addr.street_detail}) không?`
    );
    if (isConfirmed) {
      dispatch(deleteAddressThunk(addr.id));
    }
  };

  const handleSetDefault = (id: number) => {
    dispatch(setDefaultAddressThunk(id));
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 animate-pulse space-y-3"
          >
            <div className="h-5 bg-surface-container-low rounded w-1/3" />
            <div className="h-4 bg-surface-container-low rounded w-2/3" />
            <div className="h-4 bg-surface-container-low rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-8 sm:p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-surface-container text-outline mx-auto flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">location_off</span>
        </div>
        <h3 className="text-on-surface font-headline-md text-headline-md font-bold mb-2">
          Chưa có địa chỉ giao hàng
        </h3>
        <p className="text-on-surface-variant font-body-md text-body-md max-w-md mx-auto mb-6">
          Thêm địa chỉ giao hàng để trải nghiệm mua sắm và thanh toán 1-chạm thuận tiện nhất trên MarketPulse.
        </p>
        <button
          type="button"
          onClick={onAddNewClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
          <span>Thêm địa chỉ đầu tiên</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => {
        const isDefault = Boolean(addr.is_default);
        const fullLocation = [addr.street_detail, addr.ward, addr.district, addr.province]
          .filter(Boolean)
          .join(", ");

        const typeLabel =
          addr.address_type === "HOME"
            ? "Nhà riêng"
            : addr.address_type === "OFFICE"
            ? "Văn phòng / Công ty"
            : "Khác";

        const typeIcon =
          addr.address_type === "OFFICE"
            ? "business"
            : addr.address_type === "HOME"
            ? "home"
            : "pin_drop";

        return (
          <div
            key={addr.id}
            className={`p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border transition-all duration-200 relative ${
              isDefault
                ? "border-primary/60 shadow-md ring-1 ring-primary/20"
                : "border-outline-variant/40 shadow-sm hover:shadow-md hover:border-outline-variant"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Address Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-bold text-on-surface text-base sm:text-lg">
                    {addr.recipient_name}
                  </span>
                  <span className="text-outline text-xs">•</span>
                  <span className="text-on-surface-variant font-medium text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-outline">call</span>
                    {addr.phone.startsWith("+84") ? addr.phone : `+84 ${addr.phone.replace(/^0/, "")}`}
                  </span>

                  {/* Badges */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">{typeIcon}</span>
                    <span>{typeLabel}</span>
                  </span>

                  {isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-fixed text-primary">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Mặc định</span>
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">
                    location_on
                  </span>
                  <p className="text-on-surface text-body-md text-body-md leading-relaxed break-words">
                    {fullLocation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end sm:self-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => dispatch(openEditForm(addr))}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container px-2.5 py-1.5 rounded-lg hover:bg-primary-fixed/30 transition-colors cursor-pointer"
                  title="Chỉnh sửa địa chỉ"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  <span>Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(addr)}
                  className="flex items-center gap-1 text-sm font-semibold text-error hover:text-on-error-container px-2.5 py-1.5 rounded-lg hover:bg-error-container/40 transition-colors cursor-pointer"
                  title="Xóa địa chỉ"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  <span>Xóa</span>
                </button>

                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center gap-1 text-sm font-medium text-outline hover:text-on-surface px-2.5 py-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                    title="Thiết lập làm địa chỉ mặc định"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                    <span className="hidden md:inline">Đặt mặc định</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AddressList;
