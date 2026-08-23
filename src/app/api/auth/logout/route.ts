import { NextResponse } from "next/server";
import { sessionCookie, sessionCookieOptions } from "@/lib/auth";
export async function POST() { const response = NextResponse.json({ ok: true }); response.cookies.set(sessionCookie, "", { ...sessionCookieOptions, expires: new Date(0), maxAge: 0 }); return response; }
