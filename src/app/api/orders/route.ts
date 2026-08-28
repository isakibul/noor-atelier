import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { orderJson, query, transaction, type OrderRow, type ProductRow } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(5).max(30),
    address: z.string().trim().min(10).max(500),
  }),
  items: z.array(z.object({
    productId: z.string().regex(/^\d+$/),
    quantity: z.number().int().positive().max(10),
    size: z.string().trim().min(1).max(10),
  })).min(1).max(20),
  paymentMethod: z.literal("cod").default("cod"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check your delivery details and bag." }, { status: 400 });

  try {
    const order = await transaction(async connection => {
      const quantities = new Map<string, number>();
      for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
      const ids = Array.from(quantities.keys());
      const [products] = await connection.query<ProductRow[]>(`SELECT id, name, price, image, stock FROM products WHERE id IN (${ids.map(() => "?").join(", ")}) AND active = 1`, ids);
      if (products.length !== ids.length) throw new Error("UNAVAILABLE");
      const byId = new Map(products.map(product => [String(product.id), product]));
      for (const [id, quantity] of Array.from(quantities.entries())) { const product = byId.get(id); if (!product || product.stock < quantity) throw new Error("INSUFFICIENT_STOCK"); await connection.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, id]); }
      const items = parsed.data.items.map(item => { const product = byId.get(item.productId)!; return { ...item, name: product.name, price: Number(product.price), image: product.image }; });
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const session = await getSession();
      const orderNumber = `NOOR-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const [result] = await connection.execute("INSERT INTO `orders` (order_number, customer_name, customer_email, customer_phone, customer_address, subtotal, payment_method, user_id) VALUES (?, ?, ?, ?, ?, ?, 'cod', ?)", [orderNumber, parsed.data.customer.name, parsed.data.customer.email, parsed.data.customer.phone, parsed.data.customer.address, subtotal, session?.id || null]);
      for (const item of items) await connection.execute("INSERT INTO order_items (order_id, product_id, name, price, quantity, size, image) VALUES (?, ?, ?, ?, ?, ?, ?)", [result.insertId, item.productId, item.name, item.price, item.quantity, item.size, item.image]);
      return { id: String(result.insertId), orderNumber };
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAVAILABLE" || error.message === "INSUFFICIENT_STOCK")) return NextResponse.json({ error: error.message === "UNAVAILABLE" ? "One or more items are no longer available." : "A selected item has insufficient stock." }, { status: 409 });
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to view orders." }, { status: 401 });
  const orders = await query<OrderRow[]>("SELECT id, order_number AS orderNumber, subtotal, status, payment_method AS paymentMethod, created_at AS createdAt FROM `orders` WHERE user_id = ? ORDER BY created_at DESC", [session.id]);
  return NextResponse.json(orders.map(orderJson));
}
