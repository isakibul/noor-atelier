"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";

export function useProducts(slug?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/products${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`, { cache: "no-store" })
      .then(async response => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error("Unable to load the collection.");
        return data as Product[];
      })
      .then(data => { if (active) setProducts(data); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "Unable to load the collection."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return { products, loading, error };
}
