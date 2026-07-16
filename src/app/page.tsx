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
            />
          ))}
          {uncategorized.length > 0 && (
            <ProductSection
              eyebrow="The Collection"
              title={collections.length ? "More designs" : "Latest designs"}
              products={uncategorized}
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
}: {
  eyebrow: string;
  title: string;
  products: ProductView[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 pb-14">
      <div>
        <p className="eyebrow text-royal">{eyebrow}</p>
        <h2 className="mt-2 text-4xl text-navy">{title}</h2>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
