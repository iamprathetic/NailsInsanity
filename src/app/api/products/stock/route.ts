import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!rateLimit(`products-stock:${clientIp(req)}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([]);
    }
    if (ids.length > 200) {
      return NextResponse.json({ error: "Too many ids" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        stock: true,
      },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}