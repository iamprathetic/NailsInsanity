// Verifies the admin login works with whatever credentials are in .env.
// Run with:  node --env-file=.env scripts/test-admin-login.mjs
// Reads ADMIN_USERNAME / ADMIN_PASSWORD from .env and attempts a login against
// the running dev server. Nothing sensitive is printed.

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "";

if (!password) {
  console.error("❌ ADMIN_PASSWORD is empty in .env");
  process.exit(1);
}

try {
  // 1. Correct credentials should succeed.
  const good = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  // 2. A wrong password should be rejected (proves it's really checking).
  const bad = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: password + "_wrong" }),
  });

  if (good.ok && bad.status === 401) {
    console.log(`✅ Admin login works. Username in use: "${username}"`);
    console.log("   (Correct credentials accepted, wrong password rejected.)");
  } else if (!good.ok) {
    console.error(
      `❌ Login FAILED with the credentials in .env (status ${good.status}).`
    );
    console.error("   Did the server restart after you edited .env?");
    process.exit(1);
  } else {
    console.error(
      `⚠️ Login succeeded but a wrong password was NOT rejected (status ${bad.status}).`
    );
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Could not reach the server:", err.message);
  console.error("   Make sure the dev server is running on", base);
  process.exit(1);
}
