import { NextResponse } from "next/server";
import { productJson, query, type ProductRow } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  const products = await query<ProductRow[]>(`SELECT id, name, slug, category, collection, price, tone, image, description, sizes, featured, active, stock, created_at AS createdAt, updated_at AS updatedAt FROM products WHERE active = 1 ${slug ? "AND slug = ?" : ""} ORDER BY featured DESC, created_at DESC`, slug ? [slug] : []);
  return NextResponse.json(products.map(product => productJson(product)));
}
