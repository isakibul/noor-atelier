"use client";

import { FormEvent, useState } from "react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { useStore } from "@/components/store-provider";

export default function MadeToMeasurePage() {
  const { notify } = useStore();
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          dressType: form.get("dressType"),
          occasion: form.get("occasion"),
          preferredColor: form.get("preferredColor"),
          notes: form.get("notes"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Please review your consultation details and try again.");
        return;
      }
      setReference(data.reference || "Confirmed");
      notify("Your made-to-measure inquiry has been saved.");
    } catch {
      setError("Unable to send your request right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="mx-auto my-10 grid max-w-7xl flex-1 px-5 sm:my-14 sm:px-10 md:grid-cols-2 lg:my-16 lg:px-0">
        <div className="min-h-[460px] bg-[url('/rose-ensemble.png')] bg-cover bg-center" />
        <div className="bg-[#ecddd5] px-7 py-14 sm:px-14">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-600">The Noor Experience</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your perfect fit,<br />
            <em className="font-normal text-wine">made personal.</em>
          </h1>
          <p className="mt-5 text-sm leading-6 text-stone-700">
            Tell us about the piece you&rsquo;re imagining. Our Dhaka atelier will follow up within two working days for a personal consultation and measurement session.
          </p>

          {reference ? (
            <div className="mt-10 border border-[#d2bcb1] bg-white/80 p-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-wine">{reference}</p>
              <h2 className="mt-2 text-2xl font-semibold">Your request is with us.</h2>
              <p className="mt-3 text-xs leading-6 text-stone-600">
                Our design team has logged your inquiry and will reach out shortly with fabric swatches, timelines, and fitting options.
              </p>
              <button
                type="button"
                onClick={() => setReference("")}
                className="mt-6 border-b border-wine pb-0.5 text-xs font-medium text-wine"
              >
                Submit another design request →
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="name"
                  required
                  minLength={2}
                  className="border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                  placeholder="Your full name"
                />
                <input
                  name="phone"
                  className="border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                  placeholder="Phone / WhatsApp"
                />
              </div>
              <input
                name="email"
                required
                type="email"
                className="border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                placeholder="Email address"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  name="dressType"
                  required
                  defaultValue="Anarkali"
                  className="border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                >
                  <option value="Anarkali">Anarkali</option>
                  <option value="Kurti">Kurti / Three-Piece</option>
                  <option value="Saree">Saree & Custom Blouse</option>
                  <option value="Gown">Evening Gown</option>
                  <option value="Panjabi">Tailored Panjabi</option>
                  <option value="Bridal Ensemble">Bridal / Reception Ensemble</option>
                </select>
                <input
                  name="occasion"
                  className="border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                  placeholder="Occasion (e.g. Eid, Holud, Reception)"
                />
              </div>
              <input
                name="preferredColor"
                className="border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                placeholder="Preferred palette or fabric (e.g. muted rose, ivory silk)"
              />
              <textarea
                name="notes"
                required
                minLength={10}
                className="min-h-24 border border-[#d2bcb1] bg-white/75 p-3 text-xs outline-wine"
                placeholder="Share your silhouette ideas, embroidery preferences, timeline, and fit notes"
              />
              {error && <p className="text-xs text-red-700">{error}</p>}
              <button
                disabled={busy}
                className="mt-2 bg-wine py-4 text-xs font-medium text-white transition hover:bg-[#6d2038] disabled:opacity-50"
              >
                {busy ? "Sending inquiry…" : "Send design request"}
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
