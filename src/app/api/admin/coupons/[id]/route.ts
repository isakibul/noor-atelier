import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute } from "@/lib/db";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ active: z.boolean() });
const invalidId = (id: string) => !/^\d+$/.test(id);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminApi()) return forbidden();
  const { id } = await params;
  if (invalidId(id)) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const result = await execute("UPDATE coupons SET active = ? WHERE id = ?", [parsed.data.active, id]);
  return result.affectedRows
    ? NextResponse.json({ ok: true, active: parsed.data.active })
    : NextResponse.json({ error: "Coupon not found." }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminApi()) return forbidden();
  const { id } = await params;
  if (invalidId(id)) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  const result = await execute("DELETE FROM coupons WHERE id = ?", [id]);
  return result.affectedRows
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Coupon not found." }, { status: 404 });
}
