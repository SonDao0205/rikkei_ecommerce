import React from "react";

interface OrderSearchBarProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export const OrderSearchBar: React.FC<OrderSearchBarProps> = ({
  totalCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <span
                className="material-symbols-outlined text-[13px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span>ACCOUNT MANAGEMENT • ĐƠN HÀNG CỦA BẠN</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-headline-lg text-on-surface tracking-tight">
              Đơn hàng của tôi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-md text-label-md font-semibold">
              {totalCount} Đơn hàng
            </span>
          </div>

          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Theo dõi, quản lý và kiểm tra tiến độ giao nhận của các đơn hàng đa gian hàng trên toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-xs text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary">
              local_shipping
            </span>
            <span>
              Đơn vị vận chuyển:{" "}
              <strong className="text-on-surface font-semibold">
                GHTK / GHN Express
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* In-page Order Search Bar */}
      <div className="relative flex items-center rounded-xl bg-surface-container-lowest border border-outline-variant/40 px-3.5 py-1 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <span className="material-symbols-outlined text-outline text-[20px] mr-2.5">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm theo Mã đơn hàng, Tên sản phẩm hoặc Tên shop..."
          className="w-full h-10 bg-transparent text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onSearchSubmit();
            }}
            className="p-1 text-outline hover:text-on-surface transition-colors cursor-pointer mr-2"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
        <button
          type="button"
          onClick={onSearchSubmit}
          className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default OrderSearchBar;
