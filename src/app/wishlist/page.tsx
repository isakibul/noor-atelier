"use client";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { ProductVisual } from "@/components/product-visual";
import { SiteHeader } from "@/components/site-header";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/products";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useStore();
  const { products, loading } = useProducts();
  const items = products.filter(product => wishlist.includes(product.id));
  return <main className="flex min-h-screen flex-col"><SiteHeader/><section className="mx-auto w-full max-w-7xl flex-1 px-5 py-16 sm:px-10"><p className="font-mono text-[10px] tracking-[.15em] text-stone-500">SAVED FOR LATER</p><h1 className="mt-4 font-display text-5xl">Your wishlist</h1>{loading ? <p className="py-20 text-sm text-stone-500">Loading your saved pieces…</p> : items.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(product => <article key={product.id}><div className="relative"><Link href={`/product/${product.slug}`}><ProductVisual product={product}/></Link><button onClick={() => toggleWishlist(product.id)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-lg">♥</button></div><div className="flex justify-between py-4"><Link href={`/product/${product.slug}`} className="font-display text-xl">{product.name}</Link><span className="font-mono text-[11px]">{formatPrice(product.price)}</span></div></article>)}</div> : <div className="py-20 text-center"><h2 className="font-display text-3xl">A place for pieces you love.</h2><Link href="/shop" className="mt-6 inline-block text-wine">Explore the collection →</Link></div>}</section><Footer/></main>;
}
