import React from "react";
import { Link } from "react-router-dom";

export const OnboardingFooter: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] py-space-lg">
      <div className="max-w-[1440px] mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-md text-headline-md text-primary font-bold">
            MarketPulse
          </span>
          <span>© 2025 MarketPulse Commerce Platform. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center gap-space-md">
          <Link to="#" className="hover:text-primary transition-colors">
            Quy chế hoạt động sàn
          </Link>
          <Link to="#" className="hover:text-primary transition-colors">
            Chính sách bảo mật
          </Link>
          <Link to="#" className="hover:text-primary transition-colors">
            Tiêu chuẩn vận hành người bán
          </Link>
          <Link to="#" className="hover:text-primary transition-colors">
            Trung tâm hỗ trợ đối tác
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default OnboardingFooter;
