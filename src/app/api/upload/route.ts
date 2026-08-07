import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { isAdmin } from "@/lib/auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

// Handles product image uploads from the admin panel.
//
// Images are stored in Cloudinary (set CLOUDINARY_* in the environment).
// If Cloudinary isn't configured (e.g. a quick local run), images fall back to
// /public/uploads so the admin still works in dev.

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

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
      { error: "Image must be under 10 MB" },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Primary: Cloudinary.
  if (isCloudinaryConfigured()) {
    try {
      const url = await uploadToCloudinary(bytes);
      return NextResponse.json({ ok: true, url });
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return NextResponse.json(
        { error: `Image upload failed: ${(err as Error).message}` },
        { status: 500 }
      );
    }
  }

  // On Vercel without Cloudinary, local disk writes fail (read-only FS).
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Image storage isn't configured. Add your CLOUDINARY_* keys in the environment settings.",
      },
      { status: 500 }
    );
  }

  // Local dev fallback: write to /public/uploads.
  try {
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const name = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), bytes);
    return NextResponse.json({ ok: true, url: `/uploads/${name}` });
  } catch (err) {
    console.error("Local upload failed:", err);
    return NextResponse.json(
      { error: `Upload failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
