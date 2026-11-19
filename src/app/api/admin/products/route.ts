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
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sizes: z.array(z.string().trim().min(1).max(20)).min(1).max(10).default(["S", "M", "L", "XL"]),
});

export async function GET() {
  if (!await requireAdminApi()) return forbidden();
  const products = await query<ProductRow[]>("SELECT id, name, slug, category, collection, price, tone, image, description, sizes, featured, active, stock, created_at AS createdAt, updated_at AS updatedAt FROM products ORDER BY created_at DESC");
  return NextResponse.json(products.map(product => productJson(product, true)));
}

export async function POST(request: Request) {
  if (!await requireAdminApi()) return forbidden();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the product details." }, { status: 400 });
  try {
    const product = parsed.data;
    const result = await execute("INSERT INTO products (name, slug, category, collection, price, image, description, stock, featured, active, sizes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [product.name, product.slug, product.category, product.collection, product.price, product.image, product.description, product.stock, product.featured, product.active, JSON.stringify(product.sizes)]);
    const [created] = await query<ProductRow[]>("SELECT id, name, slug, category, collection, price, tone, image, description, sizes, featured, active, stock, created_at AS createdAt, updated_at AS updatedAt FROM products WHERE id = ?", [result.insertId]);
    return NextResponse.json(productJson(created, true), { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") return NextResponse.json({ error: "A product with that slug already exists." }, { status: 409 });
    console.error("Product creation failed:", error);
    return NextResponse.json({ error: "Unable to create the product." }, { status: 500 });
  }
}
