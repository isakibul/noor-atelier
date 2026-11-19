import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute, query, type BespokeRow } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["new", "contacted", "in_progress", "completed"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminApi()) return forbidden();
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const result = await execute(
    "UPDATE bespoke_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [parsed.data.status, id],
  );
  if (!result.affectedRows) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const [row] = await query<BespokeRow[]>(
    "SELECT id, name, email, phone, dress_type AS dressType, occasion, preferred_color AS preferredColor, notes, status, created_at AS createdAt, updated_at AS updatedAt FROM bespoke_requests WHERE id = ?",
    [id],
  );
  return NextResponse.json({ ...row, id: String(row.id) });
}
