import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toProductView } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Include inactive products here (admin sees everything).
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  const products = rows.map(toProductView);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-dark"
        >
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <h2 className="font-display text-xl text-navy">No products yet</h2>
          <p className="mt-2 text-sm text-ink/60">
            Add your first hand-painted design to get started.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-block rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-dark"
          >
            + Add product
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-mist">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-navy">{p.name}</p>
                        {p.featured && (
                          <span className="text-xs text-royal">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-5 py-3 text-ink/70">{p.stock}</td>
                  <td className="px-5 py-3">
                    {p.active ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700">
                        Visible
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-sm text-royal hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
