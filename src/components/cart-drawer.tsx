"use client";

import Link from "next/link";
import { useEffect } from "react";
import { amountForFreeDelivery, calculateDeliveryFee, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { formatPrice } from "@/lib/products";
import type { CartItem } from "@/components/store-provider";

type Props = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onChangeQuantity: (id: string, size: string, delta: number) => void;
};

export function CartDrawer({ open, onClose, cart, onChangeQuantity }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const remaining = amountForFreeDelivery(subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/45 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button aria-label="Close bag backdrop" onClick={onClose} className="flex-1 cursor-default" />
      <aside className="flex h-full w-full max-w-md animate-[slide-in-right_.24s_ease-out] flex-col bg-[#fdfbf8] text-ink shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Your shopping bag</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {itemCount} {itemCount === 1 ? "piece" : "pieces"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close bag"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-lg transition hover:border-wine hover:text-wine"
          >
            ×
          </button>
        </div>

        {cart.length > 0 && (
          <div className="border-b border-line bg-[#f8f3ed] px-6 py-3.5">
            <p className="text-xs text-stone-700">
              {remaining === 0 ? (
                <span className="font-medium text-wine">✦ Complimentary nationwide delivery unlocked!</span>
              ) : (
                <>
                  Add <strong className="font-semibold text-wine">{formatPrice(remaining)}</strong> more for complimentary delivery
                </>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e6d8ce]">
              <div className="h-full rounded-full bg-wine transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length ? (
            <div className="divide-y divide-line">
              {cart.map(item => (
                <article key={`${item.id}-${item.size}`} className="flex gap-4 py-4">
                  <Link href={`/product/${item.slug}`} onClick={onClose} className="shrink-0 overflow-hidden bg-[#efe7df]">
                    <img src={item.image} alt={item.name} className="h-24 w-20 object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${item.slug}`} onClick={onClose} className="text-sm font-medium leading-snug hover:text-wine">
                        {item.name}
                      </Link>
                      <span className="shrink-0 text-xs font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500">
                      {item.collection} · Size {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line bg-white">
                        <button
                          onClick={() => onChangeQuantity(item.id, item.size, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="grid h-7 w-7 place-items-center text-xs transition hover:bg-[#f8f3ed]"
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onChangeQuantity(item.id, item.size, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="grid h-7 w-7 place-items-center text-xs transition hover:bg-[#f8f3ed]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => onChangeQuantity(item.id, item.size, -item.quantity)}
                        className="text-[11px] text-stone-400 underline-offset-4 transition hover:text-wine hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-line bg-[#f8f3ed] text-wine">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 8h14l-1 12H6L5 8Z" />
                  <path d="M9 8a3 3 0 0 1 6 0" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium">Your bag is empty</p>
              <p className="mt-1.5 max-w-xs text-xs leading-5 text-stone-500">
                Explore our Dhaka-crafted occasionwear and save pieces you love.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-6 bg-wine px-5 py-3 text-xs font-medium text-white transition hover:bg-[#6d2038]"
              >
                Explore the shop →
              </Link>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-line bg-white px-6 py-5">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? "font-medium text-wine" : ""}>
                  {deliveryFee === 0 ? "Complimentary" : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5 text-sm font-semibold">
                <span>Estimated total</span>
                <span>{formatPrice(subtotal + deliveryFee)}</span>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] text-stone-500">Cash on delivery nationwide · Promo codes applied at checkout</p>
            <div className="mt-4 grid gap-2.5">
              <Link
                href="/checkout"
                onClick={onClose}
                className="block bg-wine py-3.5 text-center text-xs font-medium text-white transition hover:bg-[#6d2038]"
              >
                Proceed to checkout · {formatPrice(subtotal + deliveryFee)}
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="block border border-line py-3 text-center text-xs font-medium transition hover:border-wine hover:text-wine"
              >
                View full bag
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
