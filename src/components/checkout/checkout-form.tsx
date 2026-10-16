"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  Loader2,
  Shield,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { checkoutSchema } from "@/lib/validations";
import type { CheckoutFormData } from "@/lib/validations";
import { createOrder, verifyPayment } from "@/lib/actions";
import { codHandlingFee } from "@/lib/checkout/price-cart";
import {
  RAZORPAY_CHECKOUT_SRC,
  RazorpayScriptError,
  ensureRazorpayScript,
  markRazorpayScriptLoading,
  notifyRazorpayScriptFailed,
  notifyRazorpayScriptLoaded,
} from "@/lib/checkout/razorpay-script";
import { Container } from "@/components/ui/container";

const checkoutLock = { held: false };

function subscribeNoop() {
  return () => {};
}

function claimCheckout(): boolean {
  if (checkoutLock.held) return false;
  checkoutLock.held = true;
  return true;
}

function releaseCheckout() {
  checkoutLock.held = false;
}

/**
 * `completed` flips to true as soon as Razorpay reports a successful payment
 * (the handler runs exactly once per successful payment). Some checkout
 * versions also fire `modal.ondismiss` when the modal closes after that, and
 * such a close must never be reported as a cancellation or release the
 * checkout lock while we are still verifying and navigating.
 */
const paymentState = { completed: false };

function resetPaymentCompletion() {
  paymentState.completed = false;
}

function markPaymentCompleted() {
  paymentState.completed = true;
}

function paymentAlreadyCompleted() {
  return paymentState.completed;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Andaman and Nicobar Islands",
];

interface CheckoutFormProps {
  /** Public Razorpay key id, when online payments are enabled. */
  razorpayKeyId: string | null;
  /** True when Razorpay credentials are configured on the server. */
  razorpayEnabled: boolean;
}

