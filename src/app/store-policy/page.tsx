import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Store Policy" };

export default function StorePolicyPage() {
  return (
    <LegalPage title="Store Policy">
      <p>
        At Nails Insanity, your privacy is important to us. We&rsquo;re committed
        to protecting the personal information you share with us.
      </p>

      <h2>What We Collect</h2>
      <p>
        When you place an order, sign up for updates, or contact us, we may
        collect:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Name, email, phone number</li>
        <li>Shipping/billing address</li>
        <li>
          Payment details (securely processed via trusted third-party gateways)
        </li>
        <li>Order history and preferences</li>
      </ul>

      <h2>How We Use Your Info</h2>
      <p>We use your information to:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Process and ship your orders</li>
        <li>Communicate order updates</li>
        <li>Improve your experience on our website</li>
        <li>Send you occasional promotions or updates</li>
      </ul>
    </LegalPage>
  );
}
