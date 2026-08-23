"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/footer";
import { ProductVisual } from "@/components/product-visual";
import { SiteHeader } from "@/components/site-header";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/products";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { products, loading } = useProducts(params.slug);
  const product = products[0];
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const { add, wishlist, toggleWishlist } = useStore();
  if (loading) return <main className="flex min-h-screen flex-col"><SiteHeader/><div className="mx-auto w-full max-w-7xl flex-1 px-5 py-28 text-sm text-stone-500">Loading piece…</div><Footer/></main>;
  if (!product) return <main className="flex min-h-screen flex-col"><SiteHeader/><div className="mx-auto w-full max-w-7xl flex-1 px-5 py-28"><h1 className="font-display text-5xl">Piece not found.</h1><Link className="mt-6 inline-block text-wine" href="/shop">Return to shop →</Link></div><Footer/></main>;
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  return <main><SiteHeader/><section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2 lg:px-10"><ProductVisual product={product} large/><div className="py-2"><Link href="/shop" className="font-mono text-[10px] text-stone-500">← BACK TO SHOP</Link><p className="mt-12 font-mono text-[10px] tracking-[.12em] text-stone-500">{product.collection.toUpperCase()}</p><h1 className="mt-3 font-display text-5xl">{product.name}</h1><p className="mt-4 font-mono text-sm">{formatPrice(product.price)}</p><p className="mt-9 max-w-md text-sm leading-7 text-stone-600">{product.description} Every Noor piece is crafted in a considered small run and checked by hand before it leaves our atelier.</p><div className="mt-10"><p className="font-mono text-[10px]">SELECT SIZE</p><div className="mt-3 flex gap-2">{sizes.map(item => <button key={item} onClick={() => setSize(item)} className={size === item ? "h-10 w-10 border border-wine bg-wine text-xs text-white" : "h-10 w-10 border border-line text-xs"}>{item}</button>)}</div><button className="mt-3 border-b border-stone-400 text-xs">Size guide</button></div><div className="mt-10 flex gap-3"><button onClick={() => { add(product, size); setAdded(true); }} className="flex-1 bg-wine py-4 text-xs text-white">Add to bag · {formatPrice(product.price)}</button><button onClick={() => toggleWishlist(product.id)} className="w-14 border border-line text-xl">{wishlist.includes(product.id) ? "♥" : "♡"}</button></div>{added && <div className="mt-4 flex items-center justify-between bg-[#f4eee8] p-4 text-xs"><span>Added to your bag.</span><Link className="text-wine" href="/cart">View bag →</Link></div>}<div className="mt-9 grid grid-cols-3 border-t border-line pt-5 font-mono text-[9px] text-stone-500"><span>FREE DELIVERY<br/>over ৳ 5,000</span><span>TAILORING<br/>on selected styles</span><span>RETURNS<br/>within 7 days</span></div></div></section><Footer/></main>;
}
