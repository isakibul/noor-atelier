import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

export type SessionUser = {
  id: string;
  email: string;
  role: "customer" | "admin";
  name: string;
};

export const sessionCookie = "noor_session";
const sessionDuration = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: sessionDuration,
};

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string" || !/^\d+$/.test(payload.id)) return null;
    const [user] = await query<Array<{ id: number; name: string; email: string; role: "customer" | "admin" }>>(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [Number(payload.id)],
    );
    if (!user) return null;
    return { id: String(user.id), email: user.email, name: user.name, role: user.role };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/account");
  return session;
}
