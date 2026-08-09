"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { shippingFeeFor } from "@/lib/site";
import { Button, ButtonLink } from "@/components/Button";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";
import { BestSellers } from "@/components/BestSellers";
import { ShippingMethodSelector } from "@/components/ShippingMethodSelector";

export default function CartPage() {
  const {
    items,
    total,
    setQty,
    removeItem,
    mysteryCount,
    refreshCartStock,
    stockUpdated,
    shippingMethod,
    setShippingMethod,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    refreshCartStock();
  }, [refreshCartStock]);

  const shippingFee = shippingFeeFor(shippingMethod);
  const discount = coupon?.discount ?? 0;
  const grandTotal = Math.max(0, total - discount) + shippingFee;

  async function handleApplyCoupon() {
    setCouponError("");
    setCouponMsg("");
    if (!couponInput.trim()) return setCouponError("Enter a coupon code.");
    setCouponLoading(true);
    const result = await applyCoupon(couponInput);
    setCouponLoading(false);
    if (result.ok) setCouponMsg(result.message);
    else setCouponError(result.message);
  }

  function handleRemoveCoupon() {
    removeCoupon();
    setCouponInput("");
    setCouponMsg("");
    setCouponError("");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl text-navy">Your cart is empty</h1>
        {stockUpdated && (
        <div className="mt-5 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
        Some quantities were automatically updated because the available stock changed.
        </div>)}
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
    <div className="mx-auto max-w-5xl px-5 pt-14 pb-6">
      <h1 className="text-4xl text-navy">Your cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        {/* Line items (min-w-0 lets this column shrink below the Best
            Sellers horizontal scroller's content width, instead of the
            scroller forcing the whole page wider on mobile) */}
        <div className="min-w-0">
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
                    src={cloudinaryUrl(item.image, 200, 1)}
                    alt={item.name}
                    fill
                    unoptimized
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
                <div>
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
                      disabled={item.qty >= item.stock}
                      className={`px-3 py-1.5 transition ${item.qty >= item.stock ? "cursor-not-allowed text-gray-300" : "text-navy hover:text-royal"}`}
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-ink/60">
                    {item.stock} item{item.stock !== 1 ? "s" : ""} available
                  </p>
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

          {mysteryCount > 0 ? (
            <div className="mt-6 rounded-2xl border border-royal/20 bg-royal/5 p-5">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🎁</span>
                <div className="flex-1">
                  <p className="font-display text-lg text-navy">
                    Mystery Set × {mysteryCount}{" "}
                    <span className="text-green-700">— FREE</span>
                  </p>
                  <p className="text-sm text-ink/60">
                    A surprise hand-picked set, revealed when your order arrives!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-royal/30 bg-royal/5 p-4 text-center text-sm text-ink/70">
              Add <span className="font-semibold text-royal">1 more set</span> to
              unlock a{" "}
              <span className="font-semibold text-royal">FREE Mystery Set</span> 🎁
            </div>
          )}

          <div className="mt-10">
            <BestSellers />
          </div>

          <div className="mt-10">
            <ShippingMethodSelector
              value={shippingMethod}
              onChange={setShippingMethod}
            />
          </div>

          {/* Coupon */}
          <div className="mt-10">
            <h2 className="font-display text-xl text-navy">Coupon code</h2>
            <div className="mt-3">
              {coupon ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-green-50 px-4 py-3">
                  <span className="text-sm text-green-700">
                    Coupon <strong>{coupon.code}</strong> applied — you saved{" "}
                    {formatPrice(coupon.discount)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-ink/50 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm uppercase text-ink outline-none focus:border-navy"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "…" : "Apply"}
                  </Button>
                </div>
              )}
              {couponMsg && !coupon && (
                <p className="mt-2 text-xs text-green-700">{couponMsg}</p>
              )}
              {couponError && (
                <p className="mt-2 text-xs text-red-600">{couponError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-line bg-mist/50 p-6">
          <h2 className="font-display text-xl text-navy">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="text-navy">{formatPrice(total)}</dd>
            </div>
            {mysteryCount > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink/60">Mystery Set × {mysteryCount}</dt>
                <dd className="text-green-700">FREE</dd>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink/60">Discount</dt>
                <dd className="text-green-700">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className={shippingFee === 0 ? "text-green-700" : "text-navy"}>
                {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt className="text-navy">Total</dt>
              <dd className="text-navy">{formatPrice(grandTotal)}</dd>
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
