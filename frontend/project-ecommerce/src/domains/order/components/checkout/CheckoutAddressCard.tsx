import React, { useState } from "react";
import type { CheckoutAddress } from "@/domains/customer/api/cartApi";

interface CheckoutAddressCardProps {
  addresses: CheckoutAddress[];
  selectedAddressId: number;
  onSelectAddress: (addressId: number) => void;
  isLoading?: boolean;
}

export const CheckoutAddressCard: React.FC<CheckoutAddressCardProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  isLoading = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempAddressId, setTempAddressId] = useState<number>(selectedAddressId);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleOpenModal = () => {
    setTempAddressId(selectedAddress?.id ?? selectedAddressId);
    setIsModalOpen(true);
  };

  const handleConfirmSelect = () => {
    if (tempAddressId) {
      onSelectAddress(tempAddressId);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
            <span className="font-label-md text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wide">
              Địa chỉ nhận hàng (Delivery Address)
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            disabled={isLoading || addresses.length === 0}
            className="font-label-sm text-xs text-primary hover:underline font-bold cursor-pointer disabled:opacity-50"
          >
            {addresses.length > 1 ? "Thay đổi" : "Quản lý địa chỉ"}
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs sm:text-sm border border-amber-200 flex items-center justify-between">
            <span>Bạn chưa có địa chỉ nhận hàng nào. Vui lòng thêm địa chỉ trong hồ sơ.</span>
            <a
              href="/profile/address"
              className="font-bold underline text-primary hover:text-primary-container shrink-0 ml-2"
            >
              + Thêm địa chỉ
            </a>
          </div>
        ) : selectedAddress ? (
          <div className="pt-1 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-on-surface">
                {selectedAddress.recipient_name}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                ({selectedAddress.phone})
              </span>
              {selectedAddress.is_default && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Mặc định
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {[
                selectedAddress.street_detail,
                selectedAddress.ward,
                selectedAddress.district,
                selectedAddress.province,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        ) : null}
      </div>

      {/* Address Switcher Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h3 className="font-bold text-base sm:text-lg text-on-surface">
                Chọn địa chỉ nhận hàng
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {addresses.map((addr) => {
                const isSelected = addr.id === tempAddressId;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setTempAddressId(addr.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-primary/5 border-primary ring-1 ring-primary"
                        : "bg-surface-container-low/50 border-outline-variant/60 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected_address"
                      checked={isSelected}
                      onChange={() => setTempAddressId(addr.id)}
                      className="mt-1 text-primary focus:ring-primary cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-on-surface">
                          {addr.recipient_name}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {addr.phone}
                        </span>
                        {addr.is_default && (
                          <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                            Mặc định
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                        {[addr.street_detail, addr.ward, addr.district, addr.province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/40">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold text-xs sm:text-sm hover:bg-surface-container transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSelect}
                disabled={!tempAddressId}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary-container transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutAddressCard;

