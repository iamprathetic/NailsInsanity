import { formatPrice } from "./format";

// Sends the owner an instant Telegram message when a new order is paid.
// Free: create a bot via @BotFather, then set TELEGRAM_BOT_TOKEN and
// TELEGRAM_CHAT_ID in .env. If either is missing, this is a no-op.

type OrderItem = { name: string; size?: string; qty: number; price: number };

export async function notifyOwnerOfOrder(order: {
  reference: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  total: number;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return; // alerts disabled

  const lines = order.items
    .map(
      (i) =>
        `• ${i.name}${i.size ? ` (Size: ${i.size})` : ""} ×${i.qty} — ${formatPrice(
          i.price * i.qty
        )}`
    )
    .join("\n");

  const text = [
    `🎉 *New Order — ${order.reference}*`,
    ``,
    `*Items:*`,
    lines,
    ``,
    `*Total:* ${formatPrice(order.total)}`,
    ``,
    `*Customer:* ${order.customerName}`,
    `*Phone:* ${order.phone}`,
    `*Email:* ${order.email}`,
    `*Ship to:* ${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    // Never let a notification failure break the order flow.
    console.error("Telegram notification failed:", err);
  }
}
