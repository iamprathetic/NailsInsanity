import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// Public: live typeahead results for the nav search bar.
export async function GET(req: Request) {
  // 30 searches per minute per IP — well above normal typing, but blunts
  // scripted hammering of this unauthenticated endpoint.
  if (!rateLimit(`products-search:${clientIp(req)}`, 30, 60 * 1000)) {
    return NextResponse.json([], { status: 429 });
  }

  const q = new URL(req.url).searchParams.get("q") || "";
  try {
    const products = await searchProducts(q, 6);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
