"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { useStore } from "@/components/store-provider";
import { formatPrice, type Product } from "@/lib/products";

const SIZE_ROWS_IN = [
  { size: "XS", chest: "32–34", waist: "26–28", hip: "35–37", length: "42–46" },
  { size: "S", chest: "34–36", waist: "28–30", hip: "37–39", length: "43–47" },
  { size: "M", chest: "36–38", waist: "30–32", hip: "39–41", length: "44–48" },
  { size: "L", chest: "38–41", waist: "32–35", hip: "41–44", length: "45–49" },
  { size: "XL", chest: "41–44", waist: "35–38", hip: "44–47", length: "46–50" },
  { size: "XXL", chest: "44–47", waist: "38–41", hip: "47–50", length: "46–51" },
];

const SIZE_ROWS_CM = [
  { size: "XS", chest: "81–86", waist: "66–71", hip: "89–94", length: "107–117" },
  { size: "S", chest: "86–91", waist: "71–76", hip: "94–99", length: "109–119" },
  { size: "M", chest: "91–97", waist: "76–81", hip: "99–104", length: "112–122" },
  { size: "L", chest: "97–104", waist: "81–89", hip: "104–112", length: "114–124" },
  { size: "XL", chest: "104–112", waist: "89–97", hip: "112–119", length: "117–127" },
  { size: "XXL", chest: "112–119", waist: "97–104", hip: "119–127", length: "117–130" },
];

const ACCORDIONS = [
  {
    id: "craft",
    title: "Fabric & Care",
    body: "Crafted in breathable natural blends and hand-inspected at our Dhaka atelier. Dry clean recommended for zari, silk, and organza finishes; steam gently on low heat.",
  },
  {
    id: "tailoring",
    title: "Fit & Complimentary Tailoring",
    body: "Need a subtle hem or sleeve adjustment? Mention your measurements in the delivery notes at checkout or book a made-to-measure consultation for custom proportions.",
  },
  {
    id: "delivery",
    title: "Delivery & Cash on Delivery",
    body: "Orders are dispatched within 2–4 working days across Bangladesh. Complimentary delivery on orders over ৳ 5,000 (৳ 120 standard below). Cash on Delivery only — pay comfortably when your parcel arrives.",
  },
];

