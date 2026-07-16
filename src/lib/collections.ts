import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { toProductView, type ProductView } from "@/lib/products";

export type HomeSection = {
  id: string;
  name: string;
  slug: string;
  products: ProductView[];
};

// Collections (each with their active products) plus any products that aren't
// in a collection — used to build the homepage sections.
export async function getHomeSections(): Promise<{
  collections: HomeSection[];
  uncategorized: ProductView[];
}> {
  const [collections, uncategorized] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        products: {
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        },
      },
    }),
    prisma.product.findMany({
      where: { active: true, collectionId: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    collections: collections
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        products: c.products.map(toProductView),
      }))
      .filter((c) => c.products.length > 0),
    uncategorized: uncategorized.map(toProductView),
  };
}

export type CollectionOption = {
  id: string;
  name: string;
  slug: string;
};

// All collections, alphabetical — used to populate the admin dropdown.
export async function getCollections(): Promise<CollectionOption[]> {
  const rows = await prisma.collection.findMany({
    orderBy: { name: "asc" },
  });
  return rows.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
}

// One collection with its active products, for the collection page.
export async function getCollectionBySlug(
  slug: string
): Promise<{ name: string; slug: string; products: ProductView[] } | null> {
  const c = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: { where: { active: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!c) return null;
  return { name: c.name, slug: c.slug, products: c.products.map(toProductView) };
}

// Given what the product form submitted, return the collection id to store on
// the product (or null for "no collection"). Creates a new collection when a
// name is supplied; reuses an existing one if the name already matches.
export async function resolveCollectionId(input: {
  collectionId?: string | null;
  newCollectionName?: string;
}): Promise<string | null> {
  const newName = input.newCollectionName?.trim();

  if (newName) {
    const slug = slugify(newName) || "collection";
    // Reuse a collection with the same slug if it already exists.
    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await prisma.collection.create({
      data: { name: newName, slug },
    });
    return created.id;
  }

  if (input.collectionId) return input.collectionId;
  return null;
}
