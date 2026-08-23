"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Footer } from "@/components/footer";
import { ProductVisual } from "@/components/product-visual";
import { SiteHeader } from "@/components/site-header";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/products";

export default function ShopPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { products, loading, error } = useProducts();
  const { wishlist, toggleWishlist } = useStore();
  const displayed = useMemo(() => products.filter(product => (filter === "All" || product.category === filter || product.collection === filter) && product.name.toLowerCase().includes(search.toLowerCase())), [filter, products, search]);

  return <main className="flex min-h-screen flex-col"><SiteHeader/><section className="mx-auto w-full max-w-7xl flex-1 px-5 py-16 sm:px-10"><p className="font-mono text-[10px] tracking-[.15em] text-stone-500">THE NOOR COLLECTION</p><h1 className="mt-4 font-display text-5xl">Shop all pieces</h1><div className="mt-10 flex flex-col justify-between gap-5 border-y border-line py-4 sm:flex-row"><div className="flex flex-wrap gap-5 text-xs">{["All", "Women", "Men", "Occasionwear", "Modern classics"].map(item => <button onClick={() => setFilter(item)} key={item} className={filter === item ? "border-b border-wine pb-1 text-wine" : "text-stone-500"}>{item}</button>)}</div><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search collection" className="border-b border-line bg-transparent pb-1 text-xs outline-none"/></div>{loading ? <p className="py-20 text-sm text-stone-500">Loading the collection…</p> : error ? <p className="py-20 text-sm text-wine">{error}</p> : <><p className="mt-6 font-mono text-[10px] text-stone-500">{displayed.length} PIECES</p><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{displayed.map(product => <article key={product.id}><div className="relative"><Link href={`/product/${product.slug}`}><ProductVisual product={product}/></Link><button onClick={() => toggleWishlist(product.id)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-lg">{wishlist.includes(product.id) ? "♥" : "♡"}</button></div><div className="flex items-end justify-between py-4"><div><p className="font-mono text-[10px] text-stone-500">{product.collection}</p><Link href={`/product/${product.slug}`} className="mt-1 block font-display text-xl">{product.name}</Link></div><strong className="font-mono text-[11px]">{formatPrice(product.price)}</strong></div></article>)}</div></>}</section><Footer/></main>;
}
