import React, { useState } from "react";
import type { AdminShopItem, ShopTier } from "../../../types/ecommerce";

interface LockModalProps {
  isOpen: boolean;
  shop: AdminShopItem | null;
  onClose: () => void;
  onConfirm: (shopId: number, reason: string) => void;
}

export const LockShopModal: React.FC<LockModalProps> = ({
  isOpen,
  shop,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("Policy violations (Tỷ lệ khiếu nại vượt ngưỡng an toàn)");

  const [prevShopId, setPrevShopId] = useState<number | null>(null);
  if (shop && shop.id !== prevShopId) {
    setPrevShopId(shop.id);
    setReason("Policy violations (Tỷ lệ khiếu nại & tranh chấp đơn hàng vượt ngưỡng)");
  }

  if (!isOpen || !shop) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Khóa Gian Hàng Đối Tác
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {shop.name} ({shop.code})
            </p>
          </div>
        </div>

        <p className="text-body-md text-on-surface-variant">
          Khi bị khóa, gian hàng sẽ ngay lập tức bị ẩn khỏi sàn, các sản phẩm bị đóng băng và số dư
          escrow bị tạm giữ để xử lý khiếu nại của khách hàng.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md font-semibold text-on-surface">
            Lý do xử phạt / đình chỉ:
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-error"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(shop.id, reason)}
            disabled={!reason.trim()}
            className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md text-label-md shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            Xác Nhận Khóa Gian Hàng
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditCommissionModalProps {
  isOpen: boolean;
  shop: AdminShopItem | null;
  onClose: () => void;
  onConfirm: (shopId: number, tier: ShopTier, rate: number) => void;
}

export const EditCommissionModal: React.FC<EditCommissionModalProps> = ({
  isOpen,
  shop,
  onClose,
  onConfirm,
}) => {
  const [tier, setTier] = useState<ShopTier>("STANDARD");
  const [rate, setRate] = useState<number>(5);

  const [prevShopId, setPrevShopId] = useState<number | null>(null);
  if (shop && shop.id !== prevShopId) {
    setPrevShopId(shop.id);
    setTier(shop.tier || "STANDARD");
    setRate(shop.commission_rate || 5);
  }

  if (!isOpen || !shop) return null;

  const handleTierSelect = (selected: ShopTier) => {
    setTier(selected);
    setRate(selected === "MALL" ? 12 : selected === "PREMIUM" ? 8 : 5);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">percent</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Cập Nhật Phí Hoa Hồng Sàn
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {shop.name} ({shop.code})
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-label-md font-semibold text-on-surface">
            Chọn phân hạng đối tác (Merchant Tier):
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { t: "STANDARD", label: "Standard", defaultRate: 5 },
                { t: "PREMIUM", label: "Premium", defaultRate: 8 },
                { t: "MALL", label: "Mall", defaultRate: 12 },
              ] as const
            ).map((item) => (
              <button
                key={item.t}
                type="button"
                onClick={() => handleTierSelect(item.t)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  tier === item.t
                    ? "border-primary bg-primary-fixed/40 ring-2 ring-primary/30"
                    : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                }`}
              >
                <span className="font-bold text-[13px]">{item.label}</span>
                <span className="text-primary font-bold text-[16px]">{item.defaultRate}%</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-label-md font-semibold text-on-surface">
              Tỷ lệ chiết khấu giao dịch (%):
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(shop.id, tier, rate)}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:opacity-90 cursor-pointer"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
