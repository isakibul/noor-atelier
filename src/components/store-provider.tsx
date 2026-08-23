"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

export type CartItem = Product & { quantity: number; size: string };
type Store = { cart: CartItem[]; wishlist: string[]; hydrated: boolean; add: (product: Product, size?: string) => void; changeQuantity: (id: string, size: string, delta: number) => void; toggleWishlist: (id: string) => void; clearCart: () => void; notify: (message: string) => void };
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { try { const savedCart = JSON.parse(localStorage.getItem("noor-cart") || "[]"); const savedWishlist = JSON.parse(localStorage.getItem("noor-wishlist") || "[]"); setCart(Array.isArray(savedCart) ? savedCart.map(item => ({ ...item, id: String(item.id) })) : []); setWishlist(Array.isArray(savedWishlist) ? savedWishlist.map(String) : []); } finally { setHydrated(true); } }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("noor-cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("noor-wishlist", JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const notify = (message: string) => { clearTimeout(timeoutRef.current); setToast(message); timeoutRef.current = setTimeout(() => setToast(""), 3200); };
  const add = (product: Product, size = "M") => { setCart(items => { const match = items.find(item => item.id === product.id && item.size === size); return match ? items.map(item => item === match ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, size, quantity: 1 }]; }); notify(`${product.name} added to your bag.`); };
  const changeQuantity = (id: string, size: string, delta: number) => { setCart(items => items.flatMap(item => item.id === id && item.size === size ? item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : [] : [item])); notify(delta > 0 ? "Bag quantity updated." : "Item removed from your bag."); };
  const toggleWishlist = (id: string) => { const exists = wishlist.includes(id); setWishlist(items => exists ? items.filter(item => item !== id) : [...items, id]); notify(exists ? "Removed from your wishlist." : "Saved to your wishlist."); };

  return <StoreContext.Provider value={{ cart, wishlist, hydrated, add, changeQuantity, toggleWishlist, clearCart: () => setCart([]), notify }}>{children}{toast && <button onClick={() => setToast("")} className="fixed bottom-6 right-6 z-[60] flex items-center gap-4 rounded-full bg-wine px-5 py-3 text-xs text-white shadow-panel transition hover:bg-[#741f38]" role="status"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/15">✓</span>{toast}<span className="ml-1 text-base leading-none">×</span></button>}</StoreContext.Provider>;
}

export const useStore = () => { const store = useContext(StoreContext); if (!store) throw new Error("useStore must be within StoreProvider"); return store; };
