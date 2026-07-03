import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJsonArray } from "@/lib/format";
import { ButtonLink } from "@/components/Button";

export const metadata: Metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

type LineItem = { name: string; size?: string; qty: number; price: number };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order) notFound();

  const items = parseJsonArray<LineItem>(order.items);

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-4xl text-navy">Thank you!</h1>
      <p className="mt-3 text-ink/70">
        Your order <span className="font-semibold text-navy">{order.reference}</span>{" "}
        has been placed. A confirmation will follow shortly.
      </p>

      <div className="mt-10 rounded-2xl border border-line bg-mist/50 p-6 text-left">
        <h2 className="font-display text-lg text-navy">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3 text-sm">
              <span className="text-ink/70">
                {i.name}
                {i.size ? ` (${i.size})` : ""} × {i.qty}
              </span>
              <span className="text-navy">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line pt-4 text-base font-semibold">
          <span className="text-navy">Total</span>
          <span className="text-navy">{formatPrice(order.total)}</span>
        </div>
        <p className="mt-4 text-sm text-ink/60">
          Shipping to: {order.address}, {order.city}, {order.state} -{" "}
          {order.pincode}
        </p>
      </div>

      <div className="mt-10">
        <ButtonLink href="/shop" size="lg">
          Continue shopping
        </ButtonLink>
      </div>
    </div>
  );
}
