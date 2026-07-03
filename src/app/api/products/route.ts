import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { productInputSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";

// Create a product (admin only).
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const slug = await uniqueSlug(data.name);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      sizes: JSON.stringify(data.sizes),
      images: JSON.stringify(data.images),
      stock: data.stock,
      active: data.active,
      featured: data.featured,
    },
  });

  return NextResponse.json({ ok: true, id: product.id, slug });
}

// Generate a URL-safe slug that isn't already taken.
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "product";
  let slug = base;
  let n = 1;
  // Loop until we find a free slug.
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
