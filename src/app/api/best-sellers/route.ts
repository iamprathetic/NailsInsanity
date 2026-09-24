import { NextResponse } from "next/server";
import { getBestSellers } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// Public: best-seller products shown on the checkout page.
export async function GET(req: Request) {
  if (!rateLimit(`best-sellers:${clientIp(req)}`, 60, 60 * 1000)) {
    return NextResponse.json([], { status: 429 });
  }
  try {
    const products = await getBestSellers(12);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
