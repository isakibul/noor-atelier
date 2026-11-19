export const FREE_DELIVERY_THRESHOLD = 5000;
export const STANDARD_DELIVERY_FEE = 120;

export function calculateDeliveryFee(netSubtotal: number): number {
  if (netSubtotal <= 0) return 0;
  return netSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
}

export function calculateDiscount(
  subtotal: number,
  coupon: { type: "percent" | "fixed"; value: number; minOrder: number } | null | undefined,
): number {
  if (!coupon || subtotal <= 0 || subtotal < coupon.minOrder) return 0;
  const raw = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.max(0, Math.min(subtotal, Math.round(raw)));
}

export function amountForFreeDelivery(netSubtotal: number): number {
  if (netSubtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return Math.max(0, FREE_DELIVERY_THRESHOLD - netSubtotal);
}
