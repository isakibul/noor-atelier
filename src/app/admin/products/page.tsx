"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AVAILABLE_SIZES } from "@/lib/products";

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: "Women" | "Men";
  collection: string;
  price: number;
  stock: number;
  image: string;
  active: boolean;
  featured: boolean;
  description: string;
  sizes: string[];
};

const initial = {
  name: "",
  slug: "",
  category: "Women" as "Women" | "Men",
  collection: "Occasionwear",
  price: "",
  stock: "5",
  description: "",
  image: "",
  featured: false,
  active: true,
  sizes: ["S", "M", "L", "XL"] as string[],
};

const toSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const load = async () => {
    const response = await fetch("/api/admin/products");
    if (response.ok) setProducts(await response.json());
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/products").then(async response => {
      if (active && response.ok) setProducts(await response.json());
    });
    return () => { active = false; };
  }, []);

  const reset = () => {
    setForm(initial);
    setSlugTouched(false);
    setEditing(null);
    setMessage("");
  };

  const field = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const toggleSize = (size: string) => {
    setForm(current => {
      const exists = current.sizes.includes(size);
      const next = exists ? current.sizes.filter(s => s !== size) : [...current.sizes, size];
      return { ...current, sizes: next.length ? next : current.sizes };
    });
  };

  const upload = async (file: File) => {
    const data = new FormData();
    data.set("file", file);
    setBusy(true);
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(result.error || "Upload failed.");
      return;
    }
    setForm(current => ({ ...current, image: result.url }));
    setMessage("Image uploaded. Save changes to publish it.");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const successMessage = editing ? "Product updated." : "Product published.";
    setBusy(true);
    setMessage("");
    const response = await fetch(editing ? `/api/admin/products/${editing}` : "/api/admin/products", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(typeof result.error === "string" ? result.error : "Please check the product details.");
      return;
    }
    reset();
    setMessage(successMessage);
    load();
  };

  const edit = (product: Product) => {
    setEditing(product._id);
    setSlugTouched(true);
    setForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      collection: product.collection,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      image: product.image,
      featured: product.featured,
      active: product.active,
      sizes: product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async () => {
    if (!deleting) return;
    const response = await fetch(`/api/admin/products/${deleting._id}`, { method: "DELETE" });
    if (response.ok) {
      setProducts(items => items.filter(item => item._id !== deleting._id));
      if (editing === deleting._id) reset();
      setDeleting(null);
    } else {
      setMessage("Unable to delete this product.");
      setDeleting(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (q && !`${p.name} ${p.collection} ${p.slug}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [categoryFilter, products, search]);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[410px_1fr]">
        <section className="h-fit border border-line bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Catalogue</p>
              <h1 className="mt-2 text-3xl font-semibold">{editing ? "Edit product" : "Add product"}</h1>
            </div>
            {editing && (
              <button onClick={reset} className="border-b border-stone-400 pb-0.5 text-xs font-medium">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-3">
            <input
              value={form.name}
              onChange={e => {
                const value = e.target.value;
                setForm(current => ({
                  ...current,
                  name: value,
                  slug: !slugTouched ? toSlug(value) : current.slug,
                }));
              }}
              required
              placeholder="Product name"
              className="border border-line p-3 text-xs outline-wine"
            />
            <input
              value={form.slug}
              onChange={e => {
                setSlugTouched(true);
                field("slug", toSlug(e.target.value));
              }}
              required
              placeholder="product-slug"
              className="border border-line p-3 text-xs outline-wine"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.category}
                onChange={e => field("category", e.target.value as "Women" | "Men")}
                className="border border-line p-3 text-xs outline-wine"
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
              </select>
              <input
                value={form.collection}
                onChange={e => field("collection", e.target.value)}
                required
                placeholder="Collection (e.g. Occasionwear)"
                className="border border-line p-3 text-xs outline-wine"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.price}
                onChange={e => field("price", e.target.value)}
                required
                type="number"
                min="0"
                placeholder="Price (BDT)"
                className="border border-line p-3 text-xs outline-wine"
              />
              <input
                value={form.stock}
                onChange={e => field("stock", e.target.value)}
                required
                type="number"
                min="0"
                placeholder="Stock"
                className="border border-line p-3 text-xs outline-wine"
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">Available Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SIZES.map(size => {
                  const selected = form.sizes.includes(size);
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`border px-2.5 py-1.5 text-[11px] font-medium transition ${
                        selected
                          ? "border-wine bg-wine text-white"
                          : "border-line bg-[#faf7f3] text-stone-600 hover:border-wine"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={form.description}
              onChange={e => field("description", e.target.value)}
              required
              minLength={10}
              placeholder="Product description"
              className="min-h-24 border border-line p-3 text-xs outline-wine"
            />

            {form.image && <img src={form.image} alt="Selected product" className="h-36 w-full object-cover" />}
            <label className="cursor-pointer border border-dashed border-[#bda6a0] bg-[#faf7f3] p-4 text-center text-[11px] font-medium text-stone-600 transition hover:border-wine">
              {busy ? "Uploading…" : form.image ? "Replace product image" : "Upload product image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>

            <div className="flex gap-5 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  checked={form.featured}
                  onChange={e => field("featured", e.target.checked)}
                  type="checkbox"
                  className="accent-wine"
                />
                Featured
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  checked={form.active}
                  onChange={e => field("active", e.target.checked)}
                  type="checkbox"
                  className="accent-wine"
                />
                Visible in store
              </label>
            </div>

            <button
              disabled={busy || !form.image}
              className="mt-1 bg-wine py-4 text-xs font-medium text-white transition hover:bg-[#6d2038] disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Publish product"}
            </button>
            {message && <p className="text-xs font-medium text-wine">{message}</p>}
          </form>
        </section>

        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Inventory</p>
              <h2 className="mt-2 text-3xl font-semibold">All products</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                className="border border-line bg-white px-3 py-2 text-xs outline-wine"
              />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="border border-line bg-white px-3 py-2 text-xs outline-wine"
              >
                <option value="All">All categories</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto border border-line bg-white">
            <div className="grid min-w-[540px] grid-cols-[56px_1fr_90px_70px_86px] gap-3 border-b border-line px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">
              <span>Img</span>
              <span>Product</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Actions</span>
            </div>
            {filtered.map(product => (
              <div
                className={`grid min-w-[540px] grid-cols-[56px_1fr_90px_70px_86px] items-center gap-3 border-b border-line px-4 py-3 text-xs ${
                  editing === product._id ? "bg-[#f8f3ed]" : ""
                }`}
                key={product._id}
              >
                <img src={product.image} alt="" className="h-12 w-12 object-cover" />
                <div>
                  <strong className="font-semibold">{product.name}</strong>
                  <p className="mt-1 text-[10px] text-stone-500">
                    {product.category} · {product.collection} · {product.sizes.join(", ")} ·{" "}
                    <span className={product.active ? "text-[#1f6236]" : "text-stone-400"}>
                      {product.active ? "LIVE" : "HIDDEN"}
                    </span>
                    {product.featured ? " · FEATURED" : ""}
                  </p>
                </div>
                <span className="font-medium">৳ {product.price.toLocaleString()}</span>
                <span className={product.stock <= 3 ? "font-semibold text-wine" : ""}>{product.stock}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => edit(product)}
                    className="grid h-8 w-8 place-items-center border border-line text-wine transition hover:border-wine hover:bg-[#f8f3ed]"
                    aria-label={`Edit ${product.name}`}
                    title="Edit product"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleting(product)}
                    className="grid h-8 w-8 place-items-center border border-line text-stone-500 transition hover:border-wine hover:bg-[#f8f3ed] hover:text-wine"
                    aria-label={`Delete ${product.name}`}
                    title="Delete product"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <p className="p-8 text-xs text-stone-500">No products match your filter.</p>
            )}
          </div>
        </section>
      </div>

      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5" role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
          <div className="w-full max-w-md border border-line bg-[#fdfaf7] p-6 shadow-panel">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Remove Product</p>
            <h2 id="delete-product-title" className="mt-3 text-2xl font-semibold">Delete {deleting.name}?</h2>
            <p className="mt-3 text-xs leading-6 text-stone-600">
              This permanently removes the product from the catalogue and storefront. This action cannot be undone.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="border border-line px-4 py-3 text-xs font-medium">
                Keep product
              </button>
              <button onClick={remove} className="bg-wine px-4 py-3 text-xs font-medium text-white">
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
