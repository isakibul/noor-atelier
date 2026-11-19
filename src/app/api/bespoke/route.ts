import { NextResponse } from "next/server";
import { z } from "zod";
import { execute } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().default(""),
  dressType: z.string().trim().min(2).max(60),
  occasion: z.string().trim().max(80).optional().default(""),
  preferredColor: z.string().trim().max(80).optional().default(""),
  notes: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete your name, email, garment type, and design notes (at least 10 characters)." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const result = await execute(
    "INSERT INTO bespoke_requests (name, email, phone, dress_type, occasion, preferred_color, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [data.name, data.email.toLowerCase(), data.phone, data.dressType, data.occasion, data.preferredColor, data.notes],
  );

  return NextResponse.json(
    { id: String(result.insertId), reference: `Bespoke #${String(result.insertId).padStart(4, "0")}` },
    { status: 201 },
  );
}
