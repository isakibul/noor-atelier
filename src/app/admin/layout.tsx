import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="min-h-screen bg-[#f5f2ed] text-ink"><header className="border-b border-line bg-white"><div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3"><Link href="/admin" className="shrink-0 whitespace-nowrap font-display text-xl sm:text-2xl">Noor <i>Admin</i></Link><div className="flex items-center gap-3 text-xs sm:gap-5"><span className="hidden text-stone-500 lg:inline">{admin.email}</span><Link href="/admin/products" className="whitespace-nowrap transition hover:text-wine">Products</Link><Link href="/" className="whitespace-nowrap transition hover:text-wine"><span className="sm:hidden">Store ↗</span><span className="hidden sm:inline">View store ↗</span></Link></div></div></header><main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">{children}</main></div>;
}
