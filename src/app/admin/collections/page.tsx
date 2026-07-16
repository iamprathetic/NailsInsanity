import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/format";
import { AdminShell } from "@/components/admin/AdminShell";
import { CollectionOrderManager } from "@/components/admin/CollectionOrderManager";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-navy">Collections</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Reorder each collection&rsquo;s products with the ↑ ↓ arrows. The first
        <strong className="text-navy"> 5 </strong> appear on the homepage; the
        rest sit behind the &ldquo;View all&rdquo; link. Changes save
        automatically.
      </p>

      {collections.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <h2 className="font-display text-xl text-navy">No collections yet</h2>
          <p className="mt-2 text-sm text-ink/60">
            Create a collection by assigning it to a product on the Add / Edit
            product screen.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {collections.map((c) => (
            <CollectionOrderManager
              key={c.id}
              collectionId={c.id}
              collectionName={c.name}
              initial={c.products.map((p) => ({
                id: p.id,
                name: p.name,
                image: parseJsonArray<string>(p.images)[0] ?? "",
              }))}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
