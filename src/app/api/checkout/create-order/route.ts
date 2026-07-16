import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { customerSchema, checkoutItemSchema } from "@/lib/validation";
import {
  isRazorpayConfigured,
  getRazorpayClient,
} from "@/lib/razorpay";
import {
  MYSTERY_EVERY,
  MYSTERY_PRODUCT_ID,
  MYSTERY_NAME,
} from "@/lib/mystery";

const bodySchema = z.object({
  customer: customerSchema,
  items: z.array(checkoutItemSchema).min(1),
});

// Short, human-friendly order reference, e.g. NI-8F3K2A.
function makeReference(): string {
  const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `NI-${raw.slice(0, 6)}`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in all shipping details correctly." },
      { status: 400 }
    );
  }
  const { customer, items } = parsed.data;

  // Recompute everything from the database — never trust prices from the client.
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lineItems: {
    productId: string;
    name: string;
    size: string;
    qty: number;
    price: number;
  }[] = [];
  let total = 0;

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: "One of the items is no longer available." },
        { status: 400 }
      );
    }
    if (product.stock < item.qty) {
      return NextResponse.json(
        { error: `"${product.name}" is out of stock.` },
        { status: 400 }
      );
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      size: item.size,
      qty: item.qty,
      price: product.price,
    });
    total += product.price * item.qty;
  }

  if (total <= 0) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  // Free mystery sets: one for every MYSTERY_EVERY paid sets. Computed here on
  // the server so it can't be manipulated by the client. Free (price 0), so the
  // total is unchanged. The owner picks the actual set(s) when fulfilling.
  const paidQty = lineItems.reduce((n, i) => n + i.qty, 0);
  const mysteryCount = Math.floor(paidQty / MYSTERY_EVERY);
  if (mysteryCount > 0) {
    lineItems.push({
      productId: MYSTERY_PRODUCT_ID,
      name: MYSTERY_NAME,
      size: "",
      qty: mysteryCount,
      price: 0,
    });
  }

  const reference = makeReference();

  // Persist the order in a pending state.
  const order = await prisma.order.create({
    data: {
      reference,
      customerName: customer.customerName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      items: JSON.stringify(lineItems),
      total,
      status: "pending",
    },
  });

  // Demo mode: no Razorpay keys yet — the client will confirm directly.
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ demo: true, reference, amount: total });
  }

  // Real payment: create a matching Razorpay order (amount in paise).
  try {
    const rzp = getRazorpayClient();
    const rzpOrder = await rzp.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: reference,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      demo: false,
      reference,
      amount: total,
      razorpayOrderId: rzpOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: "Payment gateway error. Please try again." },
      { status: 502 }
    );
  }
}
