import { NextResponse } from "next/server";
import { z } from "zod";
import { query, type CouponRow } from "@/lib/db";
import { calculateDiscount } from "@/lib/pricing";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(2).max(40),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid promo code." }, { status: 400 });
  }

  const [coupon] = await query<CouponRow[]>(
    "SELECT id, code, type, value, min_order AS minOrder, active, expires_at AS expiresAt, created_at AS createdAt FROM coupons WHERE upper(code) = ? AND active = 1 LIMIT 1",
    [parsed.data.code.toUpperCase()],
  );

  if (!coupon) {
    return NextResponse.json({ error: "Promo code not found or inactive." }, { status: 404 });
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
  }
  if (parsed.data.subtotal < Number(coupon.minOrder)) {
    return NextResponse.json(
      { error: `Add ${formatPrice(Number(coupon.minOrder) - parsed.data.subtotal)} more to use ${coupon.code} (minimum ${formatPrice(Number(coupon.minOrder))}).` },
      { status: 400 },
    );
  }

  const discount = calculateDiscount(parsed.data.subtotal, {
    type: coupon.type,
    value: Number(coupon.value),
    minOrder: Number(coupon.minOrder),
  });

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    minOrder: Number(coupon.minOrder),
    discount,
  });
}
