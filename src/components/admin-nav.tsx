"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/bespoke", label: "Bespoke" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/admins", label: "Admins" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="flex flex-wrap items-center gap-1 rounded-full border border-line bg-parchment p-1 text-xs font-medium"
    >
      {adminNav.map(item => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 transition ${
              active
                ? "bg-wine text-white shadow-sm"
                : "text-stone-600 hover:bg-white hover:text-wine"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
