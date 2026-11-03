import React from "react";
import { Link } from "react-router-dom";
import type { ShopUrgentActionItem, UrgentActionBadgeType } from "../../../types/shop/shopDashboard.types";

interface ShopUrgentActionsProps {
  urgentActions: ShopUrgentActionItem[];
}

const getBadgeClasses = (type: UrgentActionBadgeType) => {
  switch (type) {
    case "warning":
      return "bg-tertiary-fixed text-on-tertiary-fixed";
    case "info":
      return "bg-secondary-fixed text-on-secondary-fixed";
    case "error":
      return "bg-error-container text-on-error-container";
    case "neutral":
    default:
      return "bg-tertiary-fixed text-on-tertiary-fixed";
  }
};

const getTextColor = (id: string) => {
  switch (id) {
    case "low_stock":
      return "text-error";
    case "packing_orders":
      return "text-secondary";
    case "pending_orders":
      return "text-primary";
    case "complaints":
    default:
      return "text-on-surface";
  }
};

export const ShopUrgentActions: React.FC<ShopUrgentActionsProps> = ({ urgentActions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {urgentActions.map((item) => {
        const actionTextColor = getTextColor(item.id);

        return (
          <div
            key={item.id}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {item.title}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${getBadgeClasses(
                    item.badgeType
                  )}`}
                >
                  {item.id === "pending_orders" && (
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                  )}
                  {item.badgeText}
                </span>
              </div>

              <div className="flex items-baseline gap-space-sm">
                <span
                  className={`font-headline-xl text-headline-xl ${
                    item.id === "low_stock" ? "text-error" : "text-on-surface"
                  }`}
                >
                  {item.count}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {item.countUnit}
                </span>
              </div>

              <p
                className={`font-body-sm text-body-sm ${
                  item.id === "low_stock"
                    ? "text-error"
                    : item.id === "packing_orders"
                    ? "text-secondary"
                    : item.id === "pending_orders"
                    ? "text-tertiary"
                    : "text-outline"
                }`}
              >
                {item.description}
              </p>
            </div>

            <Link
              to={item.actionPath}
              className={`mt-space-md pt-space-xs flex items-center justify-between font-label-lg text-label-lg group-hover:translate-x-1 transition-transform ${actionTextColor}`}
            >
              <span>{item.actionLabel}</span>
              <span className="material-symbols-outlined text-[18px]">
                {item.actionIcon || "arrow_forward"}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
export default ShopUrgentActions;

