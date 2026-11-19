import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ProductDetailClient } from "@/components/product-detail-client";
import { SiteHeader } from "@/components/site-header";
import { getProductBySlug, getRelatedProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Piece not found — Noor Atelier" };
  }
  return {
    title: `${product.name} — Noor Atelier`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-28 sm:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">404</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Piece not found.</h1>
          <p className="mt-3 text-sm text-stone-600">This silhouette may have sold out or been archived from the edit.</p>
          <Link className="mt-6 inline-block bg-wine px-6 py-3.5 text-xs font-medium text-white" href="/shop">
            Return to shop →
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const related = await getRelatedProducts(product, 3);

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <ProductDetailClient product={product} related={related} />
      <Footer />
    </main>
  );
}
