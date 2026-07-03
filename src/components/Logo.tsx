"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

/**
 * Brand logo. Uses the real logo image at `public/logo.png` when present, and
 * automatically falls back to a styled text wordmark if the image is missing —
 * so the site never shows a broken image.
 *
 * TO INSTALL THE LOGO: save the brand PNG to `public/logo.png`.
 */
export function Logo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [imgOk, setImgOk] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const height = compact ? 44 : 52;

  // Catch the case where the image already failed to load before React
  // attached the onError handler (e.g. during server-side render).
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgOk(false);
  }, []);

  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`inline-flex items-center ${className}`}
    >
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src="/logo.png"
          alt={`${site.name} — ${site.tagline}`}
          style={{ height, width: "auto" }}
          className="object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="inline-flex flex-col leading-none text-navy">
          <span
            className="font-display font-bold tracking-tight"
            style={{ fontSize: compact ? "1.15rem" : "1.4rem", lineHeight: 1 }}
          >
            NAILS<span className="text-royal">·</span>INSANITY
          </span>
          {!compact && (
            <span
              className="mt-1 text-navy/70"
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.28em",
                fontWeight: 600,
              }}
            >
              HAND PAINTED PRESS ON NAILS
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
