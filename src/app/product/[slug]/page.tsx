import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { getRelatedForProduct } from "@/lib/collections";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const related = await getRelatedForProduct(product.id, product.collectionId);
  const cardWidth = "w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-8 text-sm text-ink/50">
        <Link href="/shop" className="hover:text-royal">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {/* More from the same collection */}
      {related && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-royal">Collection</p>
              <h2 className="mt-2 text-3xl text-navy md:text-4xl">
                More from {related.name}
              </h2>
            </div>
            <Link
              href={`/collection/${related.slug}`}
              className="hidden shrink-0 text-sm font-medium text-navy hover:text-royal sm:inline-flex"
            >
              View all →
            </Link>
          </div>

          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1">
            {related.products.map((p) => (
              <div key={p.id} className={cardWidth}>
                <ProductCard product={p} />
              </div>
            ))}
            <Link
              href={`/collection/${related.slug}`}
              className={`group ${cardWidth}`}
              aria-label={`View all ${related.name}`}
            >
              <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-mist/40 text-navy transition-colors group-hover:border-navy group-hover:text-royal">
                <span className="text-3xl leading-none">→</span>
                <span className="mt-2 text-sm font-medium">View all</span>
              </div>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
