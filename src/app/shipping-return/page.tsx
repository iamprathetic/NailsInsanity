import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Shipping & Return" };

export default function ShippingReturnPage() {
  return (
    <LegalPage title="Shipping & Return">
      <h2>Shipping Policy</h2>
      <p>
        <strong>Processing Time:</strong> Your order will be ready to ship within
        4-7days working days of placing your order.
      </p>
      <p>
        <strong>Delivery Time:</strong> Shipping times may vary based on
        location, but we aim to get your order to you as quickly as possible once
        it has been processed.
      </p>
      <p>
        <strong>Shipping Regions:</strong> We ship Globally.
      </p>

      <h2>Payment Policy</h2>
      <p>
        <strong>No Cash on Delivery (COD):</strong> We do not offer COD as a
        payment option. All orders must be paid for in advance through the
        available online payment methods.
      </p>

      <h2>Cancellation and Return Policy</h2>
      <p>
        <strong>No Cancellations or Returns:</strong> We do not accept
        cancellations, returns, or exchanges. Please ensure that you review your
        order carefully before completing your purchase.
      </p>

      <h2>Claims for Damaged or Defective Products</h2>
      <p>
        <strong>Unboxing Video Required for Claims:</strong> In the rare event
        that you receive a damaged or defective product, please record an
        unboxing video. This video will be required for any claim related to
        product damage. Claims without an unboxing video will not be accepted.
      </p>

      <h2>Customer Support</h2>
      <p>
        For any queries or concerns, feel free to contact our customer support
        team. We are here to assist you and ensure a smooth shopping experience.
      </p>
    </LegalPage>
  );
}
