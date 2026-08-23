import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export default async function AdminPage() {
  await connectDb();
  const [products, orders, pending, revenue] = await Promise.all([Product.countDocuments(), Order.countDocuments(), Order.countDocuments({ status: "pending" }), Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$subtotal" } } }])]);
  const stats = [["Products", products], ["Orders", orders], ["Awaiting action", pending], ["Sales", `৳ ${(revenue[0]?.total || 0).toLocaleString()}`]];
  return <><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] tracking-[.14em] text-stone-500">NOOR ATELIER / ADMIN</p><h1 className="mt-3 font-display text-4xl sm:text-5xl">Dashboard</h1></div><Link href="/admin/products" className="self-start bg-wine px-4 py-3 text-xs text-white sm:self-auto">Manage products</Link></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <div key={label as string} className="border border-line bg-white p-5"><p className="font-mono text-[10px] text-stone-500">{label}</p><strong className="mt-4 block font-display text-3xl">{value as string}</strong></div>)}</div><section className="mt-10 max-w-2xl border border-line bg-white p-6"><h2 className="font-display text-3xl">Manage your catalogue</h2><p className="mt-3 text-sm leading-6 text-stone-600">Upload product imagery, set stock levels, control storefront visibility, and publish new pieces from one protected area.</p><Link href="/admin/products" className="mt-6 inline-block border-b border-wine pb-1 text-xs text-wine">Manage products →</Link></section></>;
}
