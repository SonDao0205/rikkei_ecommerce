import React from "react";

export interface BrandIconProps {
  className?: string;
}

/**
 * Biểu tượng logo thương hiệu chính thức của MarketPulse (Layers/Cube icon đồng bộ với trang Login)
 */
export const BrandIcon: React.FC<BrandIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
};

export default BrandIcon;

