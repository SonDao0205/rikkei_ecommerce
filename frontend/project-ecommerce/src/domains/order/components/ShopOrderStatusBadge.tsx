import { useTranslation } from "react-i18next";
import type { ShopOrderStatus } from "@/domains/order/types";

const badgeClasses = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-blue-100 text-blue-900",
  packing: "bg-blue-100 text-blue-900",
  shipping: "bg-secondary-fixed text-on-secondary-fixed-variant",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-surface-container-high text-on-surface-variant",
  returned: "bg-purple-100 text-purple-900",
} satisfies Record<ShopOrderStatus, string>;

export function ShopOrderStatusBadge({ status }: { status: ShopOrderStatus }) {
  const { t } = useTranslation("customer");

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClasses[status]}`}>
      {t(`profile.orders.statuses.${status}`)}
    </span>
  );
}
