"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { shippingFeeFor, shippingMethods } from "@/lib/site";
import { Button, ButtonLink } from "@/components/Button";
import { BestSellers } from "@/components/BestSellers";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const emptyForm = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear, mysteryCount, shippingMethod, coupon } =
    useCart();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Razorpay verification can fail after the payment popup closes, which
  // lands the user back here via ?failed=1 — surface that instead of
  // silently showing a blank reset form.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("failed") === "1") {
      setError(
        "Payment could not be verified. If you were charged, please contact us — otherwise, try again."
      );
      router.replace("/checkout");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = total;
  const shippingFee = shippingFeeFor(shippingMethod);
  const shippingInfo = shippingMethods.find((m) => m.id === shippingMethod);
  const discount = coupon?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal - discount) + shippingFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl text-navy">Nothing to check out</h1>
        <p className="mt-3 text-sm text-ink/60">Your cart is empty.</p>
        <div className="mt-8">
          <ButtonLink href="/shop" size="lg">
            Browse the collection
          </ButtonLink>
        </div>
      </div>
    );
  }

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            qty: i.qty,
          })),
          shippingMethod,
          couponCode: coupon?.code ?? null,
        }),
      });

      const data = await createRes.json();
      if (!createRes.ok) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // Demo mode (no Razorpay keys yet) — confirm directly.
      if (data.demo) {
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: data.reference, demo: true }),
        });
        if (!verifyRes.ok) {
          setError("Could not place the order. Please try again.");
          setLoading(false);
          return;
        }
        clear();
        router.push(`/order/${data.reference}`);
        return;
      }

      // Real Razorpay checkout.
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount * 100,
        currency: "INR",
        name: "Nails Insanity",
        description: `Order ${data.reference}`,
        prefill: {
          name: form.customerName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#16256b" },
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: data.reference,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            router.push(`/checkout?failed=1`);
            return;
          }
          clear();
          router.push(`/order/${data.reference}`);
        },
      });
      rzp.open();
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-navy";

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 pb-6">
      <h1 className="text-4xl text-navy">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        {/* Details form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-display text-xl text-navy">Shipping details</h2>

          <div>
            <label className="mb-1 block text-sm text-ink/70">Full name</label>
            <input
              required
              className={field}
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-ink/70">Email</label>
              <input
                required
                type="email"
                className={field}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink/70">Phone</label>
              <input
                required
                type="tel"
                className={field}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-ink/70">Address</label>
            <textarea
              required
              rows={2}
              className={field}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-ink/70">City</label>
              <input
                required
                className={field}
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink/70">State</label>
              <input
                required
                className={field}
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink/70">Pincode</label>
              <input
                required
                inputMode="numeric"
                className={field}
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Processing…" : `Pay ${formatPrice(grandTotal)}`}
          </Button>
        </form>

        {/* Final order summary — read-only. Shipping method and coupon are
            chosen in the cart; change them there, not here. */}
        <aside className="h-fit overflow-hidden rounded-2xl border border-line shadow-sm">
          <div className="bg-navy px-6 py-5 text-white">
            <p className="eyebrow text-white/60">Final</p>
            <h2 className="mt-1 font-display text-2xl">Order Summary</h2>
          </div>

          <div className="bg-white p-6">
            <ul className="space-y-3">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.size}`}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-ink/70">
                    {i.name}
                    {i.size ? ` (${i.size})` : ""} × {i.qty}
                  </span>
                  <span className="text-navy">
                    {formatPrice(i.price * i.qty)}
                  </span>
                </li>
              ))}
              {mysteryCount > 0 && (
                <li className="flex justify-between gap-3 text-sm">
                  <span className="text-ink/70">
                    🎁 Mystery Set × {mysteryCount}
                  </span>
                  <span className="text-green-700">FREE</span>
                </li>
              )}
            </ul>

            {/* Read-only shipping + coupon badges */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy">
                {shippingInfo?.label ?? "Free shipping"}
                {shippingInfo?.eta ? ` · ${shippingInfo.eta}` : ""}
              </span>
              {coupon && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Coupon {coupon.code} applied
                </span>
              )}
            </div>

            <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd className="text-navy">{formatPrice(subtotal)}</dd>
              </div>
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
            </dl>

            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-navy/5 px-4 py-4">
              <span className="font-display text-lg text-navy">Total</span>
              <span className="font-display text-2xl text-navy">
                {formatPrice(grandTotal)}
              </span>
            </div>

            <Link
              href="/cart"
              className="mt-4 block text-center text-xs text-ink/50 hover:text-royal"
            >
              Want to change shipping or your coupon? Edit cart →
            </Link>
          </div>
        </aside>
      </div>

      <BestSellers />
    </div>
  );
}
