import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { attachOrderItems, query, transaction, type OrderItemRow, type OrderRow } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminApi()) return forbidden();
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });

  try {
    await transaction(async connection => {
      const [existingRows] = await connection.query<Array<{ id: number; status: string }>>(
        "SELECT id, status FROM `orders` WHERE id = ? LIMIT 1",
        [id],
      );
      const existing = existingRows[0];
      if (!existing) throw new Error("NOT_FOUND");

      const nextStatus = parsed.data.status;
      if (existing.status !== nextStatus) {
        if (existing.status !== "cancelled" && nextStatus === "cancelled") {
          const [items] = await connection.query<OrderItemRow[]>(
            "SELECT product_id AS productId, quantity FROM order_items WHERE order_id = ?",
            [id],
          );
          for (const item of items) {
            await connection.execute(
              "UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
              [item.quantity, item.productId],
            );
          }
        } else if (existing.status === "cancelled" && nextStatus !== "cancelled") {
          const [items] = await connection.query<OrderItemRow[]>(
            "SELECT product_id AS productId, quantity FROM order_items WHERE order_id = ?",
            [id],
          );
          for (const item of items) {
            const [res] = await connection.execute(
              "UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND stock >= ?",
              [item.quantity, item.productId, item.quantity],
            );
            if (!res.affectedRows) throw new Error("INSUFFICIENT_STOCK");
          }
        }
        await connection.execute(
          "UPDATE `orders` SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [nextStatus, id],
        );
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Cannot reopen cancelled order: insufficient product stock." }, { status: 409 });
    }
    console.error("Order update failed:", error);
    return NextResponse.json({ error: "Unable to update order status." }, { status: 500 });
  }

  const orders = await query<OrderRow[]>(
    "SELECT id, order_number AS orderNumber, customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone, customer_address AS customerAddress, subtotal, discount, coupon_code AS couponCode, delivery_fee AS deliveryFee, total, notes, status, payment_method AS paymentMethod, created_at AS createdAt FROM `orders` WHERE id = ?",
    [id],
  );
  const [withItems] = await attachOrderItems(orders);
  return NextResponse.json(withItems);
}
