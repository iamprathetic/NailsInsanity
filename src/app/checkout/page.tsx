"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { shippingMethods, shippingFeeFor } from "@/lib/site";
import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/Button";
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
  const { items, total, count, clear, mysteryCount } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shippingMethod, setShippingMethod] = useState<string>("free");
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [couponMsg, setCouponMsg] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = total;
  const shippingFee = shippingFeeFor(shippingMethod);
  const discount = applied?.discount ?? 0;
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

  async function applyCoupon() {
    setCouponError("");
    setCouponMsg("");
    if (!couponInput.trim()) return setCouponError("Enter a coupon code.");
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, qty: count, subtotal }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplied({ code: data.code, discount: data.discount });
        setCouponMsg(data.message);
      } else {
        setApplied(null);
        setCouponError(data.message || "Invalid coupon.");
      }
    } catch {
      setCouponError("Could not check that coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCouponInput("");
    setCouponMsg("");
    setCouponError("");
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
          couponCode: applied?.code ?? null,
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

          {/* Shipping method */}
          <div className="pt-2">
            <h2 className="font-display text-xl text-navy">Shipping method</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {shippingMethods.map((m) => {
                const selected = shippingMethod === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setShippingMethod(m.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-navy bg-navy/5"
                        : "border-line hover:border-navy/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-navy">{m.label}</span>
                      <span className="text-sm font-medium text-navy">
                        {m.fee === 0 ? "Free" : formatPrice(m.fee)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink/60">{m.eta}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Processing…" : `Pay ${formatPrice(grandTotal)}`}
          </Button>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-line bg-mist/50 p-6">
          <h2 className="font-display text-xl text-navy">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li
                key={`${i.productId}-${i.size}`}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="text-ink/70">
                  {i.name}
                  {i.size ? ` (${i.size})` : ""} × {i.qty}
                </span>
                <span className="text-navy">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
            {mysteryCount > 0 && (
              <li className="flex justify-between gap-3 text-sm">
                <span className="text-ink/70">🎁 Mystery Set × {mysteryCount}</span>
                <span className="text-green-700">FREE</span>
              </li>
            )}
          </ul>

          {/* Coupon */}
          <div className="mt-5 border-t border-line pt-4">
            {applied ? (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-green-50 px-3 py-2">
                <span className="text-sm text-green-700">
                  Coupon <strong>{applied.code}</strong> applied
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-ink/50 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm uppercase text-ink outline-none focus:border-navy"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? "…" : "Apply"}
                </Button>
              </div>
            )}
            {couponMsg && !applied && (
              <p className="mt-2 text-xs text-green-700">{couponMsg}</p>
            )}
            {couponError && (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            )}
          </div>

          {/* Totals */}
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
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt className="text-navy">Total</dt>
              <dd className="text-navy">{formatPrice(grandTotal)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <BestSellers />
    </div>
  );
}
