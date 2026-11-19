import { NextResponse } from "next/server";
import { forbidden, requireAdminApi } from "@/lib/api";
import { attachOrderItems, query, type OrderRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdminApi()) return forbidden();
  const orders = await query<OrderRow[]>(
    "SELECT id, order_number AS orderNumber, customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone, customer_address AS customerAddress, subtotal, discount, coupon_code AS couponCode, delivery_fee AS deliveryFee, total, notes, status, payment_method AS paymentMethod, created_at AS createdAt FROM `orders` ORDER BY created_at DESC LIMIT 200",
  );
  return NextResponse.json(await attachOrderItems(orders));
}
