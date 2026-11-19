"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";

export function useProducts(slug?: string) {
  const key = slug ?? "";
  const [state, setState] = useState<{ key: string | null; products: Product[]; error: string }>({
    key: null,
    products: [],
    error: "",
  });

  useEffect(() => {
    let active = true;
    fetch(`/api/products${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`, { cache: "no-store" })
      .then(async response => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error("Unable to load the collection.");
        return data as Product[];
      })
      .then(products => { if (active) setState({ key, products, error: "" }); })
      .catch(error => { if (active) setState({ key, products: [], error: error instanceof Error ? error.message : "Unable to load the collection." }); });
    return () => { active = false; };
  }, [key, slug]);

  const loading = state.key !== key;
  return {
    products: loading ? [] : state.products,
    loading,
    error: loading ? "" : state.error,
  };
}
