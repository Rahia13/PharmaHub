import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  phone: z.string().trim().min(6, "Please enter a valid mobile number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

/** First human-readable message from a zod error. */
export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid input.";
}

export const addressSchema = z.object({
  label: z.enum(["Home", "Office"]),
  recipientName: z.string().trim().min(2, "Please enter the recipient's name.").max(100),
  phone: z.string().trim().min(6, "Please enter a valid mobile number.").max(20),
  addressLine: z.string().trim().min(5, "Please enter the full address.").max(300),
});

const cartLines = z
  .array(
    z.object({
      productId: z.string().min(1).max(64),
      quantity: z.number().int().min(1).max(20),
    })
  )
  .min(1, "Your cart is empty.")
  .max(50);

export const quoteSchema = z.object({
  items: cartLines,
  promoCode: z.string().max(32).nullish(),
});

export const orderSchema = z.object({
  items: cartLines,
  addressId: z.string().min(1, "Please select a delivery address."),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "card"]),
  promoCode: z.string().max(32).nullish(),
});

export const prescriptionFieldsSchema = z.object({
  patientName: z.string().trim().min(2, "Please enter the patient's name.").max(100),
  notes: z.string().trim().max(500).default(""),
});

export const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({
    decision: z.literal("reject"),
    reason: z.string().trim().min(3, "Please give a reason for rejecting.").max(300),
  }),
]);

/** Merge duplicate product lines so each product appears once. */
export function mergeLines(lines: { productId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const l of lines) map.set(l.productId, (map.get(l.productId) ?? 0) + l.quantity);
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1, "Please choose a star rating.").max(5),
  comment: z.string().trim().max(1000, "Review is too long (max 1000 characters).").default(""),
});
