import Link from "next/link";
import { Footer } from "@/components/footer";
import { HomeProducts } from "@/components/home-products";
import { NewsletterForm } from "@/components/newsletter-form";
import { SiteHeader } from "@/components/site-header";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { getActiveProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

const edits = [
  {
    eyebrow: "WOMEN · OCCASIONWEAR",
    title: "Festive Anarkalis & Ensembles",
    subtitle: "Fluid silhouettes hand-finished with antique zari and organza drapes.",
    href: "/shop?category=Women&collection=Occasionwear",
    image: "/product-anarkali.png",
  },
  {
    eyebrow: "HERITAGE EDIT",
    title: "Dhaka Jamdani & Sarees",
    subtitle: "Heirloom weaves crafted in small runs with artisan textile houses.",
    href: "/shop?collection=Heritage+Edit",
    image: "/product-saree.png",
  },
  {
    eyebrow: "MEN · TAILORED",
    title: "Raw Silk & Linen Panjabis",
    subtitle: "Breathable natural fibres cut with crisp collars and subtle resham.",
    href: "/shop?category=Men",
    image: "/product-panjabi.png",
  },
];

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <main>
      <SiteHeader />
      <div className="bg-wine px-3 py-2.5 text-center text-[10px] font-medium tracking-[0.14em] text-[#f6dfe2] sm:px-5">
        <span className="sm:hidden">FREE DELIVERY OVER ৳5,000 · CASH ON DELIVERY ONLY</span>
        <span className="hidden sm:inline">
          COMPLIMENTARY DELIVERY OVER ৳5,000 &nbsp; · &nbsp; CASH ON DELIVERY NATIONWIDE &nbsp; · &nbsp; USE CODE NOOR10 FOR 10% OFF
        </span>
      </div>

      {/* Hero */}
      <section className="relative min-h-[calc(100vh-152px)] overflow-hidden bg-blush">
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-152px)] max-w-7xl items-center px-5 py-20 sm:px-10">
          <div className="max-w-lg md:w-1/2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-600">
              New Season · Festive 2026
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Made for<br />
              <em className="font-normal text-wine">your story.</em>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-stone-700">
              Occasionwear designed in Dhaka and finished in small batches—for Eid mornings, wedding invitations, and every beautiful plan in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="bg-wine px-6 py-4 text-xs font-medium tracking-wide text-white transition hover:bg-[#6d2038]"
              >
                Explore shop ↗
              </Link>
              <Link
                href="/made-to-measure"
                className="border border-wine bg-white/40 px-6 py-4 text-xs font-medium tracking-wide text-wine backdrop-blur-sm transition hover:bg-wine hover:text-white"
              >
                Create your own →
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-600">
              <span>✦ Ready to wear</span>
              <span>✦ Made to measure</span>
              <span>✦ Cash on delivery</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-[58%] bg-[url('/rose-ensemble.png')] bg-cover bg-center md:w-[53%]" />
        <div className="absolute inset-y-0 right-[45%] w-28 bg-gradient-to-r from-blush to-transparent" />
      </section>

      {/* Bestsellers */}
      <section className="bg-[#f4eee8] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                Most Loved This Week
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Bestsellers, <em className="font-normal text-wine">back in stock.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              className="self-start border-b border-stone-400 pb-1 text-xs font-medium transition hover:border-wine hover:text-wine sm:self-auto"
            >
              See the full collection →
            </Link>
          </div>
          <HomeProducts initialProducts={products} />
        </div>
      </section>

      {/* Shop by Edit */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Curated Edits</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Explore by <em className="font-normal text-wine">mood & craft.</em>
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-6 text-stone-600">
            Every silhouette is cut in limited quantities so your piece feels personal at every gathering.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {edits.map(edit => (
            <Link
              key={edit.title}
              href={edit.href}
              className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden bg-[#ebe2da] p-7 text-white"
            >
              <img
                src={edit.image}
                alt={edit.title}
                className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
              <div className="relative z-10">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#f2d0d5]">{edit.eyebrow}</p>
                <h3 className="mt-2 text-2xl font-semibold leading-snug">{edit.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/85">{edit.subtitle}</p>
                <span className="mt-4 inline-block border-b border-white/70 pb-0.5 text-xs font-medium transition group-hover:border-white">
                  Explore edit →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-line bg-[#f8f3ed]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-12 sm:grid-cols-3 sm:px-10">
          <Value
            number="01"
            title="Fit, considered"
            text="Interactive size guidance and complimentary minor tailoring on selected pieces."
          />
          <Value
            number="02"
            title="Pay on delivery"
            text="Nationwide Cash on Delivery with complimentary shipping on orders over ৳ 5,000."
          />
          <Value
            number="03"
            title="Small-run craft"
            text="Thoughtful natural fabrics and limited production for garments made to keep."
          />
        </div>
      </section>

      {/* Bespoke banner */}
      <section className="mx-auto mt-16 max-w-7xl px-5 pb-24 sm:px-10">
        <div className="relative overflow-hidden bg-wine px-7 py-16 text-white sm:px-14 lg:px-20">
          <div className="relative z-10 max-w-xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#e8b9c0]">Made To Measure</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              A piece that begins<br />
              <em className="font-normal">with you.</em>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#f3dcd9]">
              Choose the silhouette, colour, and fit. Our Dhaka atelier will follow up personally to craft a garment that is unmistakably yours.
            </p>
            <Link
              href="/made-to-measure"
              className="mt-8 inline-block bg-white px-6 py-4 text-xs font-medium text-wine transition hover:bg-[#f8f3ed]"
            >
              Start your design ↗
            </Link>
          </div>
          <img
            src="/product-anarkali.png"
            alt="Bespoke Noor occasionwear"
            className="absolute bottom-0 right-0 h-full w-[43%] object-cover object-top opacity-60 mix-blend-screen"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-10">
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
            Words From Our Community
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Worn, loved, remembered.</h2>
        </div>
        <TestimonialCarousel />
      </section>

      {/* Newsletter */}
      <section className="border-y border-line bg-[#f8f3ed]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-12 text-center sm:flex-row sm:px-10 sm:text-left">
          <div>
            <p className="text-2xl font-semibold tracking-tight">A little note from Noor.</p>
            <p className="mt-1.5 text-xs text-stone-600">
              New pieces, private previews, and stories from the atelier.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Value({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-sm font-semibold text-wine">
        {number}
      </span>
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-xs leading-6 text-stone-600">{text}</p>
      </div>
    </div>
  );
}
