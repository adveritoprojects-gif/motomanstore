"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShoppingBag,
  CreditCard,
  Loader2,
  Shield,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { checkoutSchema } from "@/lib/validations";
import type { CheckoutFormData } from "@/lib/validations";
import { createOrder } from "@/lib/actions";
import { Container } from "@/components/ui/container";

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

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shippingCost;

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
    if (items.length === 0) {
      router.push("/shop");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await createOrder(
        data,
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
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      // Open Razorpay checkout
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        setError("Payment system not configured. Please try again later.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: String(Math.round(result.amount * 100)),
        currency: "INR",
        name: "MOTOMAN",
        description: `Order #${result.orderId.slice(-8).toUpperCase()}`,
        order_id: result.razorpayOrderId,
        handler: () => {
          // Payment succeeded — redirect to success page
          clearCart();
          router.push(`/order-success/${result.orderId}`);
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
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
            setIsProcessing(false);
          },
          escape: false,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
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
        <div className="grid gap-8 lg:grid-cols-12">
          {/* ── Shipping Form ── */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="mb-6 text-lg font-semibold text-neutral-950">
                Shipping Information
              </h2>

              {/* Name */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    First Name *
                  </label>
                  <input
                    {...register("firstName")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                    Last Name 
                  </label>
                  <input
                    {...register("lastName")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                  Email Address *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={cn(
                    "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                    "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                    "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-colors outline-none focus:border-orange-500 focus:ring-orange-500/20"
                  placeholder="Street, locality, landmark"
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    City *
                  </label>
                  <input
                    {...register("city")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                      "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    State *
                  </label>
                  <select
                    {...register("state")}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors outline-none",
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
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-500"
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
                  className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-colors outline-none focus:border-orange-500 focus:ring-orange-500/20"
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
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-xl border border-neutral-200 bg-white p-6">
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
                        <p className="text-xs text-neutral-400">
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
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-500">Subtotal</span>
                  <span className="text-sm font-medium text-neutral-700">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-500">Shipping</span>
                  <span className="text-sm font-medium text-neutral-700">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="mb-2 text-xs text-neutral-400">
                    Free shipping on orders above {formatPrice(999)}
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                  <span className="text-base font-semibold text-neutral-950">
                    Total
                  </span>
                  <span className="text-xl font-bold text-neutral-950">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

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
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
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
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[11px]">Razorpay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  <span className="text-[11px]">Insured</span>
                </div>
              </div>

              {/* Payment methods */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-neutral-400">
                  UPI / Cards / NetBanking / Wallets
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </Container>
  );
}
