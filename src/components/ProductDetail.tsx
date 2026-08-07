"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ProductView } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/CartProvider";
import { Button } from "@/components/Button";
import { ProductLightbox } from "@/components/ProductLightbox";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";

export function ProductDetail({ product }: { product: ProductView }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [size, setSize] = useState<string>(
    product.sizes.length ? "" : "one-size"
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const [liveStock, setLiveStock] = useState(product.stock);
  const soldOut = liveStock <= 0;
  const needsSize = product.sizes.length > 0;
  const refreshStock = useCallback(async () =>  {
    try {
      const res = await fetch(`/api/products/${product.id}/stock`);

      if (!res.ok) return;

      const latest = await res.json();

      setLiveStock(latest.stock);
    } catch {
    // Ignore network errors
    }
  }, [product.id]);
  useEffect(() => {
     refreshStock();

     const interval = setInterval(refreshStock, 60000);

     return () => clearInterval(interval);
   }, [refreshStock]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        refreshStock();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
   }, [refreshStock]);
  useEffect(() => {
    if (qty > liveStock) {
      setQty(liveStock === 0 ? 1 : liveStock);
    }
   }, [liveStock]);

  function handleAdd(buyNow: boolean) {
    if (needsSize && !size) {
      setError("Please select a size.");
      return;
    }
    setError("");
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: needsSize ? size : "",
      qty,
      stock: liveStock,
      image: product.images[0] ?? "",
    });
    if (buyNow) {
      router.push("/cart");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
    <div className="grid gap-10 md:grid-cols-2 md:gap-14">
      {/* Gallery */}
      <div>
        <div
          className={`relative aspect-square overflow-hidden rounded-3xl bg-mist ${
            product.images[activeImage] ? "cursor-zoom-in" : ""
          }`}
          onClick={() =>
            product.images[activeImage] && setLightboxOpen(true)
          }
        >
          {product.images[activeImage] ? (
            <>
              <Image
                src={cloudinaryUrl(product.images[activeImage], 1600)}
                alt={product.name}
                fill
                unoptimized
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-navy shadow-sm backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Tap to zoom
              </span>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-navy/20">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 16l5-5 4 4 3-3 4 4M4 6h16v12H4z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                  i === activeImage ? "border-navy" : "border-transparent"
                }`}
              >
                <Image
                  src={cloudinaryUrl(img, 160)}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="md:pt-4">
        <h1 className="text-4xl text-navy md:text-5xl">{product.name}</h1>
        <p className="mt-3 text-2xl text-royal">{formatPrice(product.price)}</p>

        {/* Size selector */}
        {needsSize && (
          <div className="mt-8">
            <p className="text-sm font-medium text-navy">Size</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setError("");
                  }}
                  className={`min-w-11 rounded-full border px-4 py-2 text-sm transition-colors ${
                    size === s
                      ? "border-navy bg-navy text-white"
                      : "border-navy/25 text-navy hover:border-navy"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mt-8">
          <p className="text-sm font-medium text-navy">Quantity</p>
          <div className="mt-3 inline-flex items-center rounded-full border border-navy/25">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-2 text-lg text-navy hover:text-royal"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min (q + 1, liveStock))}
              disabled={qty >= liveStock}
              className={`px-4 py-2 text-lg transition ${qty >= liveStock ? "cursor-not-allowed text-gray-300" : "text-navy hover:text-royal"}`}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        {liveStock !== product.stock && (
          <p className="mt-3 text-sm text-orange-600">
            Stock has been updated.
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="outline"
            disabled={soldOut}
            onClick={() => handleAdd(false)}
            className="flex-1"
          >
            {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
          </Button>
          <Button
            size="lg"
            disabled={soldOut}
            onClick={() => handleAdd(true)}
            className="flex-1"
          >
            Buy now
          </Button>
          {soldOut && (<p className="mt-4 text-sm font-medium text-red-600">This product is currently out of stock.</p>)}
        </div>

        {product.description && (
          <p className="mt-8 whitespace-pre-line text-[15px] leading-relaxed text-ink/70">
            {product.description}
          </p>
        )}

        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-ink/60">
          <li>✓ Hand-painted with precision</li>
          <li>✓ Designed to be reused</li>
          <li>✓ 24 nails in every set</li>
          <li>✓ Available in multiple nail shapes</li>
          <li>✓ Premium finish and durability</li>
          <li>✓ Made for modern lifestyles</li>
        </ul>
      </div>
    </div>

    {lightboxOpen && product.images.length > 0 && (
      <ProductLightbox
        images={product.images}
        index={activeImage}
        setIndex={setActiveImage}
        alt={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  );
}
