"use client";

import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { useProducts } from "@/hooks/use-products";
import { formatPrice } from "@/lib/products";

export function HomeProducts() {
  const { products, loading } = useProducts();
  const featured = products.filter(product => product.featured).slice(0, 3);
  const display = (featured.length ? featured : products).slice(0, 3);
  if (loading) return <p className="mt-10 text-sm text-stone-500">Loading bestsellers…</p>;
  return <div className="mt-10 grid gap-5 sm:grid-cols-3">{display.map(product => <article key={product.id} className="group"><Link href={`/product/${product.slug}`}><ProductVisual product={product}/></Link><div className="flex items-end justify-between py-4"><div><p className="font-mono text-[10px] text-stone-500">{product.collection} · LIMITED BATCH</p><Link href={`/product/${product.slug}`} className="mt-1 block font-display text-xl">{product.name}</Link></div><strong className="font-mono text-[11px]">{formatPrice(product.price)}</strong></div><Link href={`/product/${product.slug}`} className="block border border-[#c8b5ac] px-3 py-3 text-xs transition hover:border-wine hover:bg-wine hover:text-white">View piece <span className="float-right text-base">↗</span></Link></article>)}</div>;
}
