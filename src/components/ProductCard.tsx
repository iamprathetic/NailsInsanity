import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { ProductView } from "@/lib/products";

export function ProductCard({ product }: { product: ProductView }) {
  const image = product.images[0];
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mist">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-navy/20">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 16l5-5 4 4 3-3 4 4M4 6h16v12H4z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-navy">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3.5">
        <h3 className="font-display text-lg text-navy transition-colors group-hover:text-royal">
          {product.name}
        </h3>
        <p className="mt-0.5 text-sm text-ink/70">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
