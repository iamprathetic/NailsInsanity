"use client";

import { shippingMethods } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export function ShippingMethodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-xl text-navy">Shipping method</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {shippingMethods.map((m) => {
          const selected = value === m.id;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => onChange(m.id)}
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
  );
}
