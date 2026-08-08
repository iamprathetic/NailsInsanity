"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { nav } from "@/lib/site";
import { useCart } from "@/components/CartProvider";
import { Logo } from "@/components/Logo";

// Order: Home, Shop, Collections, Contact.
const home = nav.find((n) => n.label === "Home")!;
const shop = nav.find((n) => n.label === "Shop")!;
const contact = nav.find((n) => n.label === "Contact")!;

export function Nav() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false);
  const collectionsRef = useRef<HTMLDivElement>(null);

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

  // Close the desktop Collections dropdown when clicking/tapping outside it.
  // Only listen while it's open, so it never interferes with opening.
  useEffect(() => {
    if (!collectionsOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        collectionsRef.current &&
        !collectionsRef.current.contains(e.target as Node)
      ) {
        setCollectionsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [collectionsOpen]);

  function desktopLink(item: { label: string; href: string }) {
    const active =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex">
          {desktopLink(home)}
          {desktopLink(shop)}

          {/* Collections (click/tap to toggle — works on touch) */}
          <div className="relative" ref={collectionsRef}>
            <button
              type="button"
              onClick={() => setCollectionsOpen((v) => !v)}
              aria-expanded={collectionsOpen}
              className="flex items-center gap-1 text-sm tracking-wide text-ink/70 transition-colors hover:text-royal"
            >
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
              <div className="absolute left-0 mt-3 max-h-[70vh] w-60 overflow-y-auto rounded-2xl border border-line bg-white py-1 shadow-xl">
                <Link
                  href="/best-sellers"
                  onClick={() => setCollectionsOpen(false)}
                  className="block border-b border-line px-5 py-2.5 text-sm font-medium text-navy hover:bg-mist"
                >
                  Best sellers
                </Link>
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collection/${collection.slug}`}
                    onClick={() => setCollectionsOpen(false)}
                    className="block px-5 py-2.5 text-sm text-ink hover:bg-mist"
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {desktopLink(contact)}

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
        <nav className="max-h-[80vh] overflow-y-auto border-t border-line bg-white md:hidden">
          <Link
            href={home.href}
            onClick={() => setOpen(false)}
            className="block px-5 py-3 text-sm text-ink/80 hover:bg-mist"
          >
            {home.label}
          </Link>
          <Link
            href={shop.href}
            onClick={() => setOpen(false)}
            className="block px-5 py-3 text-sm text-ink/80 hover:bg-mist"
          >
            {shop.label}
          </Link>

          <div className="border-t border-line">
            <button
              type="button"
              onClick={() => setMobileCollectionsOpen((v) => !v)}
              aria-expanded={mobileCollectionsOpen}
              className="flex w-full items-center justify-between px-5 py-3 text-sm text-ink/80 hover:bg-mist"
            >
              Collections
              <svg
                className={`h-4 w-4 transition-transform ${
                  mobileCollectionsOpen ? "rotate-180" : ""
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
            {mobileCollectionsOpen && (
              <>
                <Link
                  href="/best-sellers"
                  onClick={() => setOpen(false)}
                  className="block bg-mist/40 px-8 py-3 text-sm font-medium text-navy hover:bg-mist"
                >
                  Best sellers
                </Link>
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collection/${collection.slug}`}
                    onClick={() => setOpen(false)}
                    className="block bg-mist/40 px-8 py-3 text-sm text-ink/70 hover:bg-mist"
                  >
                    {collection.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          <Link
            href={contact.href}
            onClick={() => setOpen(false)}
            className="block border-t border-line px-5 py-3 text-sm text-ink/80 hover:bg-mist"
          >
            {contact.label}
          </Link>
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
