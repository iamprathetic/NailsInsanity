import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <LegalPage title="About Us">
      <p>
        Nails Insanity started with a simple idea: beautiful nails
        shouldn&rsquo;t mean sitting in a salon chair for hours, or committing
        to a design you&rsquo;re stuck with for weeks. Every set we make is
        hand-painted, reusable, and designed to fit real life — put them on
        for a night out, take them off the next morning, and wear them again
        whenever you want.
      </p>

      <h2>What We Make</h2>
      <p>
        Each design starts as hand-painted artwork, not a printed pattern —
        so no two sets look quite like anything you&rsquo;d find on a shelf.
        Every set comes in multiple sizes so you can find your fit without
        the guesswork, and they&rsquo;re built to be worn, removed, and worn
        again.
      </p>

      <h2>Why We Do It</h2>
      <p>
        We believe beauty should be flexible — convenient enough for a
        weekday, special enough for an occasion, and always made with care.
        That&rsquo;s the standard behind every set that leaves our hands.
      </p>

      <h2>Get in Touch</h2>
      <p>
        Have a question about an order, a design, or just want to say hi?
        Reach out any time on{" "}
        <a href="/contact" className="text-royal underline underline-offset-2">
          our contact page
        </a>{" "}
        — we&rsquo;d love to hear from you.
      </p>
    </LegalPage>
  );
}
