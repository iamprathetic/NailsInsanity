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
  stock: number;
  image: string; // first product image URL or ""
};

export type AppliedCoupon = { code: string; discount: number };

type CouponResult = { ok: boolean; message: string };

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
  stockUpdated: boolean;
  refreshCartStock: () => Promise<void>;
  // Shipping method chosen ("free" | "express"), shared between cart & checkout.
  shippingMethod: string;
  setShippingMethod: (id: string) => void;
  // Coupon applied in the cart, read-only at checkout.
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<CouponResult>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ni_cart_v1";
const SHIPPING_KEY = "ni_shipping_v1";
const COUPON_KEY = "ni_coupon_v1";

function sameLine(a: CartItem, productId: string, size: string) {
  return a.productId === productId && a.size === size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [stockUpdated, setStockUpdated] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("free");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  // Load persisted cart + shipping + coupon choice on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const savedShipping = localStorage.getItem(SHIPPING_KEY);
      if (savedShipping) setShippingMethod(savedShipping);
      const savedCoupon = localStorage.getItem(COUPON_KEY);
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
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

  // Persist the shipping choice so it carries from cart to checkout.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SHIPPING_KEY, shippingMethod);
    } catch {
      /* storage full / unavailable */
    }
  }, [shippingMethod, hydrated]);

  // Persist the applied coupon so it carries from cart to checkout.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* storage full / unavailable */
    }
  }, [coupon, hydrated]);

  async function refreshCartStock() {
  if (items.length === 0) return;

  try {
    const res = await fetch("/api/products/stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: items.map((i) => i.productId),
      }),
    });

    if (!res.ok) return;

    const latest: {
      id: string;
      stock: number;
    }[] = await res.json();

    const stockMap = new Map(
      latest.map((p) => [p.id, p.stock])
    );

    let changed = false;

    setItems((prev) =>
      prev.map((item) => {
        const latestStock = stockMap.get(item.productId);

        if (latestStock === undefined) return item;

        const newQty = Math.min(
          item.qty,
          latestStock
        );

        if (
          newQty !== item.qty ||
          latestStock !== item.stock
        ) {
          changed = true;
        }

        return {
          ...item,
          stock: latestStock,
          qty: newQty,
        };
      })
    );

    setStockUpdated(changed);
  } catch {
    // ignore
  }
}

  // Validates a code against the current cart and, if valid, applies it.
  async function applyCoupon(code: string): Promise<CouponResult> {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, qty: count, subtotal: total }),
      });
      const data = await res.json();
      if (data.ok) {
        setCoupon({ code: data.code, discount: data.discount });
        return { ok: true, message: data.message };
      }
      setCoupon(null);
      return { ok: false, message: data.message || "Invalid coupon." };
    } catch {
      return { ok: false, message: "Could not check that coupon. Try again." };
    }
  }

  function removeCoupon() {
    setCoupon(null);
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const mysteryCount = Math.floor(count / MYSTERY_EVERY);

    return {
      items,
      count,
      total,
      mysteryCount,
      stockUpdated,
      refreshCartStock,
      hydrated,
      shippingMethod,
      setShippingMethod,
      coupon,
      applyCoupon,
      removeCoupon,
      addItem: (item) =>
        setItems((prev) => {
          const idx = prev.findIndex((p) =>
            sameLine(p, item.productId, item.size)
          );
          if (idx === -1) return [...prev,{ ...item, qty: Math.min(item.qty, item.stock), },];
          const next = [...prev];
          const newQty= Math.min(next[idx].qty + item.qty, next[idx].stock);
          next[idx] = { ...next[idx], qty: newQty,};
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
                ? { ...p, qty: Math.max(1, Math.min(qty, p.stock)), }
                : p
            )
            .filter((p) => p.qty > 0)
        ),
      clear: () => {
        setItems([]);
        setCoupon(null);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hydrated, stockUpdated, refreshCartStock, shippingMethod, coupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
