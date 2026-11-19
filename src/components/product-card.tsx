"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import { useStore } from "@/components/store-provider";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWishlist } = useStore();
  const [quickOpen, setQuickOpen] = useState(false);
  const saved = wishlist.includes(product.id);
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];

  return (
    <article
      className="group flex flex-col"
      onMouseLeave={() => setQuickOpen(false)}
    >
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block">
          <ProductVisual product={product} />
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {soldOut ? (
            <span className="bg-ink/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Sold out
            </span>
          ) : lowStock ? (
            <span className="bg-wine px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white">
              Only {product.stock} left
            </span>
          ) : product.featured ? (
            <span className="bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-wine backdrop-blur-sm">
              Bestseller
            </span>
          ) : null}
        </div>

        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur-sm transition ${
            saved ? "bg-wine text-white" : "bg-white/85 text-ink hover:bg-wine hover:text-white"
          }`}
        >
          <span className="text-base leading-none">{saved ? "♥" : "♡"}</span>
        </button>

        {/* Quick-add bar on hover */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            {quickOpen ? (
              <div className="border border-line bg-[#fdfbf8]/95 p-2.5 shadow-panel backdrop-blur-sm">
                <p className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                  Quick add size
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        add(product, size);
                        setQuickOpen(false);
                      }}
                      className="min-w-8 border border-line bg-white px-2 py-1 text-[11px] font-medium transition hover:border-wine hover:bg-wine hover:text-white"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (sizes.length === 1) {
                    add(product, sizes[0]);
                  } else {
                    setQuickOpen(true);
                  }
                }}
                className="w-full bg-[#fdfbf8]/95 py-2.5 text-[11px] font-medium tracking-wide text-ink shadow-sm backdrop-blur-sm transition hover:bg-wine hover:text-white"
              >
                {sizes.length === 1 ? `+ Quick add (${sizes[0]})` : "+ Quick add to bag"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
            {product.collection} · {product.category}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="mt-1 block text-base font-medium leading-snug tracking-tight transition hover:text-wine"
          >
            {product.name}
          </Link>
        </div>
        <strong className="shrink-0 text-xs font-semibold text-ink">{formatPrice(product.price)}</strong>
      </div>
    </article>
  );
}
