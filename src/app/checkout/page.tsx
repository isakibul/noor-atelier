"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/products";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, notify } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: `${String(form.get("firstName"))} ${String(form.get("lastName"))}`, email: form.get("email"), phone: form.get("phone"), address: form.get("address") },
          paymentMethod: "cod",
          items: cart.map(item => ({ productId: String(item.id), quantity: item.quantity, size: item.size })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "We couldn’t place your order. Please check your details and try again.");
        return;
      }
      clearCart();
      notify(`Order ${result.orderNumber} placed successfully.`);
      router.push("/order-success");
    } catch {
      setError("We couldn’t connect to the checkout service. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length) return <main className="flex min-h-screen flex-col"><SiteHeader/><div className="mx-auto w-full max-w-5xl flex-1 px-5 py-24"><h1 className="font-display text-5xl">Nothing to check out yet.</h1><Link href="/shop" className="mt-6 inline-block text-wine">Continue shopping →</Link></div><Footer/></main>;
  return <main><SiteHeader/><section className="mx-auto max-w-5xl px-5 py-16 sm:px-10"><p className="font-mono text-[10px] tracking-[.15em] text-stone-500">SECURE CHECKOUT</p><h1 className="mt-4 font-display text-5xl">Almost yours</h1><form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_290px]"><div><h2 className="font-display text-2xl">Delivery details</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><input name="firstName" required placeholder="First name" className="border border-line p-3 text-xs outline-wine"/><input name="lastName" required placeholder="Last name" className="border border-line p-3 text-xs outline-wine"/><input name="email" required type="email" placeholder="Email address" className="border border-line p-3 text-xs outline-wine sm:col-span-2"/><input name="phone" required placeholder="Phone number" className="border border-line p-3 text-xs outline-wine sm:col-span-2"/><textarea name="address" required placeholder="Delivery address" className="min-h-28 border border-line p-3 text-xs outline-wine sm:col-span-2"/></div><h2 className="mt-10 font-display text-2xl">Payment</h2><label className="mt-5 flex items-center gap-3 border border-wine bg-[#f8f3ed] p-4 text-xs"><input type="radio" defaultChecked name="payment" value="cod"/> Cash on delivery</label>{error && <p className="mt-4 text-xs text-red-700">{error}</p>}</div><aside className="h-fit bg-[#f4eee8] p-6"><h2 className="font-display text-2xl">Order summary</h2>{cart.map(item => <div className="mt-4 flex justify-between font-mono text-[10px]" key={`${item.id}-${item.size}`}><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>)}<div className="mt-6 flex justify-between border-t border-line pt-4 font-mono text-xs"><span>Total</span><strong>{formatPrice(total)}</strong></div><button disabled={busy} className="mt-6 w-full bg-wine py-4 text-xs text-white disabled:opacity-50">{busy ? "Placing order…" : `Place order · ${formatPrice(total)}`}</button></aside></form></section><Footer/></main>;
}
