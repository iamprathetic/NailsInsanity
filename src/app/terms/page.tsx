import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        Welcome to Nails Insanity! By using our website and placing an order, you
        agree to the following terms:
      </p>

      <h2>1. Product Information</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>All our nails are hand-painted and made with precision and care.</li>
        <li>
          Each set contains 24 nails in multiple sizes to reduce sizing issues.
        </li>
        <li>Colors may slightly vary due to screen display differences.</li>
        <li>Product designs are handmade and may have slight variations.</li>
      </ul>

      <h2>2. Orders &amp; Payments</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Orders must be paid in full at checkout.</li>
        <li>We accept payments through secure payment gateways only.</li>
        <li>Once an order is placed, it cannot be canceled or changed.</li>
      </ul>

      <h2>3. Shipping &amp; Delivery</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Orders are processed only after full payment is received.</li>
        <li>Delivery timelines vary depending on location and order volume.</li>
        <li>Shipping charges are calculated at checkout.</li>
      </ul>

      <h2>4. Returns &amp; Refunds</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          We do not offer returns or refunds as these are handmade hygiene
          products.
        </li>
        <li>
          In case of damage during shipping, please contact us within 24 hours
          of delivery with proof.
        </li>
      </ul>

      <h2>5. Use of Press-On Nails</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Nails must be applied following our instructions using glue tabs or
          liquid glue.
        </li>
        <li>Longevity depends on your application method and lifestyle.</li>
        <li>We are not responsible for misuse or improper application.</li>
      </ul>

      <h2>7. Contact &amp; Support</h2>
      <p>
        For any queries or concerns, please reach out to us via Instagram DM or
        WhatsApp.
      </p>
    </LegalPage>
  );
}
