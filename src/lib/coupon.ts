import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export type CouponResult =
  | { ok: true; code: string; discount: number; message: string }
  | { ok: false; message: string };

// Validates a coupon against the current cart and returns the discount (in
// rupees). Used both by the checkout "Apply" button and — authoritatively —
// when the order is created, so a customer can't fake a discount.
export async function evaluateCoupon(
  rawCode: string,
  cartQty: number,
  subtotal: number
): Promise<CouponResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a coupon code." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return { ok: false, message: "Invalid coupon code." };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: "This coupon has expired." };
  }
  if (cartQty < coupon.minSets) {
    const need = coupon.minSets;
    return {
      ok: false,
      message: `Add ${need} set${need > 1 ? "s" : ""} or more to use this coupon.`,
    };
  }

  let discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  // Never discount more than the subtotal.
  discount = Math.max(0, Math.min(discount, subtotal));

  return {
    ok: true,
    code,
    discount,
    message: `Coupon applied — you saved ${formatPrice(discount)}.`,
  };
}
