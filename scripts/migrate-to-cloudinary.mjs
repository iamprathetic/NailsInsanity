// One-time migration: copy every product image from Vercel Blob into Cloudinary
// and update each product's image URLs in the database.
//
// Images are pulled through the LIVE site's public image optimizer (so no Blob
// token is needed). Failures keep the old URL, so it's safe to re-run.
//
// Run: node --env-file=.env scripts/migrate-to-cloudinary.mjs

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();
const LIVE = process.env.MIGRATE_LIVE_URL || "https://www.nailsinsanity.com";

if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const isBlobUrl = (u) =>
  typeof u === "string" && u.includes("blob.vercel-storage.com");

async function downloadViaLive(blobUrl) {
  const enc = encodeURIComponent(blobUrl);
  const url = `${LIVE}/_next/image?url=${enc}&w=3840&q=75`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error("empty/invalid image");
  return buf;
}

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "nailsinsanity", resource_type: "image" },
        (err, result) =>
          err || !result
            ? reject(err || new Error("upload failed"))
            : resolve(result.secure_url)
      )
      .end(buffer);
  });
}

const cache = new Map(); // blobUrl -> cloudinaryUrl (dedupe)

async function migrateUrl(blobUrl) {
  if (cache.has(blobUrl)) return cache.get(blobUrl);
  const buf = await downloadViaLive(blobUrl);
  const newUrl = await uploadBuffer(buf);
  cache.set(blobUrl, newUrl);
  return newUrl;
}

const products = await prisma.product.findMany();
console.log(`Scanning ${products.length} products…\n`);

let migrated = 0,
  failed = 0,
  skipped = 0,
  productsUpdated = 0;

for (const p of products) {
  let imgs;
  try {
    imgs = JSON.parse(p.images);
  } catch {
    imgs = [];
  }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  let changed = false;
  const newImgs = [];
  for (const u of imgs) {
    if (isBlobUrl(u)) {
      try {
        newImgs.push(await migrateUrl(u));
        changed = true;
        migrated++;
      } catch (e) {
        console.log(`  ! ${p.name}: failed ${String(u).split("/").pop()} — ${e.message}`);
        newImgs.push(u); // keep old on failure
        failed++;
      }
    } else {
      newImgs.push(u);
      skipped++;
    }
  }

  if (changed) {
    await prisma.product.update({
      where: { id: p.id },
      data: { images: JSON.stringify(newImgs) },
    });
    productsUpdated++;
    console.log(`✓ ${p.name} (${newImgs.length} images)`);
  }
}

console.log(
  `\nDone. ${productsUpdated} products updated · ${migrated} images migrated · ${failed} failed · ${skipped} already-migrated/non-blob · ${cache.size} unique uploads.`
);
await prisma.$disconnect();
