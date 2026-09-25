import { z } from "zod";

// ─── Checkout ───────────────────────────────────────────

export const checkoutSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Please enter a valid email address",
    })
    .optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().trim().max(100).optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"),
  address1: z.string().min(1, "Address is required").max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z
    .string()
    .min(6, "PIN code must be 6 digits")
    .max(6, "PIN code must be 6 digits")
    .regex(/^\d{6}$/, "Please enter a valid 6-digit PIN code"),
  country: z.string().min(1, "Country is required").default("India"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Cart Item (for server-side validation) ─────────────

export const cartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  image: z.string(),
  quantity: z.number().int().positive().max(10),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

// ─── Order ID ───────────────────────────────────────────

export const orderIdSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

// ─── Contact ────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ─── Newsletter ─────────────────────────────────────────

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// ─── Admin Setup ────────────────────────────────────────

export const adminSetupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type AdminSetupFormData = z.infer<typeof adminSetupSchema>;
