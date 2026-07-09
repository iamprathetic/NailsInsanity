import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

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
