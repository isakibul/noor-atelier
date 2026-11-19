import { NextResponse } from "next/server";
import { forbidden, requireAdminApi } from "@/lib/api";
import { query, type BespokeRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdminApi()) return forbidden();
  const rows = await query<BespokeRow[]>(
    "SELECT id, name, email, phone, dress_type AS dressType, occasion, preferred_color AS preferredColor, notes, status, created_at AS createdAt, updated_at AS updatedAt FROM bespoke_requests ORDER BY created_at DESC LIMIT 200",
  );
  return NextResponse.json(rows.map(row => ({ ...row, id: String(row.id) })));
}
