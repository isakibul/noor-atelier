"use client";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { useStore } from "@/components/store-provider";
import { amountForFreeDelivery, calculateDeliveryFee, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { cart, changeQuantity } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const remaining = amountForFreeDelivery(subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 sm:px-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Your Shopping Bag</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Your bag</h1>

        {cart.length ? (
          <>
            <div className="mt-8 border border-line bg-[#f8f3ed] p-4">
              <p className="text-xs text-stone-700">
                {remaining === 0 ? (
                  <span className="font-medium text-wine">✦ Complimentary nationwide delivery unlocked!</span>
                ) : (
                  <>
                    Add <strong className="font-semibold text-wine">{formatPrice(remaining)}</strong> more to unlock complimentary delivery.
                  </>
                )}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e6d8ce]">
                <div className="h-full rounded-full bg-wine transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                {cart.map(item => (
                  <article key={`${item.id}-${item.size}`} className="flex gap-5 border-t border-line py-5">
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      <img src={item.image} alt={item.name} className="h-32 w-24 object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <Link href={`/product/${item.slug}`} className="text-lg font-medium hover:text-wine">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {item.collection} · Size {item.size}
                      </p>
                      <p className="mt-2 text-xs font-medium text-stone-700">{formatPrice(item.price)} each</p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-line bg-white text-xs">
                          <button
                            onClick={() => changeQuantity(item.id, item.size, -1)}
                            aria-label="Decrease quantity"
                            className="grid h-8 w-8 place-items-center transition hover:bg-[#f8f3ed]"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.id, item.size, 1)}
                            aria-label="Increase quantity"
                            className="grid h-8 w-8 place-items-center transition hover:bg-[#f8f3ed]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => changeQuantity(item.id, item.size, -item.quantity)}
                          className="text-xs text-stone-400 underline-offset-4 hover:text-wine hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <strong className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</strong>
                  </article>
                ))}
              </div>

              <aside className="h-fit border border-line bg-[#f4eee8] p-6">
                <h2 className="text-xl font-semibold">Order summary</h2>
                <div className="mt-5 space-y-2.5 text-xs">
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
                  <div className="flex justify-between border-t border-line pt-3 text-sm font-semibold">
                    <span>Estimated total</span>
                    <span>{formatPrice(subtotal + deliveryFee)}</span>
                  </div>
                </div>
                <p className="mt-4 text-[11px] leading-5 text-stone-500">
                  Cash on delivery only. Promo codes can be applied on the next step.
                </p>
                <Link
                  href="/checkout"
                  className="mt-6 block bg-wine py-4 text-center text-xs font-medium text-white transition hover:bg-[#6d2038]"
                >
                  Proceed to checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-3 block text-center text-xs text-stone-600 underline-offset-4 hover:text-wine hover:underline"
                >
                  Continue shopping
                </Link>
              </aside>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-semibold">Your bag is waiting for its first piece.</h2>
            <p className="mt-2 text-xs text-stone-500">Discover our newest seasonal silhouettes and festive classics.</p>
            <Link href="/shop" className="mt-6 inline-block bg-wine px-6 py-4 text-xs font-medium text-white">
              Explore the edit
            </Link>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
