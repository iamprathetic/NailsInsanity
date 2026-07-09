// Checks whether the live site is in Razorpay LIVE mode or still demo mode.
// Run: TEST_BASE_URL=https://your-site.vercel.app node --env-file=.env scripts/test-razorpay.mjs

const base = process.env.TEST_BASE_URL;
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "";

if (!base) {
  console.error("❌ Set TEST_BASE_URL.");
  process.exit(1);
}

// Log in to reach the admin dashboard.
const loginRes = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});
if (!loginRes.ok) {
  console.error(`❌ Admin login failed (status ${loginRes.status}).`);
  process.exit(1);
}
const cookies = loginRes.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");

// The dashboard shows a "Demo mode" banner only when Razorpay is NOT configured.
const dash = await fetch(`${base}/admin`, { headers: { Cookie: cookies } });
const html = await dash.text();

if (html.includes("Demo mode")) {
  console.log("⚠️ Still in DEMO mode — Razorpay keys are not active on the live site.");
  console.log("   Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Vercel (Production) and redeploy.");
  process.exit(1);
} else {
  console.log("✅ LIVE payment mode — Razorpay is configured. Real payments are ON. 🎉");
}
