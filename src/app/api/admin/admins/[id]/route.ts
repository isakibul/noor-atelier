import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute, query } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  role: z.enum(["admin", "customer"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (!session) return forbidden();

  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid role." }, { status: 400 });

  if (session.id === id) {
    return NextResponse.json({ error: "You cannot change your own admin access." }, { status: 400 });
  }

  const [target] = await query<Array<{ id: number; name: string; email: string; role: "admin" | "customer"; createdAt: string }>>(
    "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1",
    [Number(id)],
  );
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (target.role === "admin" && parsed.data.role === "customer") {
    const [{ count }] = await query<Array<{ count: number }>>(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'",
    );
    if (Number(count) <= 1) {
      return NextResponse.json({ error: "At least one administrator must remain." }, { status: 400 });
    }
  }

  await execute("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
    parsed.data.role,
    Number(id),
  ]);

  return NextResponse.json({
    id: String(target.id),
    name: target.name,
    email: target.email,
    role: parsed.data.role,
    createdAt: target.createdAt,
  });
}
