import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().max(4000).default(""),
  price: z.coerce.number().int("Price must be a whole number").min(0).max(1_000_000),
  sizes: z.array(z.string().trim().min(1)).max(30).default([]),
  images: z.array(z.string().trim().min(1)).max(12).default([]),
  stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  // Collection assignment: either an existing collection id, or a new
  // collection name to create. Both optional (product can have no collection).
  collectionId: z.string().trim().optional().nullable(),
  newCollectionName: z.string().trim().max(80).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const customerSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  pincode: z.string().trim().min(4).max(12),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().default(""),
  qty: z.coerce.number().int().min(1).max(50),
});
