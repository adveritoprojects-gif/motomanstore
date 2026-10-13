import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

// Depends on runtime payment config (and the shopper's cart) — never prerender.
export const dynamic = "force-dynamic";

/**
 * Online payments are only offered when Razorpay is configured:
 *  - server: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (used to create/verify orders)
 *  - client: NEXT_PUBLIC_RAZORPAY_KEY_ID (public key id shown in the checkout widget)
 * The public key is intentionally NOT derived from the secret key so a live
 * key never enables the storefront by accident — set the public key explicitly
 * (test mode first) to switch Pay Online on.
 */
function razorpayCheckoutConfig(): { enabled: boolean; keyId: string | null } {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null;
  const serverConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
  return { enabled: Boolean(keyId) && serverConfigured, keyId };
}

export default function CheckoutPage() {
  const { enabled, keyId } = razorpayCheckoutConfig();

  return (
    <CheckoutForm razorpayKeyId={enabled ? keyId : null} razorpayEnabled={enabled} />
  );
}
