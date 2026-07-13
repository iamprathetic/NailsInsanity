"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/Button";

export default function CartPage() {
  const { items, total, setQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl text-navy">Your cart is empty</h1>
        <p className="mt-3 text-sm text-ink/60">
          Looks like you haven&rsquo;t added anything yet.
        </p>
        <div className="mt-8">
          <ButtonLink href="/shop" size="lg">
            Browse the collection
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-4xl text-navy">Your cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        {/* Line items */}
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 py-5"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-display text-lg text-navy hover:text-royal"
                    >
                      {item.name}
                    </Link>
                    {item.size && (
                      <p className="text-sm text-ink/50">Size: {item.size}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-navy">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-navy/20">
                    <button
                      onClick={() =>
                        setQty(item.productId, item.size, item.qty - 1)
                      }
                      className="px-3 py-1.5 text-navy hover:text-royal"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() =>
                        setQty(item.productId, item.size, item.qty + 1)
                      }
                      className="px-3 py-1.5 text-navy hover:text-royal"
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

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-line bg-mist/50 p-6">
          <h2 className="font-display text-xl text-navy">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="text-navy">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="text-green-700">Free</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt className="text-navy">Total</dt>
              <dd className="text-navy">{formatPrice(total)}</dd>
            </div>
          </dl>
          <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
            Checkout
          </ButtonLink>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-ink/60 hover:text-royal"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
