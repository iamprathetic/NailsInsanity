// Verifies the collection reorder API sets sortOrder correctly.
// Uses throwaway INACTIVE products (hidden from the storefront) and cleans up.
// Run: TEST_BASE_URL=http://localhost:3001 node --env-file=.env scripts/test-reorder.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "";
const PREFIX = "ZZORDER-";

async function cleanup() {
  await prisma.product.deleteMany({ where: { name: { startsWith: PREFIX } } });
  await prisma.collection.deleteMany({ where: { name: { startsWith: PREFIX } } });
}

try {
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!login.ok) throw new Error(`login failed ${login.status}`);
  const cookie = login.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

  const create = (body) =>
    fetch(`${base}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  // 3 inactive products in a new collection.
  const p1 = await create({ name: `${PREFIX}A`, price: 1, active: false, newCollectionName: `${PREFIX}Col` });
  const colId = (await prisma.product.findUnique({ where: { id: p1.id } })).collectionId;
  const p2 = await create({ name: `${PREFIX}B`, price: 1, active: false, collectionId: colId });
  const p3 = await create({ name: `${PREFIX}C`, price: 1, active: false, collectionId: colId });

  // Reorder to C, A, B.
  const desired = [p3.id, p1.id, p2.id];
  const res = await fetch(`${base}/api/collections/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ collectionId: colId, orderedIds: desired }),
  });
  if (!res.ok) throw new Error("reorder failed " + res.status);

  const rows = await prisma.product.findMany({
    where: { id: { in: desired } },
    select: { id: true, sortOrder: true },
  });
  const byId = Object.fromEntries(rows.map((r) => [r.id, r.sortOrder]));
  const ok =
    byId[p3.id] === 0 && byId[p1.id] === 1 && byId[p2.id] === 2;
  console.log(
    ok
      ? "✅ Reorder works — sortOrder set to the chosen order (C=0, A=1, B=2)."
      : "❌ sortOrder wrong: " + JSON.stringify(byId)
  );

  // Reject reorder when not logged in.
  const noAuth = await fetch(`${base}/api/collections/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collectionId: colId, orderedIds: desired }),
  });
  console.log(noAuth.status === 401 ? "✅ Reorder requires admin (401 without auth)." : "❌ not protected");
} catch (err) {
  console.error("❌", err.message);
} finally {
  await cleanup();
  console.log("🧹 Cleaned up test data.");
  await prisma.$disconnect();
}
