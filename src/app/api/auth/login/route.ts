import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { query, type UserRow } from "@/lib/db";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/auth";

const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  try {
    const [user] = await query<UserRow[]>("SELECT id, name, email, password_hash AS passwordHash, role FROM users WHERE email = ? LIMIT 1", [parsed.data.email.toLowerCase()]);
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    const token = await signSession({ id: String(user.id), email: user.email, name: user.name, role: user.role });
    const response = NextResponse.json({ user: { id: String(user.id), email: user.email, name: user.name, role: user.role } });
    response.cookies.set(sessionCookie, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "We couldn’t sign you in right now. Please try again." }, { status: 503 });
  }
}
