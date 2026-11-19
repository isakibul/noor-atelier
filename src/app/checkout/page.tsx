"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { useStore } from "@/components/store-provider";
import { calculateDeliveryFee, calculateDiscount } from "@/lib/pricing";
import { formatPrice } from "@/lib/products";

type AppliedCoupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, notify } = useStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(res => (res.ok ? res.json() : { user: null }))
      .then(({ user }) => {
        if (!active || !user) return;
        const parts = String(user.name || "").trim().split(/\s+/);
        setFirstName(current => current || parts[0] || "");
        setLastName(current => current || parts.slice(1).join(" ") || "");
        setEmail(current => current || user.email || "");
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = calculateDiscount(subtotal, appliedCoupon);
  const netSubtotal = Math.max(0, subtotal - discount);
  const deliveryFee = calculateDeliveryFee(netSubtotal);
  const total = netSubtotal + deliveryFee;

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid promo code.");
        return;
      }
      setAppliedCoupon({
        code: data.code,
        type: data.type,
        value: Number(data.value),
        minOrder: Number(data.minOrder),
      });
      setCouponInput(data.code);
      notify(`Promo code ${data.code} applied.`);
    } catch {
      setCouponError("Unable to verify promo code right now.");
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
          },
          paymentMethod: "cod",
          couponCode: appliedCoupon?.code || undefined,
          notes: notes.trim() || undefined,
          items: cart.map(item => ({
            productId: String(item.id),
            quantity: item.quantity,
            size: item.size,
          })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "We couldn’t place your order. Please check your details and try again.",
        );
        return;
      }
      clearCart();
      notify(`Order ${result.orderNumber} placed successfully.`);
      const params = new URLSearchParams({
        order: String(result.orderNumber),
        total: String(result.total ?? total),
      });
      router.push(`/order-success?${params.toString()}`);
    } catch {
      setError("We couldn’t connect to the checkout service. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length) {
    return (
      <main className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-24 sm:px-10">
          <h1 className="text-4xl font-semibold sm:text-5xl">Nothing to check out yet.</h1>
          <Link href="/shop" className="mt-6 inline-block text-sm font-medium text-wine hover:underline">
            Continue shopping →
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-14 sm:px-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Secure Checkout</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Almost yours</h1>

        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-xl font-semibold">Delivery details</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                value={firstName}
                onChange={event => setFirstName(event.target.value)}
                required
                minLength={2}
                placeholder="First name"
                className="border border-line bg-white p-3 text-xs outline-wine"
              />
              <input
                value={lastName}
                onChange={event => setLastName(event.target.value)}
                required
                placeholder="Last name"
                className="border border-line bg-white p-3 text-xs outline-wine"
              />
              <input
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                type="email"
                placeholder="Email address"
                className="border border-line bg-white p-3 text-xs outline-wine sm:col-span-2"
              />
              <input
                value={phone}
                onChange={event => setPhone(event.target.value)}
                required
                minLength={5}
                placeholder="Phone number (e.g. +880 1XXX-XXXXXX)"
                className="border border-line bg-white p-3 text-xs outline-wine sm:col-span-2"
              />
              <textarea
                value={address}
                onChange={event => setAddress(event.target.value)}
                required
                minLength={10}
                placeholder="Full delivery address (house, road, area, city)"
                className="min-h-24 border border-line bg-white p-3 text-xs outline-wine sm:col-span-2"
              />
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                placeholder="Optional delivery or minor tailoring notes (e.g. call before arrival)"
                className="min-h-20 border border-line bg-white p-3 text-xs outline-wine sm:col-span-2"
              />
            </div>

            <h2 className="mt-10 text-xl font-semibold">Payment method</h2>
            <div className="mt-4 border border-wine bg-[#f8f3ed] p-4">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 text-xs font-semibold text-ink">
                  <input type="radio" checked readOnly name="payment" value="cod" className="accent-wine" />
                  Cash on Delivery (COD)
                </label>
                <span className="rounded-full bg-wine px-2.5 py-0.5 text-[10px] font-medium text-white">
                  Only option
                </span>
              </div>
              <p className="mt-2 pl-6 text-xs leading-5 text-stone-600">
                Pay in cash directly to our courier when your Noor Atelier parcel arrives. No card or advance online payment is needed.
              </p>
            </div>

            {error && (
              <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>
            )}
          </div>

          <aside className="h-fit border border-line bg-[#f4eee8] p-6">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="mt-4 divide-y divide-line">
              {cart.map(item => (
                <div className="flex items-center gap-3 py-3" key={`${item.id}-${item.size}`}>
                  <img src={item.image} alt={item.name} className="h-14 w-11 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="text-[11px] text-stone-500">
                      Size {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">Promo code</p>
              {appliedCoupon ? (
                <div className="mt-2 flex items-center justify-between border border-wine/40 bg-white px-3 py-2 text-xs">
                  <span className="font-medium text-wine">
                    {appliedCoupon.code} (−{formatPrice(discount)})
                  </span>
                  <button type="button" onClick={removeCoupon} className="text-[11px] text-stone-500 hover:text-wine">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={event => setCouponInput(event.target.value.toUpperCase())}
                    placeholder="e.g. NOOR10"
                    className="min-w-0 w-full flex-1 border border-line bg-white px-3 py-2 text-xs uppercase outline-wine"
                  />
                  <button
                    type="button"
                    disabled={couponBusy || !couponInput.trim()}
                    onClick={applyCoupon}
                    className="shrink-0 border border-wine px-3.5 py-2 text-xs font-medium text-wine transition hover:bg-wine hover:text-white disabled:opacity-40"
                  >
                    {couponBusy ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-[11px] text-red-700">{couponError}</p>}
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2 border-t border-line pt-4 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-wine">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? "font-medium text-wine" : ""}>
                  {deliveryFee === 0 ? "Complimentary" : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-sm font-semibold">
                <span>Payable on delivery</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              disabled={busy}
              className="mt-6 w-full bg-wine py-4 text-xs font-medium text-white transition hover:bg-[#6d2038] disabled:opacity-50"
            >
              {busy ? "Placing order…" : `Place COD order · ${formatPrice(total)}`}
            </button>
          </aside>
        </form>
      </section>
      <Footer />
    </main>
  );
}
