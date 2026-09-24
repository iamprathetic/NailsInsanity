import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function GET(req: Request) {
  if (!rateLimit(`collections:${clientIp(req)}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const collections = await prisma.collection.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load collections" },
      { status: 500 }
    );
  }
}