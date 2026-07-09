import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/format";

// A product shaped for the UI, with images/sizes parsed from their JSON
// string columns into real arrays.
export type ProductView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sizes: string[];
  images: string[];
  stock: number;
  active: boolean;
  featured: boolean;
  collectionId: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sizes: string;
  images: string;
  stock: number;
  active: boolean;
  featured: boolean;
  collectionId: string | null;
};

export function toProductView(row: ProductRow): ProductView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    sizes: parseJsonArray(row.sizes),
    images: parseJsonArray(row.images),
    stock: row.stock,
    active: row.active,
    featured: row.featured,
    collectionId: row.collectionId,
  };
}

export async function getActiveProducts(): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProductView);
}

export async function getFeaturedProducts(
  limit = 4
): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toProductView);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductView | null> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? toProductView(row) : null;
}
