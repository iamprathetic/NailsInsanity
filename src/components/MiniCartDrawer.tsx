"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";
import { ButtonLink } from "@/components/Button";

// Quick-access cart popup opened from the nav's cart icon. Lets the customer
// add/remove/adjust items without leaving the page. Shipping, coupon, and
// Best Sellers stay exclusive to the full /cart page — this is just a fast
// preview + edit surface.
export function MiniCartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, total, setQty, removeItem } = useCart();

  // Only keep the drawer in the DOM while open (or mid transition). A
  // closed-but-still-mounted fixed panel would otherwise sit off-screen via
  // translate-x-full while still contributing to the page's scrollable
  // width, causing a phantom horizontal scroll everywhere on the site.
  const [mounted, setMounted] = useState(false);
  // Separate from `mounted`: controls the actual slide/fade classes. Mounting
  // and applying the "open" transform in the same render would skip the
  // transition entirely (nothing to animate from), so this flips true one
  // frame after mount to trigger a real slide-in.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Small delay (not a rAF) so the browser paints the closed position
      // first, then transitions to open — works reliably across automated
      // and real browser contexts alike.
      const timer = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(timer);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 320);
    return () => clearTimeout(timer);
  }, [open]);

  // Lock body scroll while open; close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl text-navy">
            Your Cart {items.length > 0 && `(${items.length})`}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy hover:bg-mist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-ink/70">Your cart is empty.</p>
            <ButtonLink href="/shop" onClick={onClose} className="mt-5">
              Browse the collection
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-line px-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3 py-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={onClose}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-mist"
                  >
                    {item.image ? (
                      <Image
                        src={cloudinaryUrl(item.image, 120)}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={onClose}
                        className="truncate text-sm font-medium text-navy hover:text-royal"
                      >
                        {item.name}
                      </Link>
                      <span className="shrink-0 text-sm text-navy">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                    {item.size && (
                      <p className="text-xs text-ink/50">Size: {item.size}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-navy/20">
                        <button
                          onClick={() =>
                            setQty(item.productId, item.size, item.qty - 1)
                          }
                          className="px-2.5 py-1 text-navy hover:text-royal"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            setQty(item.productId, item.size, item.qty + 1)
                          }
                          disabled={item.qty >= item.stock}
                          className={`px-2.5 py-1 text-xs transition ${
                            item.qty >= item.stock
                              ? "cursor-not-allowed text-gray-300"
                              : "text-navy hover:text-royal"
                          }`}
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-xs text-ink/50 underline hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink/60">Subtotal</span>
                <span className="font-semibold text-navy">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                Shipping, coupons &amp; best sellers at checkout.
              </p>
              <ButtonLink
                href="/cart"
                onClick={onClose}
                size="lg"
                className="mt-4 w-full"
              >
                Go to Cart
              </ButtonLink>
            </div>
          </>
        )}
      </div>
    </>
  );
}
