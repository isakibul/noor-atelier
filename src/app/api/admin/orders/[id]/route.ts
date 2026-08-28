import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute, orderJson, query, type OrderRow } from "@/lib/db";
export const dynamic = "force-dynamic";
const schema = z.object({ status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]) });
export async function PATCH(request: Request, { params }: { params: { id: string } }) { if (!await requireAdminApi()) return forbidden(); if (!/^\d+$/.test(params.id)) return NextResponse.json({ error: "Order not found" }, { status: 404 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid order status" }, { status: 400 }); const result = await execute("UPDATE `orders` SET status = ? WHERE id = ?", [parsed.data.status, params.id]); if (!result.affectedRows) return NextResponse.json({ error: "Order not found" }, { status: 404 }); const [order] = await query<OrderRow[]>("SELECT id, order_number AS orderNumber, subtotal, status, payment_method AS paymentMethod, created_at AS createdAt FROM `orders` WHERE id = ?", [params.id]); return NextResponse.json(orderJson(order)); }
