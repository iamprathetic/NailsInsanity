import Link from "next/link";
import { site, footerPolicies } from "@/lib/site";
import { Logo } from "@/components/Logo";

export function Footer() {
  const year = 2026;
  return (
    <footer className="mt-24 border-t border-line bg-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
            Hand painted, reusable press-on nails — salon-quality nail art,
            crafted by hand and delivered across India.
          </p>
        </div>

        <div>
          <h4 className="eyebrow text-navy">Information</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerPolicies.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="text-ink/70 transition-colors hover:text-royal"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-navy">Get in touch</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            {site.contact.email && (
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="transition-colors hover:text-royal"
                >
                  {site.contact.email}
                </a>
              </li>
            )}
            {site.contact.phone && (
              <li>
                <a
                  href={`tel:${site.contact.phone}`}
                  className="transition-colors hover:text-royal"
                >
                  {site.contact.phone}
                </a>
              </li>
            )}
            {site.contact.instagram && (
              <li>
                <a
                  href={site.contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-royal"
                >
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-ink/50 sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>Free shipping across India.</p>
        </div>
      </div>
    </footer>
  );
}
