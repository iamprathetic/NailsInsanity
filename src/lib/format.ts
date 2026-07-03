import { site } from "./site";

// Format a whole-rupee amount as Indian currency, e.g. 1499 -> "₹1,499".
export function formatPrice(rupees: number): string {
  return new Intl.NumberFormat(site.currency.locale, {
    style: "currency",
    currency: site.currency.code,
    maximumFractionDigits: 0,
  }).format(rupees);
}

// Safely parse a JSON string column into a typed array, tolerating bad data.
export function parseJsonArray<T = string>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

// Turn a product name into a URL-safe slug, e.g. "Cherry Bomb!" -> "cherry-bomb".
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
