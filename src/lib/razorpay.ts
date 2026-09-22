import Razorpay from "razorpay";
import crypto from "crypto";
import type {
  RazorpayInstance,
  RazorpayOrderCreateParams,
  RazorpayVerificationParams,
} from "@/types/razorpay";

let razorpayInstance: RazorpayInstance | null = null;

export function getRazorpayInstance(): RazorpayInstance {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  }) as unknown as RazorpayInstance;

  return razorpayInstance;
}

export async function createRazorpayOrder(params: RazorpayOrderCreateParams) {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.create(params);
}

export function verifyRazorpaySignature(params: RazorpayVerificationParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Razorpay secret not configured");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const a = Buffer.from(expectedSignature);
  const b = Buffer.from(razorpay_signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const a = Buffer.from(expectedSignature);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
