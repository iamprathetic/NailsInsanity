"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { ProductView } from "@/lib/products";

// Best-seller products (set per product in the admin) shown on the checkout
// page as a gentle upsell. Renders nothing if there are none.
export function BestSellers() {
  const [products, setProducts] = useState<ProductView[]>([]);

  useEffect(() => {
    fetch("/api/best-sellers")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => Array.isArray(data) && setProducts(data))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const cardWidth = "w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]";

  return (
    <section className="mt-16 border-t border-line pt-12">
      <p className="eyebrow text-royal">Before you go</p>
      <h2 className="mt-2 text-3xl text-navy md:text-4xl">Best sellers</h2>
      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1">
        {products.map((p) => (
          <div key={p.id} className={cardWidth}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
