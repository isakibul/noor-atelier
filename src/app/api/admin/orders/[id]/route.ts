import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Order } from "@/models/Order";
export const dynamic = "force-dynamic";
const schema = z.object({ status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]) });
export async function PATCH(request: Request, { params }: { params: { id: string } }) { if (!await requireAdminApi()) return forbidden(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid order status" }, { status: 400 }); await connectDb(); const order = await Order.findByIdAndUpdate(params.id, { status: parsed.data.status }, { new: true }); return order ? NextResponse.json(order) : NextResponse.json({ error: "Order not found" }, { status: 404 }); }
