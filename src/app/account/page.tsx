"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { formatPrice, type OrderSummary } from "@/lib/products";

type User = { name: string; email: string; role: "customer" | "admin" };

const statusStyles: Record<OrderSummary["status"], string> = {
  pending: "bg-[#fbf1dc] text-[#8a5a00]",
  processing: "bg-[#e7eef9] text-[#1d4d8f]",
  shipped: "bg-[#efe6f7] text-[#5e2a84]",
  delivered: "bg-[#e6f3ea] text-[#1f6236]",
  cancelled: "bg-stone-200 text-stone-600",
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(response => response.json())
      .then(async ({ user }) => {
        if (!active) return;
        setUser(user);
        if (user) {
          const response = await fetch("/api/orders");
          if (active && response.ok) {
            const list: OrderSummary[] = await response.json();
            setOrders(list);
            if (list[0]) setExpanded(list[0]._id);
          }
        }
      })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
  };

  if (user === undefined) {
    return (
      <main className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center text-xs text-stone-500">Loading your account…</div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col">
        <SiteHeader />
        <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-20 sm:px-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">My Noor</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A more personal<br />
              <em className="font-normal text-wine">shopping experience.</em>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-stone-600">
              Sign in to see your itemized order history, track Cash on Delivery parcels, and check out faster.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/login" className="bg-wine px-6 py-4 text-xs font-medium text-white">
                Sign in
              </Link>
              <Link href="/register" className="border border-line bg-white px-6 py-4 text-xs font-medium">
                Create account
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 sm:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">My Noor</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Hello, {user.name.split(" ")[0]}
            </h1>
          </div>
          <button onClick={logout} className="self-start border-b border-stone-400 pb-1 text-xs font-medium hover:border-wine hover:text-wine sm:self-auto">
            Sign out
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="flex flex-wrap gap-4 border-b border-line pb-4 text-xs lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <span className="font-semibold text-wine">Orders ({orders.length})</span>
            <Link href="/wishlist" className="text-stone-600 hover:text-wine">Wishlist</Link>
            <Link href="/made-to-measure" className="text-stone-600 hover:text-wine">Bespoke consultation</Link>
            {user.role === "admin" && (
              <Link href="/admin" className="font-medium text-wine hover:underline">
                Admin dashboard ↗
              </Link>
            )}
            <span className="pt-2 text-[11px] text-stone-500">{user.email}</span>
          </aside>

          <div>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold">Your orders</h2>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {orders.length ? (
              <div className="mt-5 space-y-4">
                {orders.map(order => {
                  const isOpen = expanded === order._id;
                  return (
                    <article key={order._id} className="border border-line bg-white">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : order._id)}
                        className="grid w-full grid-cols-2 items-center gap-3 p-5 text-left text-xs transition hover:bg-[#faf6f1] sm:grid-cols-[1.4fr_1fr_1fr_auto]"
                      >
                        <div>
                          <p className="font-semibold text-ink">{order.orderNumber}</p>
                          <p className="mt-0.5 text-[11px] text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                        <div>
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${statusStyles[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="justify-self-end text-stone-400">{isOpen ? "−" : "+"}</span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-line bg-[#fdfbf8] p-5 text-xs">
                          {order.items && order.items.length > 0 && (
                            <div className="divide-y divide-line">
                              {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 py-3">
                                  <img src={item.image} alt={item.name} className="h-14 w-11 object-cover" />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="mt-0.5 text-[11px] text-stone-500">
                                      Size {item.size} · Qty {item.quantity}
                                    </p>
                                  </div>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                            <div className="space-y-1 text-stone-600">
                              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                                Delivery & Payment
                              </p>
                              {order.customerAddress && <p>{order.customerAddress}</p>}
                              {order.customerPhone && <p>{order.customerPhone}</p>}
                              <p className="font-medium text-ink">Payment: Cash on Delivery</p>
                            </div>
                            <div className="space-y-1.5 sm:text-right">
                              <p className="text-stone-600">Subtotal: {formatPrice(order.subtotal)}</p>
                              {order.discount > 0 && (
                                <p className="text-wine">
                                  Discount{order.couponCode ? ` (${order.couponCode})` : ""}: −{formatPrice(order.discount)}
                                </p>
                              )}
                              <p className="text-stone-600">
                                Delivery: {order.deliveryFee === 0 ? "Complimentary" : formatPrice(order.deliveryFee)}
                              </p>
                              <p className="pt-1 text-sm font-semibold text-ink">Total: {formatPrice(order.total)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 border-y border-line py-12">
                <p className="text-xl font-medium">No orders just yet.</p>
                <Link href="/shop" className="mt-4 inline-block text-xs font-medium text-wine underline">
                  Explore the collection →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
