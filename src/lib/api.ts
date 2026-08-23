import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAdminApi() { const session = await getSession(); return session?.role === "admin" ? session : null; }
export const forbidden = () => NextResponse.json({ error: "Admin access required" }, { status: 403 });
