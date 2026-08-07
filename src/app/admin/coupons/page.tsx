import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { CouponsAdmin } from "@/components/admin/CouponsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const coupons = rows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minSets: c.minSets,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    active: c.active,
  }));

  return (
    <AdminShell>
      <h1 className="font-display text-3xl text-navy">Coupons</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Create discount codes customers can apply at checkout. Set the discount,
        a minimum number of sets to qualify, and an optional expiry.
      </p>
      <div className="mt-6">
        <CouponsAdmin coupons={coupons} />
      </div>
    </AdminShell>
  );
}
