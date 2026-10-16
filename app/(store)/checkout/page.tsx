import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

// Depends on runtime payment config (and the shopper's cart) — never prerender.
export const dynamic = "force-dynamic";

/**
 * Online payments are offered when Razorpay is configured on the server:
 *  - RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET create and verify Razorpay orders.
 *    The secret never reaches the client.
 *  - NEXT_PUBLIC_RAZORPAY_KEY_ID optionally overrides the key id shown by the
 *    checkout widget (useful to force test mode). Razorpay's key id is public
 *    by design — it ships to the browser with every checkout — so the server
 *    key id is a valid fallback when the public override is not set. Without
 *    that fallback a deployment that only sets the server credentials would
 *    silently disable Pay Online.
 */
function razorpayCheckoutConfig(): { enabled: boolean; keyId: string | null } {
  const serverConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
  if (!serverConfigured) return { enabled: false, keyId: null };

  const keyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null;
  return { enabled: Boolean(keyId), keyId };
}

export default function CheckoutPage() {
  const { enabled, keyId } = razorpayCheckoutConfig();

  return (
    <CheckoutForm razorpayKeyId={enabled ? keyId : null} razorpayEnabled={enabled} />
  );
}
