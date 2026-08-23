"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/components/store-provider";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const { notify } = useStore();
  const [email, setEmail] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); notify("You’re on the Noor list. Welcome in."); setEmail(""); };
  return <form onSubmit={submit} className={`flex border-b ${dark ? "border-[#d99aa5]" : "border-wine"}`}><input aria-label="Email address" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Your email address" className={`w-full bg-transparent py-3 text-xs outline-none ${dark ? "text-white placeholder:text-[#e8bac1]" : "placeholder:text-stone-400"}`}/><button aria-label="Subscribe" className={`px-2 text-lg ${dark ? "text-white" : "text-wine"}`}>→</button></form>;
}
