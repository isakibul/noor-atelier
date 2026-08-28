import { NextResponse } from "next/server";
import { forbidden, requireAdminApi } from "@/lib/api";
import { orderJson, query, type OrderRow } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { if (!await requireAdminApi()) return forbidden(); const orders = await query<OrderRow[]>("SELECT id, order_number AS orderNumber, subtotal, status, payment_method AS paymentMethod, created_at AS createdAt FROM `orders` ORDER BY created_at DESC LIMIT 100"); return NextResponse.json(orders.map(orderJson)); }
