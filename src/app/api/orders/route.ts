import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(5).max(30),
    address: z.string().trim().min(10).max(500),
  }),
  items: z.array(z.object({
    productId: z.string().regex(/^[a-fA-F0-9]{24}$/),
    quantity: z.number().int().positive().max(10),
    size: z.string().trim().min(1).max(10),
  })).min(1).max(20),
  paymentMethod: z.literal("cod").default("cod"),
});

const rollbackStock = async (reserved: Array<{ id: string; quantity: number }>) => {
  await Promise.all(reserved.map(({ id, quantity }) => Product.findByIdAndUpdate(id, { $inc: { stock: quantity } })));
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check your delivery details and bag." }, { status: 400 });

  await connectDb();
  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  const productIds = Array.from(quantities.keys());
  const products = await Product.find({ _id: { $in: productIds }, active: true }).lean();
  if (products.length !== productIds.length) return NextResponse.json({ error: "One or more items are no longer available." }, { status: 409 });

  const byId = new Map(products.map(product => [product._id.toString(), product]));
  const reserved: Array<{ id: string; quantity: number }> = [];
  for (const [id, quantity] of Array.from(quantities.entries())) {
    const updated = await Product.findOneAndUpdate({ _id: id, active: true, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
    if (!updated) {
      await rollbackStock(reserved);
      return NextResponse.json({ error: "A selected item has insufficient stock." }, { status: 409 });
    }
    reserved.push({ id, quantity });
  }

  try {
    const items = parsed.data.items.map(item => {
      const product = byId.get(item.productId)!;
      return { productId: item.productId, name: product.name, price: product.price, quantity: item.quantity, size: item.size, image: product.image };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const session = await getSession();
    const order = await Order.create({
      customer: parsed.data.customer,
      items,
      subtotal,
      paymentMethod: "cod",
      userId: session?.id,
      orderNumber: `NOOR-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    });
    return NextResponse.json({ id: order._id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    await rollbackStock(reserved);
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to view orders." }, { status: 401 });
  await connectDb();
  const orders = await Order.find({ userId: session.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}
