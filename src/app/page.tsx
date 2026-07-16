import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getHomeSections } from "@/lib/collections";
import type { ProductView } from "@/lib/products";

// Render on demand so newly-added products / collections always show up.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { collections, uncategorized } = await getHomeSections();
  const isEmpty = collections.length === 0 && uncategorized.length === 0;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white">
        <div className="mx-auto max-w-6xl px-5 pt-24 pb-12 text-center md:pt-32 md:pb-16">
          <p className="eyebrow animate-fade-up text-royal">
            Hand Painted Press On Nails
          </p>
          <h1 className="animate-fade-up mx-auto mt-5 max-w-3xl text-5xl leading-[1.05] text-navy md:text-7xl">
            Made for
            <br />
            <span className="italic text-royal">modern women.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">
            Hand-painted reusable press-on nails for women who value quality,
            convenience, and flexibility.
          </p>
        </div>
      </section>

      {/* ── Collection sections ──────────────────────────────── */}
      {isEmpty ? (
        <section className="mx-auto max-w-6xl px-5 pt-8 pb-20">
          <div className="rounded-3xl border border-dashed border-line bg-mist/50 px-6 py-20 text-center">
            <h3 className="font-display text-2xl text-navy">
              New designs dropping soon
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Our latest hand-painted sets are on their way. Check back shortly —
              or follow along on Instagram for first looks.
            </p>
          </div>
        </section>
      ) : (
        <>
          {collections.map((c) => (
            <ProductSection
              key={c.id}
              eyebrow="Collection"
              title={c.name}
              products={c.products}
              href={`/collection/${c.slug}`}
            />
          ))}
          {uncategorized.length > 0 && (
            <ProductSection
              eyebrow="The Collection"
              title={collections.length ? "More designs" : "Latest designs"}
              products={uncategorized}
              href="/shop"
            />
          )}
        </>
      )}

      {/* ── Brand strip ──────────────────────────────────────── */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <p className="eyebrow text-white/60">Nails Insanity</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl leading-snug text-white md:text-4xl">
            At Nails Insanity, we believe beauty should be flexible. That&rsquo;s
            why every hand-painted set is designed to be worn when you want, and
            reused whenever you want.
          </h2>
        </div>
      </section>
    </>
  );
}

function ProductSection({
  eyebrow,
  title,
  products,
  href,
}: {
  eyebrow: string;
  title: string;
  products: ProductView[];
  href: string;
}) {
  // Card width per breakpoint — items scroll horizontally with snap.
  const cardWidth = "w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]";
  // Show the first 5 (owner-ordered) on the homepage; the rest live behind
  // the "View all" collection page.
  const preview = products.slice(0, 5);

  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 pb-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-royal">{eyebrow}</p>
          <h2 className="mt-2 text-4xl text-navy">{title}</h2>
        </div>
        <Link
          href={href}
          className="hidden shrink-0 text-sm font-medium text-navy hover:text-royal sm:inline-flex"
        >
          View all →
        </Link>
      </div>

      {/* Horizontal scroller (scrollbar hidden) */}
      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1">
        {preview.map((p) => (
          <div key={p.id} className={cardWidth}>
            <ProductCard product={p} />
          </div>
        ))}

        {/* View all card at the end of the strip */}
        <Link
          href={href}
          className={`group ${cardWidth}`}
          aria-label={`View all ${title}`}
        >
          <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-mist/40 text-navy transition-colors group-hover:border-navy group-hover:text-royal">
            <span className="text-3xl leading-none">→</span>
            <span className="mt-2 text-sm font-medium">View all</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
