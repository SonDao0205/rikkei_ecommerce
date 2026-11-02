import React from "react";

const FlashNotificationBar: React.FC = () => {
  return (
    <div className="w-full bg-surface-container-highest/60 text-on-surface py-2 px-margin-lg">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between text-body-sm font-body-sm">
        <div className="flex items-center gap-space-sm">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-container text-on-primary font-label-sm text-[10px] tracking-wider uppercase font-bold">
            VIP DROP
          </span>
          <span className="font-medium text-on-surface">
            Curated SS25 Saigon Streetwear Capsule released in strictly limited numbers
          </span>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-label-md text-label-md">
          <span className="flex items-center gap-1 text-primary font-bold cursor-pointer hover:underline">
            <span className="material-symbols-outlined text-[16px]">bolt</span> Flash pass unlocks in 48h
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlashNotificationBar;
