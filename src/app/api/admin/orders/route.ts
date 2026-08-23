import { NextResponse } from "next/server";
import { forbidden, requireAdminApi } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Order } from "@/models/Order";
export const dynamic = "force-dynamic";
export async function GET() { if (!await requireAdminApi()) return forbidden(); await connectDb(); return NextResponse.json(await Order.find().sort({ createdAt: -1 }).limit(100).lean()); }
