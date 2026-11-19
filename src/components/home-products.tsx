"use client";

import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-skeleton";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/products";

export function HomeProducts({ initialProducts }: { initialProducts?: Product[] }) {
  const { products: fetchedProducts, loading } = useProducts();
  const source = initialProducts && initialProducts.length ? initialProducts : fetchedProducts;
  const featured = source.filter(product => product.featured).slice(0, 3);
  const display = (featured.length ? featured : source).slice(0, 3);

  if (!initialProducts && loading) return <ProductGridSkeleton count={3} />;
  if (!display.length) {
    return <p className="mt-10 text-sm text-stone-500">New seasonal pieces are arriving soon.</p>;
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-3">
      {display.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
