import { NextResponse } from "next/server";
import { z } from "zod";
import { execute } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const result = await execute("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email]);

  return NextResponse.json(
    {
      subscribed: true,
      alreadySubscribed: result.affectedRows === 0,
      message: result.affectedRows === 0 ? "You’re already on the Noor list." : "You’re on the Noor list. Welcome in.",
    },
    { status: result.affectedRows === 0 ? 200 : 201 },
  );
}
