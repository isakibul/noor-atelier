import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { formatPrice } from "@/lib/products";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order?.trim();
  const totalAmount = params.total && /^\d+(\.\d+)?$/.test(params.total) ? Number(params.total) : null;

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-wine text-xl text-white">✓</div>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
          Order Confirmed{orderNumber ? ` · ${orderNumber}` : ""}
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Thank you,<br />
          <em className="font-normal text-wine">beautiful.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-stone-600">
          Your Noor Atelier order has been received. Our Dhaka team is preparing your pieces and will reach out before dispatch.
        </p>

        {(orderNumber || totalAmount !== null) && (
          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-4 border border-line bg-[#f8f3ed] p-5 text-left text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Order Reference</p>
              <p className="mt-1 font-semibold text-ink">{orderNumber || "Confirmed"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Cash on Delivery</p>
              <p className="mt-1 font-semibold text-wine">
                {totalAmount !== null ? formatPrice(totalAmount) : "Pay on arrival"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="bg-wine px-6 py-4 text-xs font-medium text-white transition hover:bg-[#6d2038]">
            Continue shopping
          </Link>
          <Link href="/account" className="border border-line bg-white px-6 py-4 text-xs font-medium transition hover:border-wine hover:text-wine">
            View my orders
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
