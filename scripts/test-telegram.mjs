// Sends a test message to the owner's Telegram to verify the bot setup.
// Run with:  node --env-file=.env scripts/test-telegram.mjs
// (reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from .env — nothing is printed)

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error(
    "❌ TELEGRAM_BOT_TOKEN and/or TELEGRAM_CHAT_ID are missing in .env"
  );
  process.exit(1);
}

const text = [
  "✅ *Nails Insanity* — Telegram alerts are working!",
  "",
  "This is a test message. You'll get one like this (with order details)",
  "every time a customer places an order.",
].join("\n");

try {
  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    }
  );
  const data = await res.json();
  if (data.ok) {
    console.log("✅ Test message sent! Check your Telegram.");
  } else {
    // Print Telegram's error (does NOT include your token)
    console.error("❌ Telegram rejected the request:", data.description);
    console.error(
      "   Common fixes: make sure you messaged your bot first, and that the chat ID is correct."
    );
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Could not reach Telegram:", err.message);
  process.exit(1);
}
