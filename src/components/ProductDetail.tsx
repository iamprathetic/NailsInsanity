"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductView } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/CartProvider";
import { Button } from "@/components/Button";

export function ProductDetail({ product }: { product: ProductView }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string>(
    product.sizes.length ? "" : "one-size"
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const soldOut = product.stock <= 0;
  const needsSize = product.sizes.length > 0;

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
    <div className="grid gap-10 md:grid-cols-2 md:gap-14">
      {/* Gallery */}
      <div>
        <div className="aspect-square overflow-hidden rounded-3xl bg-mist">
          {product.images[activeImage] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
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
          <div className="mt-4 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                  i === activeImage ? "border-navy" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className="h-full w-full object-cover"
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

        {product.description && (
          <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink/70">
            {product.description}
          </p>
        )}

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
              onClick={() => setQty((q) => q + 1)}
              className="px-4 py-2 text-lg text-navy hover:text-royal"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

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
        </div>

        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-ink/60">
          <li>✓ Hand painted, reusable press-on nails</li>
          <li>✓ Free shipping across India</li>
        </ul>
      </div>
    </div>
  );
}
