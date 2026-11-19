"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/components/store-provider";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const { notify } = useStore();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        notify(data.error || "Please enter a valid email address.");
        return;
      }
      notify(data.message || "You’re on the Noor list. Welcome in.");
      setEmail("");
    } catch {
      notify("Unable to subscribe right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`flex border-b ${dark ? "border-[#d99aa5]" : "border-wine"}`}>
      <input
        aria-label="Email address"
        value={email}
        onChange={event => setEmail(event.target.value)}
        type="email"
        required
        placeholder="Your email address"
        className={`w-full bg-transparent py-3 text-xs outline-none ${
          dark ? "text-white placeholder:text-[#e8bac1]" : "placeholder:text-stone-400"
        }`}
      />
      <button
        disabled={busy}
        aria-label="Subscribe"
        className={`px-2 text-lg transition disabled:opacity-50 ${dark ? "text-white hover:text-[#f1b6bf]" : "text-wine"}`}
      >
        {busy ? "…" : "→"}
      </button>
    </form>
  );
}
