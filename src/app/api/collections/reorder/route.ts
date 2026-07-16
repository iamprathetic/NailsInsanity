import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

// Reorder the products within a collection (admin only). The client sends the
// full ordered list of product ids; we store each product's position as
// sortOrder so the homepage/collection page can show them in that order.
export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let collectionId = "";
  let orderedIds: string[] = [];
  try {
    const body = await req.json();
    collectionId = typeof body.collectionId === "string" ? body.collectionId : "";
    orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.filter((x: unknown) => typeof x === "string")
      : [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!collectionId || orderedIds.length === 0) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // Only touch products that actually belong to this collection.
  const owned = await prisma.product.findMany({
    where: { collectionId, id: { in: orderedIds } },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((p) => p.id));

  await prisma.$transaction(
    orderedIds
      .filter((id) => ownedIds.has(id))
      .map((id, index) =>
        prisma.product.update({ where: { id }, data: { sortOrder: index } })
      )
  );

  return NextResponse.json({ ok: true });
}