export function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  const [size, setSize] = useState(sizes.includes("M") ? "M" : sizes[0]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [openAccordion, setOpenAccordion] = useState<string>("craft");
  const { add, wishlist, toggleWishlist } = useStore();

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const saved = wishlist.includes(product.id);
  const rows = unit === "in" ? SIZE_ROWS_IN : SIZE_ROWS_CM;

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2 lg:gap-14 lg:px-10">
        <div className="space-y-4">
          <ProductVisual product={product} large />
          <div className="grid grid-cols-3 gap-3 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-stone-600">
            <div className="border border-line bg-[#f8f3ed] p-3">Small-batch Dhaka craft</div>
            <div className="border border-line bg-[#f8f3ed] p-3">Cash on delivery only</div>
            <div className="border border-line bg-[#f8f3ed] p-3">7-day easy exchange</div>
          </div>
        </div>

        <div className="py-1">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500 transition hover:text-wine">
              ← Back to shop
            </Link>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
                soldOut
                  ? "bg-stone-200 text-stone-600"
                  : lowStock
                    ? "bg-blush text-wine"
                    : "bg-[#eaf3ec] text-[#245a36]"
              }`}
            >
              {soldOut ? "Sold out" : lowStock ? `Only ${product.stock} left` : `In stock (${product.stock})`}
            </span>
          </div>

          <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
            {product.collection} · {product.category}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-xl font-semibold text-wine">{formatPrice(product.price)}</p>
          <p className="mt-1 text-xs text-stone-500">
            {product.price >= 5000 ? "Qualifies for complimentary nationwide delivery" : "Complimentary delivery on orders over ৳ 5,000"}
          </p>

          <p className="mt-7 max-w-lg text-sm leading-7 text-stone-600">
            {product.description} Every Noor piece is checked by hand before it leaves our atelier.
          </p>

          {/* Sizes */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-600">
                Select size: <span className="text-ink">{size}</span>
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="border-b border-stone-400 pb-0.5 text-xs font-medium text-stone-600 transition hover:border-wine hover:text-wine"
              >
                Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  className={`min-w-11 border px-3.5 py-2.5 text-xs font-medium transition ${
                    size === item
                      ? "border-wine bg-wine text-white"
                      : "border-line bg-white text-ink hover:border-wine"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => add(product, size)}
              className="flex-1 bg-wine py-4 text-xs font-medium tracking-wide text-white transition hover:bg-[#6d2038] disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {soldOut ? "Currently sold out" : `Add to bag · ${formatPrice(product.price)}`}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              className={`grid w-14 place-items-center border text-xl transition ${
                saved ? "border-wine bg-blush text-wine" : "border-line bg-white hover:border-wine hover:text-wine"
              }`}
            >
              {saved ? "♥" : "♡"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border border-line bg-[#f8f3ed] px-4 py-3 text-xs text-stone-600">
            <span>Need custom measurements for this silhouette?</span>
            <Link href="/made-to-measure" className="font-medium text-wine underline-offset-4 hover:underline">
              Request bespoke →
            </Link>
          </div>

          {/* Accordions */}
          <div className="mt-8 divide-y divide-line border-y border-line">
            {ACCORDIONS.map(item => {
              const isOpen = openAccordion === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(isOpen ? "" : item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide"
                  >
                    <span>{item.title}</span>
                    <span className="text-base text-stone-400">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <p className="pb-4 text-xs leading-6 text-stone-600">{item.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-line bg-[#f4eee8] py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Complete The Look</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">You may also like</h2>
              </div>
              <Link href="/shop" className="border-b border-stone-400 pb-0.5 text-xs font-medium hover:border-wine hover:text-wine">
                View all →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Size guide modal */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
        >
          <div className="w-full max-w-xl border border-line bg-[#fdfbf8] p-6 shadow-panel sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Noor Fit Guide</p>
                <h2 id="size-guide-title" className="mt-2 text-2xl font-semibold">Size measurements</h2>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Close size guide"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg hover:border-wine hover:text-wine"
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-stone-600">Body measurements for ready-to-wear silhouettes.</p>
              <div className="inline-flex border border-line bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setUnit("in")}
                  className={`px-3 py-1.5 font-medium ${unit === "in" ? "bg-wine text-white" : "text-stone-600"}`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("cm")}
                  className={`px-3 py-1.5 font-medium ${unit === "cm" ? "bg-wine text-white" : "text-stone-600"}`}
                >
                  CM
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto border border-line bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-[#f8f3ed] text-[10px] uppercase tracking-[0.12em] text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Chest ({unit})</th>
                    <th className="px-4 py-3">Waist ({unit})</th>
                    <th className="px-4 py-3">Hip ({unit})</th>
                    <th className="px-4 py-3">Length ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map(row => (
                    <tr key={row.size} className={row.size === size ? "bg-blush/40 font-medium" : ""}>
                      <td className="px-4 py-2.5 font-semibold text-wine">{row.size}</td>
                      <td className="px-4 py-2.5">{row.chest}</td>
                      <td className="px-4 py-2.5">{row.waist}</td>
                      <td className="px-4 py-2.5">{row.hip}</td>
                      <td className="px-4 py-2.5">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-5 text-stone-500">
              Sarees are 5.5 metres with an unstitched 0.85m blouse piece (Free Size). Between sizes? Size up for comfort or request custom tailoring in our{" "}
              <Link href="/made-to-measure" onClick={() => setSizeGuideOpen(false)} className="font-medium text-wine underline">
                Made to Measure
              </Link>{" "}
              studio.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
