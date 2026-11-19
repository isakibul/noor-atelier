import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidden, requireAdminApi } from "@/lib/api";
import { execute, productJson, query, type ProductRow } from "@/lib/db";

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
  sizes: z.array(z.string().trim().min(1).max(20)).min(1).max(10),
});

const invalidId = (id: string) => !/^\d+$/.test(id);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminApi()) return forbidden();
  const { id } = await params;
  if (invalidId(id)) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the product details." }, { status: 400 });
  try {
    const product = parsed.data;
    const result = await execute("UPDATE products SET name = ?, slug = ?, category = ?, collection = ?, price = ?, image = ?, description = ?, stock = ?, featured = ?, active = ?, sizes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [product.name, product.slug, product.category, product.collection, product.price, product.image, product.description, product.stock, product.featured, product.active, JSON.stringify(product.sizes), id]);
    if (!result.affectedRows) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const [updated] = await query<ProductRow[]>("SELECT id, name, slug, category, collection, price, tone, image, description, sizes, featured, active, stock, created_at AS createdAt, updated_at AS updatedAt FROM products WHERE id = ?", [id]);
    return NextResponse.json(productJson(updated, true));
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
    console.error("Product update failed:", error);
    return NextResponse.json({ error: "Unable to update the product." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminApi()) return forbidden();
  const { id } = await params;
  if (invalidId(id)) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const result = await execute("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}
