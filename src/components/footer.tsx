import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

const shopLinks = [
  { href: "/shop?sort=newest", label: "New arrivals" },
  { href: "/shop?collection=Occasionwear", label: "Occasionwear" },
  { href: "/shop?collection=Heritage+Edit", label: "Heritage Edit" },
  { href: "/shop?collection=Modern+classics", label: "Modern classics" },
  { href: "/made-to-measure", label: "Made to measure" },
];

const serviceLinks = [
  { href: "/about", label: "Our Dhaka atelier" },
  { href: "/made-to-measure", label: "Private tailoring" },
  { href: "/account", label: "Track your orders" },
  { href: "mailto:hello@noor.example", label: "Contact concierge", external: true },
];

export function Footer() {
  return (
    <footer className="bg-wine pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        <div className="grid gap-12 border-b border-[#833a4c] pb-14 md:grid-cols-2 lg:grid-cols-[1.25fr_.8fr_.8fr_1.25fr]">
          <div>
            <Link href="/" className="text-2xl font-semibold tracking-tight">
              Noor <i className="font-normal">Atelier</i>
            </Link>
            <p className="mt-5 max-w-xs text-lg font-medium leading-snug text-[#fff6f4]">
              Made for the moments<br />you&rsquo;ll remember.
            </p>
            <p className="mt-4 max-w-xs text-xs leading-6 text-[#e8bac1]">
              Thoughtfully designed occasionwear, crafted in small runs in Dhaka with complimentary delivery over ৳ 5,000 and cash on delivery nationwide.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#e8bac1]">Shop</h3>
            <nav className="mt-5 flex flex-col gap-3 text-xs text-[#f7dadd]">
              {shopLinks.map(link => (
                <Link key={link.label} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#e8bac1]">Customer Care</h3>
            <nav className="mt-5 flex flex-col gap-3 text-xs text-[#f7dadd]">
              {serviceLinks.map(link =>
                link.external ? (
                  <a key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#e8bac1]">A Note From Noor</h3>
            <p className="mt-5 text-xs leading-6 text-[#f7dadd]">
              Private previews, new arrivals and small stories from the atelier.
            </p>
            <div className="mt-5">
              <NewsletterForm dark />
            </div>
            <div className="mt-6 flex gap-4 text-[10px] font-medium tracking-[0.14em] text-[#f7dadd]">
              <span>INSTAGRAM</span>
              <span>PINTEREST</span>
              <span>FACEBOOK</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 py-5 text-[10px] tracking-[0.12em] text-[#d99aa5] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 NOOR ATELIER. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-5">
            <span>CASH ON DELIVERY ONLY</span>
            <span>DESIGNED IN DHAKA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
