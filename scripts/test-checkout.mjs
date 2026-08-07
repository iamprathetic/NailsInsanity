// Functional test: shipping fee + coupon discount are computed correctly on the
// server. Uses a throwaway coupon + product, then cleans up.
// Run: TEST_BASE_URL=http://localhost:3001 node --env-file=.env scripts/test-checkout.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const P = "ZZCHK-";

async function cleanup() {
  await prisma.order.deleteMany({ where: { customerName: { startsWith: P } } });
  await prisma.product.deleteMany({ where: { name: { startsWith: P } } });
  await prisma.coupon.deleteMany({ where: { code: { startsWith: P } } });
}

const customer = {
  customerName: `${P}Buyer`, email: "t@e.com", phone: "9999999999",
  address: "1 St", city: "Pune", state: "MH", pincode: "411001",
};

async function order(body) {
  return fetch(`${base}/api/checkout/create-order`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

try {
  await cleanup();
  const prod = await prisma.product.create({
    data: { name: `${P}Set`, slug: `${P.toLowerCase()}set`, price: 500, stock: 20, active: true },
  });
  await prisma.coupon.create({
    data: { code: `${P}10`, type: "percent", value: 10, minSets: 2, active: true },
  });

  // Case 1: 2 sets (subtotal 1000) + express (99) + 10% coupon (100) => 999
  const r1 = await order({
    customer, items: [{ productId: prod.id, size: "", qty: 2 }],
    shippingMethod: "express", couponCode: `${P}10`,
  });
  const o1 = await prisma.order.findUnique({ where: { reference: r1.reference } });
  console.log(
    o1.total === 999 && o1.discount === 100 && o1.shippingFee === 99 && o1.shippingMethod === "express" && o1.couponCode === `${P}10`
      ? "✅ Case 1: subtotal 1000 − 100 coupon + 99 express = ₹999 ✔"
      : `❌ Case 1 wrong: total=${o1.total} discount=${o1.discount} ship=${o1.shippingFee} method=${o1.shippingMethod}`
  );

  // Case 2: 1 set (subtotal 500), coupon needs 2 => not applied; free shipping => 500
  const r2 = await order({
    customer, items: [{ productId: prod.id, size: "", qty: 1 }],
    shippingMethod: "free", couponCode: `${P}10`,
  });
  const o2 = await prisma.order.findUnique({ where: { reference: r2.reference } });
  console.log(
    o2.total === 500 && o2.discount === 0 && o2.shippingFee === 0 && o2.couponCode === null
      ? "✅ Case 2: coupon rejected (min sets not met), free shipping = ₹500 ✔"
      : `❌ Case 2 wrong: total=${o2.total} discount=${o2.discount} coupon=${o2.couponCode}`
  );

  // Case 3: fake/invalid coupon => ignored
  const r3 = await order({
    customer, items: [{ productId: prod.id, size: "", qty: 2 }],
    shippingMethod: "free", couponCode: "TOTALLYFAKE",
  });
  const o3 = await prisma.order.findUnique({ where: { reference: r3.reference } });
  console.log(
    o3.total === 1000 && o3.discount === 0
      ? "✅ Case 3: invalid coupon ignored, no discount = ₹1000 ✔"
      : `❌ Case 3 wrong: total=${o3.total} discount=${o3.discount}`
  );
} catch (e) {
  console.error("❌", e.message);
} finally {
  await cleanup();
  console.log("🧹 Cleaned up.");
  await prisma.$disconnect();
}
