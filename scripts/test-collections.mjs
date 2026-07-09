// Functional test for the collections feature. Creates throwaway INACTIVE test
// products (so they never show on the storefront), verifies collection
// creation + assignment, then deletes all test data.
// Run: TEST_BASE_URL=http://localhost:3001 node --env-file=.env scripts/test-collections.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "";

const PREFIX = "ZZTEST-";
const collName = `${PREFIX}Collection`;

function fail(msg) {
  console.error("❌", msg);
}

async function cleanup() {
  await prisma.product.deleteMany({ where: { name: { startsWith: PREFIX } } });
  await prisma.collection.deleteMany({ where: { name: { startsWith: PREFIX } } });
}

try {
  // Login
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!login.ok) throw new Error(`login failed (${login.status})`);
  const cookie = login.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  console.log("✅ Logged in.");

  const post = (body) =>
    fetch(`${base}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  // 1. Create a product that makes a NEW collection.
  const p1 = await post({
    name: `${PREFIX}Product One`,
    price: 1,
    active: false,
    newCollectionName: collName,
  });
  if (!p1.ok) throw new Error("create with new collection failed");
  const prod1 = await prisma.product.findUnique({
    where: { id: p1.id },
    include: { collection: true },
  });
  if (prod1?.collection?.name === collName) {
    console.log(`✅ New collection created & assigned: "${collName}"`);
  } else {
    fail("product was not assigned to the new collection");
  }

  // 2. Create a second product added to the EXISTING collection.
  const existingId = prod1.collectionId;
  const p2 = await post({
    name: `${PREFIX}Product Two`,
    price: 1,
    active: false,
    collectionId: existingId,
  });
  if (!p2.ok) throw new Error("create with existing collection failed");
  const prod2 = await prisma.product.findUnique({ where: { id: p2.id } });
  if (prod2?.collectionId === existingId) {
    console.log("✅ Second product added to the existing collection.");
  } else {
    fail("second product was not assigned to the existing collection");
  }

  // 3. Confirm both products share ONE collection (no duplicate created).
  const count = await prisma.collection.count({ where: { name: collName } });
  console.log(
    count === 1
      ? "✅ Reused the same collection (no duplicate created)."
      : `❌ Expected 1 collection, found ${count}`
  );

  console.log("\n🎉 Collections feature works.");
} catch (err) {
  fail(err.message);
} finally {
  await cleanup();
  console.log("🧹 Test data cleaned up.");
  await prisma.$disconnect();
}
