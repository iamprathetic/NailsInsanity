import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

// Handles product image uploads from the admin panel.
//
// PRODUCTION (Vercel): if BLOB_READ_WRITE_TOKEN is set, files are stored in
// Vercel Blob (persistent, CDN-served). This is added automatically when you
// create a Blob store in the Vercel dashboard.
//
// LOCAL DEV: with no Blob token, files are written to /public/uploads so the
// admin panel works locally without any extra setup.

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP or GIF images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 5 MB" },
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const name = `${crypto.randomUUID()}.${ext}`;

  // Production: store in Vercel Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${name}`, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  }

  // Local dev: write to /public/uploads.
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, name), bytes);

  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
