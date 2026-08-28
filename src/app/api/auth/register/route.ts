import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { execute } from "@/lib/db";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/auth";

const schema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a name, valid email, and password of at least 8 characters." }, { status: 400 });
  try {
    const email = parsed.data.email.toLowerCase();
    const result = await execute("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')", [parsed.data.name, email, await bcrypt.hash(parsed.data.password, 12)]);
    const id = String(result.insertId);
    const token = await signSession({ id, email, name: parsed.data.name, role: "customer" });
    const response = NextResponse.json({ user: { id, email, name: parsed.data.name, role: "customer" } }, { status: 201 });
    response.cookies.set(sessionCookie, token, sessionCookieOptions);
    return response;
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    console.error("Customer registration failed:", error);
    return NextResponse.json({ error: "We couldn’t create your account right now. Please try again." }, { status: 503 });
  }
}
