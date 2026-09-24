import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

// Public: live typeahead results for the nav search bar.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  try {
    const products = await searchProducts(q, 6);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
