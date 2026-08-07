import { NextResponse } from "next/server";
import { evaluateCoupon } from "@/lib/coupon";

// Public: checks a coupon for the current cart and returns the discount.
export async function POST(req: Request) {
  let code = "";
  let qty = 0;
  let subtotal = 0;
  try {
    const b = await req.json();
    code = String(b.code ?? "");
    qty = Math.max(0, Math.floor(Number(b.qty) || 0));
    subtotal = Math.max(0, Math.floor(Number(b.subtotal) || 0));
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request" },
      { status: 400 }
    );
  }
  const result = await evaluateCoupon(code, qty, subtotal);
  return NextResponse.json(result);
}
