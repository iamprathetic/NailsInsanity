import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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