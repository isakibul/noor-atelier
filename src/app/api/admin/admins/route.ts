import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute, query } from "@/lib/db";

export const dynamic = "force-dynamic";

type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
};

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(100),
});

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return forbidden();

  const users = await query<AdminUserRow[]>(
    "SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY (role = 'admin') DESC, created_at DESC",
  );

  return NextResponse.json({
    currentAdminId: session.id,
    users: users.map(user => ({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  if (!await requireAdminApi()) return forbidden();

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a name, valid email, and password of at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const result = await execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
      [parsed.data.name, email, passwordHash],
    );
    const [created] = await query<AdminUserRow[]>(
      "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?",
      [result.insertId],
    );
    return NextResponse.json(
      {
        id: String(created.id),
        name: created.name,
        email: created.email,
        role: created.role,
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json(
        { error: "An account with this email already exists. Promote it from the user list instead." },
        { status: 409 },
      );
    }
    console.error("Admin creation failed:", error);
    return NextResponse.json({ error: "Unable to create administrator account." }, { status: 500 });
  }
}
