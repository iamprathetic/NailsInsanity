"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MYSTERY_EVERY } from "@/lib/mystery";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number; // whole rupees
  size: string; // "" if the product has no sizes
  qty: number;
  image: string; // first product image URL or ""
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  // Free "buy 2, get 1" mystery sets earned: floor(count / 2).
  mysteryCount: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ni_cart_v1";

function sameLine(a: CartItem, productId: string, size: string) {
  return a.productId === productId && a.size === size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist whenever the cart changes (after initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / unavailable */
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const mysteryCount = Math.floor(count / MYSTERY_EVERY);

    return {
      items,
      count,
      total,
      mysteryCount,
      hydrated,
      addItem: (item) =>
        setItems((prev) => {
          const idx = prev.findIndex((p) =>
            sameLine(p, item.productId, item.size)
          );
          if (idx === -1) return [...prev, item];
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
          return next;
        }),
      removeItem: (productId, size) =>
        setItems((prev) =>
          prev.filter((p) => !sameLine(p, productId, size))
        ),
      setQty: (productId, size, qty) =>
        setItems((prev) =>
          prev
            .map((p) =>
              sameLine(p, productId, size)
                ? { ...p, qty: Math.max(1, qty) }
                : p
            )
            .filter((p) => p.qty > 0)
        ),
      clear: () => setItems([]),
    };
  }, [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
