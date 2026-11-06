/**
 * Formats a numeric price into Vietnamese Dong string format: e.g. 1.250.000 ₫
 */
export function formatCurrencyVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

