import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJsonArray } from "@/lib/format";
import { AdminShell } from "@/components/admin/AdminShell";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, activeCount, orderCount, paidOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.order.findMany({ where: { status: { not: "pending" } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const demoMode = !isRazorpayConfigured();

  const stats = [
    { label: "Products", value: `${productCount}`, sub: `${activeCount} active` },
    { label: "Orders", value: `${orderCount}`, sub: "all time" },
    { label: "Revenue", value: formatPrice(revenue), sub: "paid orders" },
  ];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">Dashboard</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-dark"
        >
          + Add product
        </Link>
      </div>

      {demoMode && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Demo mode:</strong> Razorpay keys aren&rsquo;t configured yet,
          so checkout is simulated (no real payment is taken). Add your keys in
          the environment settings to accept live payments.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-white p-6"
          >
            <p className="eyebrow text-royal">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-navy">{s.value}</p>
            <p className="mt-1 text-xs text-ink/50">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg text-navy">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-royal hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink/50">
            No orders yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recentOrders.map((o) => {
              const items = parseJsonArray<{ qty: number }>(o.items);
              const qty = items.reduce((n, i) => n + i.qty, 0);
              return (
                <li
                  key={o.id}
                  className="flex items-center justify-between px-6 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-navy">{o.reference}</p>
                    <p className="text-ink/50">
                      {o.customerName} · {qty} item{qty !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-navy">{formatPrice(o.total)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    paid: "bg-green-100 text-green-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
        colors[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
