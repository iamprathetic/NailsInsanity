"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Full-screen image viewer with click/tap-to-zoom. Point (or drag on touch) to
// pan around while zoomed. Arrows / swipe to move between images, Esc to close.
export function ProductLightbox({
  images,
  index,
  setIndex,
  alt,
  onClose,
}: {
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  alt: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const go = (dir: number) => {
    setZoom(false);
    setIndex((index + dir + images.length) % images.length);
  };

  // Keyboard controls + lock body scroll while open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  function pan(e: React.MouseEvent | React.TouchEvent) {
    if (!zoom) return;
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const p = "touches" in e ? e.touches[0] : e;
    const x = ((p.clientX - rect.left) / rect.width) * 100;
    const y = ((p.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M6 18L18 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute left-1/2 top-5 z-10 -translate-x-1/2 text-sm text-white/70">
          {index + 1} / {images.length}
        </span>
      )}

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="relative h-[85vh] w-[92vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={alt}
          fill
          sizes="92vw"
          className={`select-none object-contain transition-transform duration-200 ${
            zoom ? "scale-[2.5] cursor-zoom-out" : "cursor-zoom-in"
          }`}
          style={{ transformOrigin: origin }}
          onClick={() => setZoom((z) => !z)}
          onMouseMove={pan}
          onTouchMove={pan}
          draggable={false}
          priority
        />
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
        {zoom ? "Tap to zoom out" : "Tap image to zoom"}
      </p>
    </div>
  );
}
