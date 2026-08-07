// Central brand / site configuration. Edit these once and they update
// everywhere (nav, footer, metadata, contact page, etc.).

export const site = {
  name: "Nails Insanity",
  tagline: "Hand Painted Press On Nails",
  // Shown in the footer and Contact page. Update with the owner's real details.
  contact: {
    email: "Nailsinsanity@gmail.com",
    phone: "9013202408",
    instagram: "https://instagram.com/nailsinsanity",
    whatsapp: "919013202408", // with country code, for wa.me links
  },
  // Free shipping across India (v1 scope).
  shipping: {
    freeIndia: true,
  },
  currency: {
    code: "INR",
    symbol: "₹", // ₹
    locale: "en-IN",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerPolicies = [
  { label: "Store Policy", href: "/store-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Shipping & Return", href: "/shipping-return" },
  { label: "Contact Us", href: "/contact" },
] as const;

// Shipping methods offered at checkout. `fee` is in whole rupees.
// Change the express `fee` here to update it everywhere.
export const shippingMethods = [
  {
    id: "free",
    label: "Free shipping",
    eta: "Ships within 7–14 days",
    fee: 0,
  },
  {
    id: "express",
    label: "Express shipping",
    eta: "Ships within 2–4 days",
    fee: 300,
  },
] as const;

export type ShippingMethodId = (typeof shippingMethods)[number]["id"];

// Server-safe lookup of a shipping fee (defaults to free / 0).
export function shippingFeeFor(id: string): number {
  return shippingMethods.find((m) => m.id === id)?.fee ?? 0;
}
