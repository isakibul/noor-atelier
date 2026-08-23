"use client";

import { useStore } from "@/components/store-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/made-to-measure", label: "Customize" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: "customer" | "admin" } | null | undefined>(undefined);
  const pathname = usePathname();
  const { cart, hydrated } = useStore();
  const count = hydrated
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => {
      setIsMobile(media.matches);
      if (!media.matches) setOpen(false);
    };
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);
  useEffect(() => { fetch("/api/auth/me").then(response => response.ok ? response.json() : { user: null }).then(data => setUser(data.user ?? null)).catch(() => setUser(null)); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousBodyOverflow; document.documentElement.style.overflow = previousHtmlOverflow; };
  }, [open]);
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); setProfileOpen(false); setOpen(false); window.location.assign("/"); };
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#fdfbf8]/95 shadow-[0_2px_18px_rgba(50,20,20,.04)] backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 py-3 lg:px-10">
        <div className="flex min-h-14 items-center justify-between gap-5">
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap font-display text-xl font-semibold tracking-tight sm:text-2xl"
          >
            <span className="mr-2 inline-grid h-8 w-6 place-items-center bg-wine text-base text-white [clip-path:polygon(50%_0,74%_13%,76%_87%,50%_100%,24%_87%,26%_13%)]">
              N
            </span>
            Noor <i className="font-medium">Atelier</i>
          </Link>
          {!isMobile && (
            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-1 rounded-full border border-line bg-parchment p-1 text-xs"
            >
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 transition ${active ? "bg-wine text-white shadow-sm" : "text-stone-600 hover:bg-white hover:text-wine"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="flex shrink-0 items-center gap-2 text-ink">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden h-10 w-10 place-items-center rounded-full border border-line text-lg transition hover:border-wine hover:text-wine md:grid"
            >
              ♡
            </Link>
            <div className="relative">
              <button onClick={() => setProfileOpen((value) => !value)} aria-label="Open profile menu" aria-expanded={profileOpen} className={`grid h-10 w-10 place-items-center rounded-full border text-xs transition ${user ? "border-wine bg-wine text-white" : "border-line hover:border-wine hover:text-wine"}`}>{user ? user.name.charAt(0).toUpperCase() : <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.5 3-5.2 7-5.2s6.3 1.7 7 5.2"/></svg>}</button>
              {profileOpen && <div className="absolute right-0 top-12 z-50 w-56 border border-line bg-white p-2 shadow-panel">{user ? <><div className="border-b border-line px-3 py-3"><p className="font-display text-lg">{user.name}</p><p className="mt-1 truncate font-mono text-[9px] text-stone-500">{user.email}</p></div><Link href="/account" onClick={() => setProfileOpen(false)} className="mt-1 block rounded-lg px-3 py-2 text-xs hover:bg-[#f5f2ed]">My account</Link>{user.role === "admin" && <Link href="/admin" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-wine hover:bg-[#f5f2ed]">Admin dashboard ↗</Link>}<button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-[#f5f2ed]">Sign out</button></> : <><p className="px-3 py-3 font-display text-lg">Welcome to Noor</p><Link href="/login" onClick={() => setProfileOpen(false)} className="block rounded-lg bg-wine px-3 py-2 text-center text-xs text-white">Sign in</Link><Link href="/register" onClick={() => setProfileOpen(false)} className="mt-1 block rounded-lg px-3 py-2 text-center text-xs hover:bg-[#f5f2ed]">Create account</Link></>}</div>}
            </div>
            <Link
              href="/cart"
              aria-label={`Shopping bag, ${count} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-line transition hover:border-wine hover:bg-wine hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#fdfbf8] bg-wine px-1 font-mono text-[9px] text-white">
                  {count}
                </span>
              )}
            </Link>
            {isMobile && (
              <button
                aria-label="Open navigation menu"
                aria-expanded={open}
                className="grid h-10 w-10 place-items-center rounded-full border border-line text-lg"
                onClick={() => setOpen((value) => !value)}
              >
                ☰
              </button>
            )}
          </div>
        </div>
      </div>
      {isMobile && open && (
        <nav aria-label="Mobile navigation" className="fixed left-0 top-0 z-[100] flex h-[100dvh] w-screen flex-col overflow-y-auto bg-[#fdfbf8] text-ink">
          <div className="flex h-20 items-center justify-between border-b border-line px-5"><Link href="/" onClick={() => setOpen(false)} className="font-display text-2xl"><span className="mr-2 inline-grid h-8 w-6 place-items-center bg-wine text-base text-white [clip-path:polygon(50%_0,74%_13%,76%_87%,50%_100%,24%_87%,26%_13%)]">N</span>Noor <i>Atelier</i></Link><button aria-label="Close navigation menu" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-line text-2xl leading-none">×</button></div>
          <div className="flex flex-1 flex-col px-7 pt-10"><p className="font-mono text-[10px] tracking-[.16em] text-stone-500">EXPLORE NOOR</p><div className="mt-7 flex flex-col border-t border-line">{navItems.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-line py-5 font-display text-3xl transition hover:text-wine"><span>{item.label}</span><span className="font-mono text-[10px] text-stone-400">0{index + 1}</span></Link>)}<Link href="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-line py-5 font-display text-3xl transition hover:text-wine"><span>Wishlist</span><span className="font-mono text-[10px] text-stone-400">05</span></Link>{user?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-line py-5 font-display text-3xl text-wine"><span>Admin dashboard</span><span className="font-mono text-[10px] text-stone-400">06</span></Link>}</div>{user ? <button onClick={logout} className="mt-8 border-b border-wine pb-1 self-start text-xs text-wine">Sign out</button> : <div className="mt-8 flex gap-3"><Link href="/login" onClick={() => setOpen(false)} className="bg-wine px-5 py-3 text-xs text-white">Sign in</Link><Link href="/register" onClick={() => setOpen(false)} className="border border-line px-5 py-3 text-xs">Create account</Link></div>}</div>
          <div className="border-t border-line px-7 py-6 font-mono text-[10px] tracking-wide text-stone-500">HELLO@NOOR.EXAMPLE &nbsp; · &nbsp; DHAKA, BANGLADESH</div>
        </nav>
      )}
    </header>
  );
}
