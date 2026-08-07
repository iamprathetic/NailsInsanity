import { NextResponse } from "next/server";
import { getBestSellers } from "@/lib/products";

// Public: best-seller products shown on the checkout page.
export async function GET() {
  try {
    const products = await getBestSellers(12);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
