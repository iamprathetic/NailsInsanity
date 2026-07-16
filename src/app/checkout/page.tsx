"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/Button";

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
  const { items, total, clear, mysteryCount } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      // 1. Create the order server-side (prices/total are recomputed from the DB).
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
        }),
      });

      const data = await createRes.json();
      if (!createRes.ok) {
        setError(data.error || "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      // 2a. Demo mode (no Razorpay keys configured yet) — confirm directly.
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

      // 2b. Real Razorpay checkout.
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount * 100, // paise
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
    <div className="mx-auto max-w-5xl px-5 py-14">
      <h1 className="text-4xl text-navy">Checkout</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
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
            {loading ? "Processing…" : `Pay ${formatPrice(total)}`}
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
                <span className="text-ink/70">
                  🎁 Mystery Set × {mysteryCount}
                </span>
                <span className="text-green-700">FREE</span>
              </li>
            )}
          </ul>
          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="text-green-700">Free</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt className="text-navy">Total</dt>
              <dd className="text-navy">{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
