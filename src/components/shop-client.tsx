"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export function ShopClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [collection, setCollection] = useState(searchParams.get("collection") || "All");
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "featured");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "1");

  const collections = useMemo(() => {
    const unique = Array.from(new Set(initialProducts.map(product => product.collection))).sort();
    return ["All", ...unique];
  }, [initialProducts]);

  const syncUrl = (next: {
    category?: string;
    collection?: string;
    sort?: SortOption;
    q?: string;
    inStock?: boolean;
  }) => {
    const params = new URLSearchParams();
    const c = next.category ?? category;
    const col = next.collection ?? collection;
    const s = next.sort ?? sort;
    const q = next.q ?? search;
    const stock = next.inStock ?? inStockOnly;
    if (c !== "All") params.set("category", c);
    if (col !== "All") params.set("collection", col);
    if (s !== "featured") params.set("sort", s);
    if (q.trim()) params.set("q", q.trim());
    if (stock) params.set("inStock", "1");
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  };

  const displayed = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    const filtered = initialProducts.filter(product => {
      if (category !== "All" && product.category !== category) return false;
      if (collection !== "All" && product.collection !== collection) return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (
        queryText &&
        !`${product.name} ${product.collection} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(queryText)
      ) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "newest") sorted.sort((a, b) => Number(b.id) - Number(a.id));
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.id) - Number(a.id));

    return sorted;
  }, [category, collection, inStockOnly, initialProducts, search, sort]);

  const hasActiveFilters =
    category !== "All" || collection !== "All" || sort !== "featured" || search.trim() !== "" || inStockOnly;

  const clearFilters = () => {
    setCategory("All");
    setCollection("All");
    setSort("featured");
    setSearch("");
    setInStockOnly(false);
    router.replace("/shop", { scroll: false });
  };

  return (
    <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">The Noor Collection</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Shop all pieces</h1>
        </div>
        <p className="text-xs text-stone-500">
          Cash on delivery nationwide · Complimentary shipping over ৳ 5,000
        </p>
      </div>

      {/* Filter & search bar */}
      <div className="mt-8 space-y-4 border-y border-line py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Women", "Men"].map(item => (
              <button
                key={item}
                onClick={() => {
                  setCategory(item);
                  syncUrl({ category: item });
                }}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  category === item
                    ? "bg-wine text-white"
                    : "border border-line bg-white text-stone-600 hover:border-wine hover:text-wine"
                }`}
              >
                {item === "All" ? "All genders" : item}
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-line sm:inline-block" />
            {collections.map(item => (
              <button
                key={item}
                onClick={() => {
                  setCollection(item);
                  syncUrl({ collection: item });
                }}
                className={`px-2 py-1 text-xs transition ${
                  collection === item
                    ? "border-b-2 border-wine font-medium text-wine"
                    : "text-stone-500 hover:text-wine"
                }`}
              >
                {item === "All" ? "All edits" : item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                syncUrl({ q: event.target.value });
              }}
              placeholder="Search silhouettes, fabrics…"
              className="w-full border border-line bg-white px-3.5 py-2 text-xs outline-wine sm:w-56"
            />
            <select
              aria-label="Sort products"
              value={sort}
              onChange={event => {
                const next = event.target.value as SortOption;
                setSort(next);
                syncUrl({ sort: next });
              }}
              className="border border-line bg-white px-3 py-2 text-xs outline-wine"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
              {displayed.length} {displayed.length === 1 ? "piece" : "pieces"}
            </span>
            <label className="flex cursor-pointer items-center gap-2 text-stone-600">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={event => {
                  setInStockOnly(event.target.checked);
                  syncUrl({ inStock: event.target.checked });
                }}
                className="accent-wine"
              />
              In stock only
            </label>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="border-b border-wine pb-0.5 text-xs font-medium text-wine"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {displayed.length ? (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="my-16 border border-line bg-[#f8f3ed] p-12 text-center">
          <h2 className="text-2xl font-semibold">No pieces match your filter</h2>
          <p className="mt-2 text-xs text-stone-600">
            Try clearing one of your filters or searching a different keyword.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 bg-wine px-5 py-3 text-xs font-medium text-white"
          >
            Show full collection
          </button>
        </div>
      )}
    </section>
  );
}
