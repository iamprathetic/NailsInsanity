import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getBestSellers } from "@/lib/products";

export const metadata: Metadata = { title: "Best Sellers" };
export const dynamic = "force-dynamic";

export default async function BestSellersPage() {
  const products = await getBestSellers();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-8">
      <header className="text-center">
        <p className="eyebrow text-royal">Best Sellers</p>
        <h1 className="mt-2 text-4xl text-navy md:text-5xl">Best Sellers</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
          Our most-loved hand painted press-on sets. Free shipping across India.
        </p>
      </header>

      {products.length > 0 ? (
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-sm text-ink/60">
          No best sellers yet.
        </p>
      )}
    </div>
  );
}
