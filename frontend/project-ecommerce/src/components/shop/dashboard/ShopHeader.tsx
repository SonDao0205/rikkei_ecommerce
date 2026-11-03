import React from "react";

interface ShopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileSidebar?: () => void;
  userName?: string;
  shopStatusText?: string;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onToggleMobileSidebar,
  userName = "Nguyễn Văn A",
  shopStatusText = "Cửa hàng: Đang mở cửa",
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-space-md lg:px-space-lg flex items-center justify-between transition-all">
      {/* Left Breadcrumb & Status */}
      <div className="flex items-center gap-space-sm lg:gap-space-md">
        {/* Mobile Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          aria-label="Mở menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
          <span>Seller Center</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-label-md text-label-md text-on-surface">Dashboard</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>{shopStatusText}</span>
        </div>
      </div>

      {/* Right Search & Profile actions */}
      <div className="flex items-center gap-space-sm lg:gap-space-md">
        <div className="relative hidden md:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm đơn hàng, SKU..."
            className="w-48 lg:w-60 pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center">
              14
            </span>
          </button>
          <button
            type="button"
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Tin nhắn khách hàng"
          >
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          </button>
          <button
            type="button"
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Trợ giúp"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
        </div>

        <div className="h-6 w-px bg-outline-variant/40" />

        {/* User profile */}
        <div className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface leading-tight group-hover:text-primary transition-colors">
              {userName}
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant leading-tight">
              Chủ Shop
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
            expand_more
          </span>
        </div>
      </div>
    </header>
  );
};
export default ShopHeader;

