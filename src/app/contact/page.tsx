import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl text-navy md:text-5xl">Contact Us</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
        We&rsquo;d love to hear from you. Reach out with any questions about our
        hand painted press-on nails, your order, or anything else. For the
        quickest response, message us on Instagram DM or WhatsApp.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {site.contact.phone && (
          <ContactCard
            label="Phone"
            value={site.contact.phone}
            href={`tel:${site.contact.phone}`}
          />
        )}
        {site.contact.whatsapp && (
          <ContactCard
            label="WhatsApp"
            value={site.contact.phone || site.contact.whatsapp}
            href={`https://wa.me/${site.contact.whatsapp}`}
          />
        )}
        {site.contact.email && (
          <ContactCard
            label="Email"
            value={site.contact.email}
            href={`mailto:${site.contact.email}`}
          />
        )}
        {site.contact.instagram && (
          <ContactCard
            label="Instagram"
            value="@nailsinsanity"
            href={site.contact.instagram}
          />
        )}
      </div>
    </div>
  );
}

function ContactCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-2xl border border-line bg-mist/40 p-5 transition-colors hover:border-navy"
    >
      <p className="eyebrow text-royal">{label}</p>
      <p className="mt-2 text-navy">{value}</p>
    </a>
  );
}
