import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(160),
  category: z.enum(["Women", "Men"]),
  collection: z.string().trim().min(2).max(80),
  price: z.number().finite().nonnegative(),
  image: z.string().startsWith("/").max(255),
  description: z.string().trim().min(10).max(2000),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sizes: z.array(z.string().trim().min(1).max(10)).min(1).max(10).default(["S", "M", "L", "XL"]),
});

export async function GET() {
  if (!await requireAdminApi()) return forbidden();
  await connectDb();
  return NextResponse.json(await Product.find().sort({ createdAt: -1 }).lean());
}

export async function POST(request: Request) {
  if (!await requireAdminApi()) return forbidden();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the product details." }, { status: 400 });
  await connectDb();
  try {
    const product = await Product.create(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
    console.error("Product creation failed:", error);
    return NextResponse.json({ error: "Unable to create the product." }, { status: 500 });
  }
}
