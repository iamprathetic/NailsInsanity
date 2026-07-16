import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getCollectionBySlug } from "@/lib/collections";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCollectionBySlug(slug);
  return { title: c ? c.name : "Collection" };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCollectionBySlug(slug);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="text-center">
        <p className="eyebrow text-royal">Collection</p>
        <h1 className="mt-2 text-4xl text-navy md:text-5xl">{c.name}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
          Hand painted, reusable press-on sets. Free shipping across India.
        </p>
      </header>

      {c.products.length > 0 ? (
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {c.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-sm text-ink/60">
          No products in this collection yet.
        </p>
      )}
    </div>
  );
}
