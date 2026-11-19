import Link from "next/link";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

type DashboardSummary = {
  products: number;
  orders: number;
  pending: number;
  revenue: number;
  bespokeNew: number;
  subscribers: number;
};

type RecentOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  subtotal: number;
  status: string;
  createdAt: string;
};

type LowStockProduct = {
  id: number;
  name: string;
  collection: string;
  stock: number;
  price: number;
};

export default async function AdminPage() {
  const [summary] = await query<DashboardSummary[]>(
    `SELECT
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM \`orders\`) AS orders,
      (SELECT COUNT(*) FROM \`orders\` WHERE status = 'pending') AS pending,
      (SELECT COALESCE(SUM(CASE WHEN total > 0 THEN total ELSE subtotal END), 0) FROM \`orders\` WHERE status <> 'cancelled') AS revenue,
      (SELECT COUNT(*) FROM bespoke_requests WHERE status = 'new') AS bespokeNew,
      (SELECT COUNT(*) FROM newsletter_subscribers) AS subscribers`,
  );

  const recentOrders = await query<RecentOrder[]>(
    "SELECT id, order_number AS orderNumber, customer_name AS customerName, total, subtotal, status, created_at AS createdAt FROM `orders` ORDER BY created_at DESC LIMIT 6",
  );

  const lowStock = await query<LowStockProduct[]>(
    "SELECT id, name, collection, stock, price FROM products WHERE active = 1 AND stock <= 3 ORDER BY stock ASC, name ASC LIMIT 6",
  );

  const stats = [
    { label: "Products", value: String(Number(summary.products)), href: "/admin/products" },
    { label: "Total Orders", value: String(Number(summary.orders)), href: "/admin/orders" },
    { label: "Awaiting Action", value: String(Number(summary.pending)), href: "/admin/orders" },
    { label: "Net COD Sales", value: formatPrice(Number(summary.revenue)), href: "/admin/orders" },
    { label: "New Bespoke", value: String(Number(summary.bespokeNew)), href: "/admin/bespoke" },
    { label: "Newsletter List", value: String(Number(summary.subscribers)), href: "/admin" },
  ];

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Noor Atelier / Admin</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/orders" className="border border-line bg-white px-4 py-3 text-xs font-medium transition hover:border-wine hover:text-wine">
            Manage orders
          </Link>
          <Link href="/admin/products" className="bg-wine px-4 py-3 text-xs font-medium text-white transition hover:bg-[#6d2038]">
            + Add product
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="border border-line bg-white p-5 transition hover:border-wine">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">{stat.label}</p>
            <strong className="mt-3 block text-2xl font-semibold tracking-tight text-ink">{stat.value}</strong>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent Orders */}
        <section className="border border-line bg-white p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Fulfilment</p>
              <h2 className="mt-1 text-2xl font-semibold">Recent COD orders</h2>
            </div>
            <Link href="/admin/orders" className="border-b border-wine pb-0.5 text-xs font-medium text-wine">
              All orders →
            </Link>
          </div>

          {recentOrders.length ? (
            <div className="mt-5 divide-y divide-line text-xs">
              {recentOrders.map(order => {
                const amount = Number(order.total) > 0 ? Number(order.total) : Number(order.subtotal);
                return (
                  <div key={order.id} className="flex items-center justify-between gap-3 py-3.5">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="mt-0.5 text-[11px] text-stone-500">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(amount)}</p>
                      <p className="mt-0.5 text-[11px] capitalize text-wine">{order.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-xs text-stone-500">No orders placed yet. New COD orders will appear here immediately.</p>
          )}
        </section>

        {/* Low Stock Alerts */}
        <section className="border border-line bg-white p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Inventory Health</p>
              <h2 className="mt-1 text-2xl font-semibold">Low stock alerts</h2>
            </div>
            <Link href="/admin/products" className="border-b border-wine pb-0.5 text-xs font-medium text-wine">
              Inventory →
            </Link>
          </div>

          {lowStock.length ? (
            <div className="mt-5 divide-y divide-line text-xs">
              {lowStock.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3.5">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500">{item.collection} · {formatPrice(item.price)}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      item.stock === 0 ? "bg-red-100 text-red-700" : "bg-blush text-wine"
                    }`}
                  >
                    {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-xs text-stone-500">All active pieces have healthy stock levels.</p>
          )}
        </section>
      </div>
    </>
  );
}
