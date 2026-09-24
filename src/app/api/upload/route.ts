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

// The browser-supplied Content-Type header is trivially spoofable, so also
// check the file's actual magic bytes before trusting it's really an image.
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 4 && bytes.toString("ascii", 0, 3) === "GIF") {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

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

  if (!sniffImageType(bytes)) {
    return NextResponse.json(
      { error: "File does not look like a valid image" },
      { status: 400 }
    );
  }

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
