// Shared constants for the "buy N, get 1 free mystery set" promotion.

// For every this many paid sets, the customer earns one free mystery set.
export const MYSTERY_EVERY = 2;

// Sentinel product id used for the free mystery line item in an order. It is
// NOT a real product, so stock updates must skip it.
export const MYSTERY_PRODUCT_ID = "MYSTERY";

// Label shown to the customer and the owner.
export const MYSTERY_NAME = "🎁 Mystery Set (revealed on delivery)";
