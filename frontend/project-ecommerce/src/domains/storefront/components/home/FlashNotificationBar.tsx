import React from "react";
import { useTranslation } from "react-i18next";

const FlashNotificationBar: React.FC = () => {
  const { t } = useTranslation("customer");

  return (
    <div className="w-full bg-surface-container-highest/60 text-on-surface py-2 px-margin-lg">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between text-body-sm font-body-sm">
        <div className="flex items-center gap-space-sm">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-container text-on-primary font-label-sm text-[10px] tracking-wider uppercase font-bold">
            {t("home.flash_notification.tag")}
          </span>
          <span className="font-medium text-on-surface">
            {t("home.flash_notification.message")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlashNotificationBar;
