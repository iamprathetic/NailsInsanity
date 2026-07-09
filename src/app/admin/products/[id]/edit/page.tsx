import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toProductView } from "@/lib/products";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCollections } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row, collections] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCollections(),
  ]);
  if (!row) notFound();
  const p = toProductView(row);

  return (
    <AdminShell>
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/admin/products" className="hover:text-royal">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{p.name}</span>
      </nav>
      <h1 className="font-display text-3xl text-navy">Edit product</h1>
      <div className="mt-8">
        <ProductForm
          collections={collections}
          initial={{
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            sizes: p.sizes,
            images: p.images,
            stock: p.stock,
            active: p.active,
            featured: p.featured,
            collectionId: p.collectionId,
          }}
        />
      </div>
    </AdminShell>
  );
}
