"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";

type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt: string | null;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("3000");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/coupons").then(async res => {
      if (active && res.ok) setCoupons(await res.json());
    });
    return () => { active = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: Number(value),
          minOrder: Number(minOrder) || 0,
          active: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || "Unable to create promo code.");
        return;
      }
      setCoupons(current => [data, ...current]);
      setCode("");
      setMessage(`Promo code ${data.code} created.`);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (response.ok) {
      setCoupons(current =>
        current.map(item => (item.id === coupon.id ? { ...item, active: !coupon.active } : item)),
      );
    }
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (response.ok) {
      setCoupons(current => current.filter(item => item.id !== id));
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
      <section className="h-fit border border-line bg-white p-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Promotions</p>
        <h1 className="mt-2 text-3xl font-semibold">Create promo code</h1>
        <form onSubmit={submit} className="mt-6 grid gap-3 text-xs">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
            required
            minLength={3}
            placeholder="Code (e.g. EID15)"
            className="border border-line p-3 uppercase outline-wine"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={e => setType(e.target.value as "percent" | "fixed")}
              className="border border-line p-3 outline-wine"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed BDT (৳)</option>
            </select>
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              type="number"
              min="1"
              max={type === "percent" ? 90 : undefined}
              required
              placeholder={type === "percent" ? "Percent off" : "BDT off"}
              className="border border-line p-3 outline-wine"
            />
          </div>
          <input
            value={minOrder}
            onChange={e => setMinOrder(e.target.value)}
            type="number"
            min="0"
            placeholder="Minimum order (BDT)"
            className="border border-line p-3 outline-wine"
          />
          <button
            disabled={busy}
            className="mt-2 bg-wine py-4 font-medium text-white transition hover:bg-[#6d2038] disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create promo code"}
          </button>
          {message && <p className="font-medium text-wine">{message}</p>}
        </form>
      </section>

      <section>
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Active Offers</p>
        <h2 className="mt-2 text-3xl font-semibold">All promo codes</h2>
        <div className="mt-6 border border-line bg-white">
          {coupons.length ? (
            <div className="divide-y divide-line text-xs">
              {coupons.map(coupon => (
                <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold text-ink">{coupon.code}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {coupon.type === "percent" ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}
                      {coupon.minOrder > 0 ? ` · Min order ${formatPrice(coupon.minOrder)}` : " · No minimum"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                        coupon.active ? "bg-[#e6f3ea] text-[#1f6236]" : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {coupon.active ? "Active" : "Paused"}
                    </button>
                    <button
                      onClick={() => remove(coupon.id)}
                      className="text-xs text-stone-400 hover:text-wine"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-xs text-stone-500">No promo codes created yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
