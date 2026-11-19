"use client";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { SiteHeader } from "@/components/site-header";
import { useStore } from "@/components/store-provider";
import { useProducts } from "@/hooks/use-products";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const { products, loading } = useProducts();
  const items = products.filter(product => wishlist.includes(product.id));

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-16 sm:px-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Saved For Later</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Your wishlist</h1>
        {loading ? (
          <ProductGridSkeleton count={3} />
        ) : items.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-semibold">A place for pieces you love.</h2>
            <p className="mt-2 text-xs text-stone-500">Tap the heart on any silhouette to save it here.</p>
            <Link href="/shop" className="mt-6 inline-block bg-wine px-6 py-3.5 text-xs font-medium text-white">
              Explore the collection →
            </Link>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
