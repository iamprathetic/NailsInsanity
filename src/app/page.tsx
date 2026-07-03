import { ButtonLink } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts, getActiveProducts } from "@/lib/products";

// Render on demand so newly-added / featured products always show up.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);
  // Fall back to newest products if nothing is flagged "featured" yet.
  const showcase = featured.length
    ? featured
    : (await getActiveProducts()).slice(0, 4);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center md:py-32">
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
          <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/shop" size="lg">
              Shop the collection
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline">
              Get in touch
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Trust badges ─────────────────────────────────────── */}
      <section className="border-y border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              title: "Hand Painted",
              desc: "Every design is painted by hand with attention to detail.",
            },
            { title: "Reusable", desc: "Wear, remove, repeat" },
            {
              title: "24 Nails Included",
              desc: "Multiple sizes in every set for a better fit.",
            },
          ].map((b) => (
            <div key={b.title} className="px-4 py-8 text-center">
              <h3 className="font-display text-xl text-navy">{b.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow text-royal">The Collection</p>
            <h2 className="mt-2 text-4xl text-navy">Latest designs</h2>
          </div>
          <ButtonLink
            href="/shop"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            View all →
          </ButtonLink>
        </div>

        {showcase.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-line bg-mist/50 px-6 py-20 text-center">
            <h3 className="font-display text-2xl text-navy">
              New designs dropping soon
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Our latest hand-painted sets are on their way. Check back shortly —
              or follow along on Instagram for first looks.
            </p>
          </div>
        )}
      </section>

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
