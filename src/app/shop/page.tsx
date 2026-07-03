import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Shop" };

// Always reflect the latest catalog the owner has published.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="text-center">
        <p className="eyebrow text-royal">The Collection</p>
        <h1 className="mt-2 text-4xl text-navy md:text-5xl">Shop all nails</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
          Hand painted, reusable press-on sets. Free shipping across India.
        </p>
      </header>

      {products.length > 0 ? (
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-14 rounded-3xl border border-dashed border-line bg-mist/50 px-6 py-24 text-center">
          <h2 className="font-display text-2xl text-navy">
            The collection is being prepared
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            New hand-painted designs are coming soon. Please check back shortly.
          </p>
        </div>
      )}
    </div>
  );
}
