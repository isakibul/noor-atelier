import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Product } from "@/models/Product";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  await connectDb();
  const slug = new URL(request.url).searchParams.get("slug");
  const products = await Product.find({ active: true, ...(slug ? { slug } : {}) }).sort({ featured: -1, createdAt: -1 }).lean();
  return NextResponse.json(products.map(product => ({
    id: product._id.toString(),
    slug: product.slug,
    name: product.name,
    category: product.category,
    collection: product.collection,
    price: product.price,
    tone: product.tone,
    image: product.image,
    description: product.description,
    sizes: product.sizes,
    featured: product.featured,
    active: product.active,
    stock: product.stock,
    isNew: product.featured,
  })));
}
