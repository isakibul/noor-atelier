import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute, query, type CouponRow } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(3).max(32).regex(/^[A-Za-z0-9_-]+$/),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive(),
  minOrder: z.number().nonnegative().default(0),
  active: z.boolean().default(true),
  expiresAt: z.string().trim().optional().nullable(),
});

export async function GET() {
  if (!await requireAdminApi()) return forbidden();
  const rows = await query<CouponRow[]>(
    "SELECT id, code, type, value, min_order AS minOrder, active, expires_at AS expiresAt, created_at AS createdAt FROM coupons ORDER BY created_at DESC",
  );
  return NextResponse.json(
    rows.map(row => ({
      id: String(row.id),
      code: row.code,
      type: row.type,
      value: Number(row.value),
      minOrder: Number(row.minOrder),
      active: Boolean(row.active),
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  if (!await requireAdminApi()) return forbidden();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check coupon code, type, and value." }, { status: 400 });
  }
  const data = parsed.data;
  if (data.type === "percent" && data.value > 90) {
    return NextResponse.json({ error: "Percentage discount cannot exceed 90%." }, { status: 400 });
  }
  try {
    const code = data.code.toUpperCase();
    const result = await execute(
      "INSERT INTO coupons (code, type, value, min_order, active, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
      [code, data.type, data.value, data.minOrder, data.active, data.expiresAt || null],
    );
    const [created] = await query<CouponRow[]>(
      "SELECT id, code, type, value, min_order AS minOrder, active, expires_at AS expiresAt, created_at AS createdAt FROM coupons WHERE id = ?",
      [result.insertId],
    );
    return NextResponse.json(
      {
        id: String(created.id),
        code: created.code,
        type: created.type,
        value: Number(created.value),
        minOrder: Number(created.minOrder),
        active: Boolean(created.active),
        expiresAt: created.expiresAt,
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json({ error: "A promo code with that name already exists." }, { status: 409 });
    }
    console.error("Coupon creation failed:", error);
    return NextResponse.json({ error: "Unable to create promo code." }, { status: 500 });
  }
}
