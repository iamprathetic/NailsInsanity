"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";
import type { ProductView } from "@/lib/products";

// Search takeover bar, triggered from the nav's search icon (desktop + mobile).
// Slides down from the very top of the viewport, above the sticky header, so
// one component/trigger works identically on both layouts.
export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Same mount/visible lifecycle as MiniCartDrawer: keeps a closed panel out
  // of the DOM entirely so it can't contribute to page scroll width, and
  // lets the slide transition actually animate instead of popping open.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const timer = setTimeout(() => {
        setVisible(true);
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    }
    setVisible(false);
    const timer = setTimeout(() => {
      setMounted(false);
      setQuery("");
      setResults([]);
    }, 250);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Debounced live typeahead.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        if (res.ok) setResults(await res.json());
      } catch {
        // Ignore — the user can still press Enter to see full results.
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function goToResults() {
    const q = query.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    onClose();
  }

  if (!mounted) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[85] bg-black/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={`fixed inset-x-0 top-0 z-[90] border-b border-line bg-white shadow-2xl transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-2xl px-5 py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToResults();
            }}
            className="flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-navy">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search designs…"
              className="flex-1 border-none bg-transparent text-lg text-ink outline-none placeholder:text-ink/40"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy hover:bg-mist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          {query.trim() && (
            <div className="mt-4 border-t border-line pt-4">
              {loading ? (
                <p className="py-2 text-sm text-ink/50">Searching…</p>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-line">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 py-2.5 hover:text-royal"
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist">
                          {p.images[0] && (
                            <Image
                              src={cloudinaryUrl(p.images[0], 100, 1)}
                              alt={p.name}
                              fill
                              unoptimized
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="flex-1 truncate text-sm font-medium text-navy">
                          {p.name}
                        </span>
                        <span className="shrink-0 text-sm text-ink/60">
                          {formatPrice(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-2 text-sm text-ink/50">
                  No designs found for &ldquo;{query.trim()}&rdquo;.
                </p>
              )}

              <button
                type="button"
                onClick={goToResults}
                className="mt-2 text-sm font-medium text-royal hover:underline"
              >
                See all results for &ldquo;{query.trim()}&rdquo; →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
