// End-to-end production check: logs into the live admin and uploads a tiny
// test image to confirm Blob storage is active.
// Run:  TEST_BASE_URL=https://your-site.vercel.app node --env-file=.env scripts/test-live.mjs

const base = process.env.TEST_BASE_URL;
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "";

if (!base) {
  console.error("❌ Set TEST_BASE_URL to your live site URL.");
  process.exit(1);
}

// 1. Log in on the live site.
const loginRes = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});
if (!loginRes.ok) {
  console.error(`❌ Admin login FAILED on the live site (status ${loginRes.status}).`);
  console.error("   Check that ADMIN_USERNAME/ADMIN_PASSWORD are set in Vercel and match your .env.");
  process.exit(1);
}
const cookies = loginRes.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
console.log("✅ Admin login works on the live site.");

// 2. Upload a tiny 1x1 PNG to test image storage.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);
const fd = new FormData();
fd.append("file", new File([png], "blob-test.png", { type: "image/png" }));

const upRes = await fetch(`${base}/api/upload`, {
  method: "POST",
  headers: { Cookie: cookies },
  body: fd,
});
const data = await upRes.json().catch(() => ({}));

if (!upRes.ok) {
  console.error("❌ Image upload FAILED:", data.error || upRes.status);
  process.exit(1);
}

if (typeof data.url === "string" && data.url.includes("blob.vercel-storage.com")) {
  console.log("✅ Blob storage is ACTIVE — product image uploads work in production. 🎉");
  console.log("   (A 1x1 test image was uploaded; you can ignore/delete it in the Blob store.)");
} else if (typeof data.url === "string" && data.url.startsWith("/uploads/")) {
  console.error("⚠️ Upload fell back to LOCAL storage — Blob is NOT active on the deployment.");
  console.error("   Fix: ensure the Blob store is connected to THIS project, then Redeploy.");
  process.exit(1);
} else {
  console.log("Upload returned:", data.url);
}
