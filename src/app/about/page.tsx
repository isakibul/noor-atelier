import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return <main className="flex min-h-screen flex-col"><SiteHeader/><section className="mx-auto w-full max-w-5xl flex-1 px-5 py-20 sm:px-10"><p className="font-mono text-[10px] tracking-[.15em] text-stone-500">OUR STORY</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.95] sm:text-6xl">Designed for the moments <em className="text-wine">you remember.</em></h1><div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-2"><p className="text-sm leading-7 text-stone-600">Noor Atelier is a Dhaka-based occasionwear studio. We create small-run pieces with an eye for graceful silhouettes, thoughtful detail and the feeling of getting dressed for something meaningful.</p><p className="text-sm leading-7 text-stone-600">From ready-to-wear edits to made-to-measure designs, every piece begins with care and is finished for your story.</p></div></section><Footer/></main>;
}
