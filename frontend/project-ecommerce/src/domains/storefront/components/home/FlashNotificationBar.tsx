import React from "react";

const FlashNotificationBar: React.FC = () => {
  return (
    <div className="w-full bg-surface-container-highest/60 text-on-surface py-2 px-margin-lg">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between text-body-sm font-body-sm">
        <div className="flex items-center gap-space-sm">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-container text-on-primary font-label-sm text-[10px] tracking-wider uppercase font-bold">
            MARKETPLACE
          </span>
          <span className="font-medium text-on-surface">
            Discover products from active stores on MarketPulse
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlashNotificationBar;
