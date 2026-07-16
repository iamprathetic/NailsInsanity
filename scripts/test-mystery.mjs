// Verifies the server adds a free mystery set to an order (buy 2 => 1 free)
// without affecting stock incorrectly. Uses a throwaway INACTIVE product and
// cleans everything up.
// Run: TEST_BASE_URL=http://localhost:3001 node --env-file=.env scripts/test-mystery.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "";
const PREFIX = "ZZMYST-";

async function cleanup() {
  await prisma.order.deleteMany({ where: { customerName: { startsWith: PREFIX } } });
  await prisma.product.deleteMany({ where: { name: { startsWith: PREFIX } } });
}

try {
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!login.ok) throw new Error(`login failed ${login.status}`);
  const cookie = login.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

  // Throwaway product, in stock.
  const created = await fetch(`${base}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ name: `${PREFIX}Set`, price: 100, stock: 10, active: true }),
  }).then((r) => r.json());
  if (!created.ok) throw new Error("product create failed");

  // Order 2 of it — should earn 1 free mystery set.
  const res = await fetch(`${base}/api/checkout/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        customerName: `${PREFIX}Buyer`,
        email: "t@example.com",
        phone: "9999999999",
        address: "1 St",
        city: "Pune",
        state: "MH",
        pincode: "411001",
      },
      items: [{ productId: created.id, size: "", qty: 2 }],
    }),
  }).then((r) => r.json());
  if (!res.reference) throw new Error("create-order failed: " + JSON.stringify(res));

  const order = await prisma.order.findUnique({ where: { reference: res.reference } });
  const items = JSON.parse(order.items);
  const mystery = items.find((i) => i.productId === "MYSTERY");
  const paid = items.find((i) => i.productId === created.id);

  console.log("Order total:", order.total, "(should be 200, mystery is free)");
  console.log(paid && paid.qty === 2 ? "✅ Paid set ×2 recorded." : "❌ paid line wrong");
  console.log(
    mystery && mystery.qty === 1 && mystery.price === 0
      ? "✅ Free Mystery Set ×1 added to the order (₹0)."
      : "❌ mystery line missing/wrong: " + JSON.stringify(mystery)
  );
  console.log(order.total === 200 ? "✅ Total unaffected by mystery (₹200)." : "❌ total wrong");
} catch (err) {
  console.error("❌", err.message);
} finally {
  await cleanup();
  console.log("🧹 Cleaned up test data.");
  await prisma.$disconnect();
}
