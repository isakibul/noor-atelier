import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { ShopClient } from "@/components/shop-client";
import { SiteHeader } from "@/components/site-header";
import { getActiveProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop — Noor Atelier",
  description: "Explore ready-to-wear and festive occasionwear crafted in Dhaka.",
};

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto w-full max-w-7xl flex-1 px-5 py-16 sm:px-10"><ProductGridSkeleton count={6} /></div>}>
        <ShopClient initialProducts={products} />
      </Suspense>
      <Footer />
    </main>
  );
}
