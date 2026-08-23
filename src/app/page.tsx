import { Footer } from "@/components/footer";
import { HomeProducts } from "@/components/home-products";
import { SiteHeader } from "@/components/site-header";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { NewsletterForm } from "@/components/newsletter-form";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <div className="bg-wine px-3 py-2 text-center font-mono text-[8px] tracking-[.08em] text-[#f6dfe2] sm:px-5 sm:text-[9px] sm:tracking-[.1em]"><span className="sm:hidden">FREE DELIVERY OVER ৳5,000 · COD NATIONWIDE</span><span className="hidden sm:inline">COMPLIMENTARY DELIVERY OVER ৳5,000 &nbsp; · &nbsp; CASH ON DELIVERY AVAILABLE NATIONWIDE</span></div>
      <section className="relative min-h-[calc(100vh-152px)] overflow-hidden bg-blush">
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-152px)] max-w-7xl items-center px-5 py-20 sm:px-10"><div className="md:w-1/2"><p className="font-mono text-[10px] tracking-[.18em] text-stone-500">NEW SEASON · FESTIVE 2026</p><h1 className="mt-5 font-display text-6xl leading-[.92] tracking-[-.06em] sm:text-7xl">Made for<br /><em className="font-medium text-wine">your story.</em></h1><p className="mt-7 max-w-sm text-sm leading-6">Occasionwear designed in Dhaka and finished in small batches—for Eid mornings, wedding invitations and every beautiful plan in between.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="bg-wine px-5 py-4 text-xs text-white">Explore shop ↗</Link><Link href="/made-to-measure" className="border border-wine px-5 py-4 text-xs text-wine transition hover:bg-wine hover:text-white">Create your own →</Link></div><div className="mt-10 flex gap-5 font-mono text-[9px] tracking-wide text-stone-600"><span>✦ READY TO WEAR</span><span>✦ MADE TO ORDER</span></div></div></div>
        <div className="absolute inset-y-0 right-0 w-[60%] bg-[url('/rose-ensemble.png')] bg-cover bg-center md:w-[53%]" /><div className="absolute inset-y-0 right-[45%] w-20 bg-gradient-to-r from-blush to-transparent" />
      </section>
      <section className="bg-[#f4eee8] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] tracking-[.15em] text-stone-500">MOST LOVED THIS WEEK</p><h2 className="mt-4 font-display text-5xl tracking-tight">Bestsellers, <em className="text-wine">back in stock.</em></h2></div><Link href="/shop" className="border-b border-stone-400 pb-1 text-xs">See the full collection →</Link></div><HomeProducts /></div></section>
      <section className="border-y border-line bg-[#f8f3ed]"><div className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:grid-cols-3 sm:px-10"><Value number="01" title="Fit, considered" text="Size support and complimentary minor tailoring on selected pieces."/><Value number="02" title="Delivered with care" text="Nationwide delivery, secure packaging and simple order updates."/><Value number="03" title="Small-run craft" text="Thoughtful materials and limited production for pieces that last."/></div></section>
      <section className="mx-auto mt-16 max-w-7xl px-5 pb-24 sm:px-10"><div className="relative overflow-hidden bg-wine px-7 py-16 text-white sm:px-14 lg:px-20"><div className="relative z-10 max-w-xl"><p className="font-mono text-[10px] tracking-[.15em] text-[#e8b9c0]">MADE TO MEASURE</p><h2 className="mt-5 font-display text-5xl leading-[.95]">A piece that begins<br /><em>with you.</em></h2><p className="mt-6 max-w-md text-sm leading-6 text-[#f3dcd9]">Choose the silhouette, colour and fit. We&rsquo;ll take care of the details and create a garment that is unmistakably yours.</p><Link href="/made-to-measure" className="mt-8 inline-block bg-white px-5 py-4 text-xs text-wine">Start your design ↗</Link></div><img src="/product-anarkali.png" alt="Bespoke Noor occasionwear" className="absolute bottom-0 right-0 h-full w-[43%] object-cover object-top opacity-60 mix-blend-screen"/></div></section>
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-10"><div className="text-center"><p className="font-mono text-[10px] tracking-[.15em] text-stone-500">WORDS FROM OUR COMMUNITY</p><h2 className="mt-4 font-display text-5xl">Worn, loved, remembered.</h2></div><TestimonialCarousel /></section>
      <section className="border-y border-line bg-[#f8f3ed]"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-12 text-center sm:flex-row sm:px-10 sm:text-left"><div><p className="font-display text-3xl">A little note from Noor.</p><p className="mt-2 text-xs text-stone-600">New pieces, private previews, and stories from the atelier.</p></div><div className="w-full max-w-sm"><NewsletterForm/></div></div></section>
      <Footer />
    </main>
  );
}

function Value({ number, title, text }: { number: string; title: string; text: string }) { return <div className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line font-display text-lg text-wine">{number}</span><div><h3 className="font-display text-xl">{title}</h3><p className="mt-1 text-xs leading-5 text-stone-600">{text}</p></div></div>; }
