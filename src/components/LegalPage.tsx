import type { ReactNode } from "react";

// Shared shell for the policy / legal pages so they all look consistent.
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl text-navy md:text-5xl">{title}</h1>
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/75 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:text-navy [&_h2]:font-display [&_strong]:text-navy">
        {children}
      </div>
    </div>
  );
}

// A visible marker so the owner/developer knows this copy is a placeholder to
// be replaced with the exact wording from the current site.
export function PlaceholderNote() {
  return (
    <div className="rounded-xl border border-dashed border-royal/40 bg-royal/5 px-5 py-4 text-sm text-royal">
      <strong>Placeholder text.</strong> Replace the content on this page with
      the exact wording from the current site. Edit the file noted in the code
      comment.
    </div>
  );
}
