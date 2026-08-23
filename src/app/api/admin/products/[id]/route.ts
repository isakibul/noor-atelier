import { isValidObjectId } from "mongoose";
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
  stock: z.number().int().nonnegative(),
  featured: z.boolean(),
  active: z.boolean(),
  sizes: z.array(z.string().trim().min(1).max(10)).min(1).max(10),
});

const invalidId = (id: string) => !isValidObjectId(id);

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!await requireAdminApi()) return forbidden();
  if (invalidId(params.id)) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the product details." }, { status: 400 });
  await connectDb();
  try {
    const product = await Product.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    return product ? NextResponse.json(product) : NextResponse.json({ error: "Product not found." }, { status: 404 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
    console.error("Product update failed:", error);
    return NextResponse.json({ error: "Unable to update the product." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!await requireAdminApi()) return forbidden();
  if (invalidId(params.id)) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  await connectDb();
  const product = await Product.findByIdAndDelete(params.id);
  return product ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}
