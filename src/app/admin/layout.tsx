import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/admin" className="shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:text-2xl">
              Noor <i className="font-normal text-wine">Admin</i>
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden text-stone-500 lg:inline">{admin.email}</span>
            <Link href="/" className="whitespace-nowrap font-medium text-wine transition hover:underline">
              View store ↗
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">{children}</main>
    </div>
  );
}
