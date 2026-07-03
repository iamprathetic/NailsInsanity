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
