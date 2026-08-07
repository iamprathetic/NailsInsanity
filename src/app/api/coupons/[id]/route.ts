import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { couponInputSchema } from "@/lib/validation";

function parseExpiry(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T23:59:59`);
  return isNaN(d.getTime()) ? null : d;
}

// Update a coupon (admin only).
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = couponInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const code = data.code.toUpperCase();

  // Guard against changing to a code that another coupon already uses.
  const clash = await prisma.coupon.findUnique({ where: { code } });
  if (clash && clash.id !== id) {
    return NextResponse.json(
      { error: "A coupon with that code already exists." },
      { status: 400 }
    );
  }

  await prisma.coupon.update({
    where: { id },
    data: {
      code,
      type: data.type,
      value: data.value,
      minSets: data.minSets,
      expiresAt: parseExpiry(data.expiresAt),
      active: data.active,
    },
  });

  return NextResponse.json({ ok: true });
}

// Delete a coupon (admin only).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.coupon.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
