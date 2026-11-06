import React from "react";
import { Link } from "react-router-dom";
import type { ShopUrgentActionItem, UrgentActionBadgeType } from "@/domains/shop/types/shopDashboard.types";

interface ShopUrgentActionsProps {
  urgentActions: ShopUrgentActionItem[];
}

const getBadgeClasses = (type: UrgentActionBadgeType) => {
  switch (type) {
    case "warning":
      return "bg-amber-50 text-amber-700 border border-amber-200/50";
    case "info":
      return "bg-sky-50 text-sky-700 border border-sky-200/50";
    case "error":
      return "bg-rose-50 text-rose-700 border border-rose-200/50";
    case "neutral":
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200/50";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
      {urgentActions.map((item) => {
        const actionTextColor = getTextColor(item.id);

        return (
          <div
            key={item.id}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  {item.title}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-label-sm text-[11px] font-semibold font-mono ${getBadgeClasses(
                    item.badgeType
                  )}`}
                >
                  {item.id === "pending_orders" && (
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                  )}
                  {item.badgeText}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className={`font-headline-lg text-headline-lg font-bold font-mono tracking-tight ${
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
                    ? "text-error font-medium"
                    : item.id === "packing_orders"
                    ? "text-secondary font-medium"
                    : item.id === "pending_orders"
                    ? "text-tertiary font-medium"
                    : "text-outline"
                }`}
              >
                {item.description}
              </p>
            </div>

            <Link
              to={item.actionPath}
              className={`mt-4 pt-2 border-t border-outline-variant/20 flex items-center justify-between font-label-md text-label-md font-semibold group-hover:translate-x-1 transition-transform ${actionTextColor}`}
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
