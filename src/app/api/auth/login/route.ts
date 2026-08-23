import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/auth";
import { User } from "@/models/User";

const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  try {
    await connectDb();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    const token = await signSession({ id: user._id.toString(), email: user.email, name: user.name, role: user.role as "customer" | "admin" });
    const response = NextResponse.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
    response.cookies.set(sessionCookie, token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "We couldn’t sign you in right now. Please try again." }, { status: 503 });
  }
}