export function CheckoutForm({
  razorpayKeyId,
  razorpayEnabled,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The cart is rehydrated from localStorage after the server has already
  // rendered this form as empty. Until that first client render has settled,
  // "no items" only means "not rehydrated yet" — treating it as an empty cart
  // would bounce the shopper to /shop before checkout can render.
  const cartReady = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">(
    razorpayEnabled ? "razorpay" : "cod"
  );
  const [attemptId, setAttemptId] = useState(() => crypto.randomUUID());

  function choosePaymentMethod(method: "cod" | "razorpay") {
    if (isProcessing) return;
    if (method === "razorpay" && (!razorpayEnabled || !razorpayKeyId)) {
      setError(
        "Online payment is unavailable right now. You can still place a cash on delivery order.",
      );
      return;
    }
    // Clicking a card fires both the label's onClick and the radio's onChange;
    // only a real change starts a new checkout attempt.
    if (paymentMethod === method) return;
    setPaymentMethod(method);
    setAttemptId(crypto.randomUUID());
  }

  const subtotal = getTotalPrice();
  const shippingCost = 0;
  const codFee = codHandlingFee(paymentMethod);
  const total = subtotal + shippingCost + codFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      country: "India",
    },
  });

  useEffect(() => {
    // The checkout script starts loading as soon as the page renders so it is
    // ready by the time the shopper submits.
    if (razorpayEnabled) markRazorpayScriptLoading();
  }, [razorpayEnabled]);

  useEffect(() => {
    // Empty-cart bounce only after hydration: on the server (and the first
    // client render) the persisted cart has not rehydrated yet. Also skipped
    // while a placed order is navigating to its success page — otherwise
    // clearing the cart would bounce the shopper to /shop first.
    if (cartReady && items.length === 0 && !isProcessing) {
      router.push("/shop");
    }
  }, [cartReady, items.length, isProcessing, router]);

  useEffect(() => {
    // Never leave the single-flight checkout lock behind if this form is
    // unmounted mid-payment (e.g. the shopper presses Back).
    return () => releaseCheckout();
  }, []);

  if (items.length === 0) {
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!claimCheckout()) return;

    setIsProcessing(true);
    setError(null);

    // Single exit for every failure path: report, unlock and allow a retry.
    const fail = (message: string) => {
      setError(message);
      setIsProcessing(false);
      releaseCheckout();
    };

    try {
      if (paymentMethod === "razorpay") {
        if (!razorpayEnabled || !razorpayKeyId) {
          fail(
            "Online payment is unavailable right now. You can still place a cash on delivery order.",
          );
          return;
        }
        // Never open Razorpay before its checkout library has loaded, and
        // never create an order we have no way to pay for.
        await ensureRazorpayScript();
      }

      const result = await createOrder(
        {
          ...data,
          country: data.country || "India",
          paymentMethod,
          attemptId,
        },
        items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName,
        })),
      );

      if (!result.success) {
        fail(result.error);
        return;
      }

      if (result.paymentMethod === "cod") {
        clearCart();
        releaseCheckout();
        router.push(`/order-success/${result.orderId}`);
        return;
      }

      if (!razorpayKeyId || typeof window.Razorpay !== "function") {
        fail("The secure payment window could not be loaded. Please try again.");
        return;
      }

      resetPaymentCompletion();

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: String(Math.round(result.amount * 100)),
        currency: "INR",
        name: "MOTOMAN",
        description: `Order ${result.orderNumber}`,
        order_id: result.razorpayOrderId,
        handler: async (response) => {
          // Runs only for a successful payment — stop modal.ondismiss from
          // reporting a cancellation while we verify.
          markPaymentCompleted();
          try {
            const verified = await verifyPayment(response);
            if (!verified.success) {
              fail(verified.error || "Payment could not be verified. Please try again.");
              return;
            }
            clearCart();
            releaseCheckout();
            router.push(`/order-success/${verified.orderId}`);
          } catch {
            fail(
              "We could not confirm your payment. If you were charged, the order will be confirmed automatically — please contact support before paying again.",
            );
          }
        },
        prefill: {
          name: [data.firstName, data.lastName].filter(Boolean).join(" "),
          email: data.email || undefined,
          contact: data.phone,
        },
        notes: {
          address: data.address1,
          city: data.city,
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            // Fires when the shopper closes the modal without paying (and on
            // some versions right after a successful payment, hence the guard).
            if (paymentAlreadyCompleted()) return;
            fail(
              "Payment was not completed. Your cart is unchanged — you can try again.",
            );
          },
          escape: false,
        },
      });
      razorpay.open();
    } catch (err) {
      fail(
        err instanceof RazorpayScriptError
          ? err.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  };

  return (
    <Container size="xl" className="py-8 md:py-12">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </button>

      <h1 className="mb-8 text-2xl font-bold text-neutral-950 lg:text-3xl">
        Checkout
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── Shipping Form ── */}
          <div className="min-w-0 lg:col-span-7">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
              <h2 className="mb-6 text-lg font-semibold text-neutral-950">
                Shipping Information
              </h2>

              {/* Name */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    First Name *
                  </label>
                  <input
                    {...register("firstName")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                      errors.firstName
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                    )}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Last Name (optional)
                  </label>
                  <input
                    {...register("lastName")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                      errors.lastName
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                    )}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Email Address (optional)
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={cn(
                    "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                  )}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Phone Number *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className={cn(
                    "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                    errors.phone
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                  )}
                  placeholder="98765 43210"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  House / Building *
                </label>
                <input
                  {...register("address1")}
                  className={cn(
                    "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                    errors.address1
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                  )}
                  placeholder="Flat / House number"
                />
                {errors.address1 && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.address1.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Street Address
                </label>
                <input
                  {...register("address2")}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-base sm:text-sm outline-none transition-colors focus:border-orange-500 focus:ring-orange-500/20"
                  placeholder="Street, locality, landmark"
                />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    City *
                  </label>
                  <input
                    {...register("city")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                      errors.city
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                    )}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    PIN Code *
                  </label>
                  <input
                    {...register("postalCode")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                      errors.postalCode
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                    )}
                    placeholder="6-digit PIN"
                    maxLength={6}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    State *
                  </label>
                  <select
                    {...register("state")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-base sm:text-sm transition-colors outline-none",
                      errors.state
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-neutral-200 focus:border-orange-500 focus:ring-orange-500/20",
                    )}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Country
                  </label>
                  <input
                    {...register("country")}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-base sm:text-sm text-neutral-500"
                    disabled
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Order Notes (optional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-2.5 text-base sm:text-sm outline-none transition-colors focus:border-orange-500 focus:ring-orange-500/20"
                  placeholder="Any special instructions for delivery?"
                />
                {errors.notes && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="min-w-0 lg:col-span-5">
            <div className="self-start rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="mb-6 text-lg font-semibold text-neutral-950">
                Order Summary
              </h2>

              {/* Items */}
              <div className="mb-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.variantId ?? "default"}`}
                    className="flex gap-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-neutral-300" />
                      </div>
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {item.name}
                      </p>
                      {item.variantName && (
                        <p className="truncate text-xs text-neutral-400">
                          {item.variantName}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-neutral-700">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 text-sm text-neutral-500">
                    Subtotal
                  </span>
                  <span className="shrink-0 text-right text-sm font-medium text-neutral-700">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 text-sm text-neutral-500">
                    Shipping
                  </span>
                  <span className="shrink-0 text-right text-sm font-medium text-green-600">
                    Free
                  </span>
                </div>
                {codFee > 0 && (
                  <div className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 text-sm text-neutral-500">
                      COD Handling Fee
                    </span>
                    <span className="shrink-0 text-right text-sm font-medium text-neutral-700">
                      {formatPrice(codFee)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
                  <span className="min-w-0 text-base font-semibold text-neutral-950">
                    Total
                  </span>
                  <span className="shrink-0 text-right text-xl font-bold text-neutral-950">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <fieldset className="mt-6 space-y-2">
                <legend className="mb-2 text-sm font-semibold text-neutral-950">
                  Payment method
                </legend>
                {/* Pay Online — first and default when Razorpay is configured.
                    The whole card (label, icon, copy and radio) selects it. */}
                <label
                  htmlFor="payment-razorpay"
                  onClick={() => choosePaymentMethod("razorpay")}
                  className={cn(
                    "flex min-h-11 items-start gap-3 rounded-lg border px-3 py-3 transition-colors",
                    !razorpayEnabled && "cursor-not-allowed opacity-60",
                    razorpayEnabled && "cursor-pointer hover:border-orange-300",
                    paymentMethod === "razorpay"
                      ? "border-orange-500 bg-orange-50"
                      : "border-neutral-200",
                  )}
                >
                  <input
                    id="payment-razorpay"
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    disabled={!razorpayEnabled}
                    onChange={() => choosePaymentMethod("razorpay")}
                    className="mt-0.5 accent-orange-500"
                    aria-label="Pay Online with Razorpay"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                      <CreditCard className="h-4 w-4 text-orange-500" />
                      Pay Online
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {razorpayEnabled
                        ? "Pay securely online using Razorpay — UPI, cards and net banking."
                        : "Online payment is currently unavailable."}
                    </span>
                  </span>
                </label>
                {/* Cash on Delivery — with handling fee */}
                <label
                  htmlFor="payment-cod"
                  onClick={() => choosePaymentMethod("cod")}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors hover:border-orange-300",
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50"
                      : "border-neutral-200",
                  )}
                >
                  <input
                    id="payment-cod"
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => choosePaymentMethod("cod")}
                    className="mt-0.5 accent-orange-500"
                    aria-label="Cash on Delivery"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                        <Banknote className="h-4 w-4 text-orange-500" />
                        Cash on Delivery
                      </span>
                      <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                        + {formatPrice(codHandlingFee("cod"))} fee
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      Pay when your order arrives.
                    </span>
                  </span>
                </label>
              </fieldset>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isProcessing}
                className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "cod" ? (
                  <>
                    <Banknote className="h-4 w-4" />
                    Place order · {formatPrice(total)}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay {formatPrice(total)}
                  </>
                )}
              </button>

              {/* Trust signals */}
              <div className="mt-6 flex items-center justify-center gap-6 text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span className="text-[11px]">Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  <span className="text-[11px]">Free shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay checkout library — loaded by the router after hydration and
          never opened before onLoad reports success (see ensureRazorpayScript). */}
      {razorpayEnabled && (
        <Script
          id="razorpay-checkout"
          src={RAZORPAY_CHECKOUT_SRC}
          strategy="afterInteractive"
          onLoad={() => notifyRazorpayScriptLoaded()}
          onError={() => notifyRazorpayScriptFailed()}
        />
      )}
    </Container>
  );
}
