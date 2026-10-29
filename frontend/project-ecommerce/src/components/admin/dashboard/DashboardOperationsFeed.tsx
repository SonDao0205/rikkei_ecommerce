import React from "react";
import { Link } from "react-router-dom";
import type {
  OperationalAlertItem,
  MarketplaceActivityItem,
} from "../../../types/ecommerce";

interface DashboardOperationsFeedProps {
  operations: OperationalAlertItem[];
  activities: MarketplaceActivityItem[];
}

export const DashboardOperationsFeed: React.FC<DashboardOperationsFeedProps> = ({
  operations,
  activities,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Left: Pending Operational Actions */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                  Operational Attention
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-100 text-amber-800">
                  {operations.length} Pending
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Tasks requiring super admin moderation &amp; fulfillment overrides
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[22px]">
              pending_actions
            </span>
          </div>

          <div className="flex flex-col gap-3.5 mt-4">
            {operations.map((item) => {
              const isHigh = item.priority === "high";
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container/20 hover:bg-surface-container/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isHigh ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.type === "shop_approval"
                          ? "store"
                          : item.type === "return_request"
                          ? "assignment_return"
                          : "warning"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                            isHigh
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                        {item.description}
                      </p>
                      <span className="text-[11px] font-label-sm text-outline mt-1 block font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {item.actionUrl ? (
                      <Link
                        to={item.actionUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white transition-all text-on-surface font-label-sm text-label-sm font-semibold shadow-xs"
                      >
                        <span>{item.actionLabel}</span>
                        <span className="material-symbols-outlined text-[14px]">
                          chevron_right
                        </span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white transition-all text-on-surface font-label-sm text-label-sm font-semibold shadow-xs cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
          <span>All merchant policies enforced</span>
          <Link
            to="/admin/products"
            className="text-primary font-semibold hover:underline flex items-center gap-1 text-label-sm"
          >
            Manage Catalog
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Right: Latest Marketplace Activity Feed */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                  Marketplace Activity Log
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Real-time transactions, couriers, and shopper interactions
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[22px]">
              history
            </span>
          </div>

          <div className="flex flex-col gap-3.5 mt-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-surface-container/30 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg} ${act.iconColor}`}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {act.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                      {act.title}
                    </p>
                    <p className="text-body-sm font-body-sm text-on-surface-variant truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {act.tag && (
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold mb-1 ${
                        act.tagColor || "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {act.tag}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-outline block">
                    {act.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
          <span>Audit trail logged to database</span>
          <span className="font-mono text-xs text-outline">Socket ID: #WS-9912</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOperationsFeed;
