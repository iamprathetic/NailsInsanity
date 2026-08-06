"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { nav } from "@/lib/site";
import { useCart } from "@/components/CartProvider";
import { Logo } from "@/components/Logo";

export function Nav() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  useEffect(() => {
    async function loadCollections() {
      try {
        const res = await fetch("/api/collections");
        if (!res.ok) return;
        const data = await res.json();
        setCollections(data);
      } catch {
        // Ignore network errors
      }
    }

    loadCollections();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm tracking-wide transition-colors hover:text-royal ${
                  active ? "text-navy font-semibold" : "text-ink/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {/* Collections */}
          <div
            className="relative"
            onMouseEnter={() => setCollectionsOpen(true)}
            onMouseLeave={() => setCollectionsOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm tracking-wide text-ink/70 transition-colors hover:text-royal">
              Collections
              <svg
                className={`h-4 w-4 transition-transform ${
                  collectionsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 9l6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {collectionsOpen && (
              <div className="absolute left-0 mt-3 w-60 rounded-2xl border border-line bg-white shadow-xl">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.slug}`}
                    className="block px-5 py-3 text-sm text-ink hover:bg-mist"
                  >
                    {collection.name}
                  </Link>
                ))}
                -
              </div>
            )}
          </div>
          <CartLink count={count} />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 md:hidden">
          <CartLink count={count} />
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="text-navy"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d={open ? "M6 6l12 12M6 18L18 6" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-white md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-3 text-sm text-ink/80 hover:bg-mist"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-line">
            <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
              Collections
            </p>

            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                onClick={() => setOpen(false)}
                className="block px-8 py-3 text-sm text-ink/80 hover:bg-mist"
              >
                {collection.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative inline-flex items-center text-navy hover:text-royal"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 7h12l-1 12H7L6 7zm3 0a3 3 0 0 1 6 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-royal px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
