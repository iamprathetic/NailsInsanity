import { prisma } from "@/lib/prisma";
import { formatPrice, parseJsonArray } from "@/lib/format";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

type LineItem = { name: string; size?: string; qty: number; price: number };

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-navy">Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <h2 className="font-display text-xl text-navy">No orders yet</h2>
          <p className="mt-2 text-sm text-ink/60">
            New orders will appear here as customers check out.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => {
            const items = parseJsonArray<LineItem>(o.items);
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-navy">
                      {o.reference}
                    </p>
                    <p className="text-xs text-ink/50">
                      {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-navy">
                      {formatPrice(o.total)}
                    </span>
                    <OrderStatusSelect id={o.id} status={o.status} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                  {/* Items */}
                  <div>
                    <p className="eyebrow text-royal">Items</p>
                    <ul className="mt-2 space-y-1 text-sm text-ink/70">
                      {items.map((i, idx) => (
                        <li key={idx}>
                          {i.name}
                          {i.size ? ` (${i.size})` : ""} × {i.qty} —{" "}
                          {formatPrice(i.price * i.qty)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="eyebrow text-royal">Ship to</p>
                    <div className="mt-2 text-sm text-ink/70">
                      <p className="text-navy">{o.customerName}</p>
                      <p>{o.phone}</p>
                      <p>{o.email}</p>
                      <p className="mt-1">
                        {o.address}, {o.city}, {o.state} - {o.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
