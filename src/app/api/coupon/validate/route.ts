import { NextResponse } from "next/server";
import { evaluateCoupon } from "@/lib/coupon";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// Public: checks a coupon for the current cart and returns the discount.
export async function POST(req: Request) {
  // 20 checks per minute per IP — enough for normal cart use, but limits
  // scripted enumeration of coupon codes.
  if (!rateLimit(`coupon-validate:${clientIp(req)}`, 20, 60 * 1000)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

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
