import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isRazorpayConfigured,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import { notifyOwnerOfOrder } from "@/lib/telegram";
import { parseJsonArray } from "@/lib/format";

type LineItem = {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
};

// Confirms an order: verifies the Razorpay signature (or accepts a demo
// confirmation when no keys are configured), marks the order paid, decrements
// stock, and pings the owner on Telegram.
export async function POST(req: Request) {
  let body: {
    reference?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    signature?: string;
    demo?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const reference = body.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotent: if already paid, just succeed.
  if (order.status !== "pending") {
    return NextResponse.json({ ok: true });
  }

  const configured = isRazorpayConfigured();

  if (configured) {
    // Real payment must carry a valid signature.
    if (
      !body.razorpayOrderId ||
      !body.razorpayPaymentId ||
      !body.signature ||
      !verifyPaymentSignature({
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        signature: body.signature,
      })
    ) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }
  } else {
    // Demo confirmation is only allowed when Razorpay is NOT configured, so it
    // can never be used to bypass a real payment in production.
    if (!body.demo) {
      return NextResponse.json({ error: "Invalid confirmation" }, { status: 400 });
    }
  }

  const items = parseJsonArray<LineItem>(order.items);

  // Mark paid + decrement stock atomically.
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        razorpayPaymentId: body.razorpayPaymentId ?? null,
      },
    });
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }
  });

  // Notify the owner (non-blocking failure).
  await notifyOwnerOfOrder({
    reference: order.reference,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    address: order.address,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    items: items.map((i) => ({
      name: i.name,
      size: i.size,
      qty: i.qty,
      price: i.price,
    })),
    total: order.total,
  });

  return NextResponse.json({ ok: true });
}
