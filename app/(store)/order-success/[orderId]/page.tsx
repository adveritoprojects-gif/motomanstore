import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { getOrder } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const address = order.shippingAddress;

  return (
    <Container size="xl" className="py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-950">
            Order Confirmed!
          </h1>
          <p className="text-neutral-500">
            Thank you for your purchase. We&apos;ll send you an email with the order details.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          {/* Order Number */}
          <div className="mb-6 rounded-lg bg-neutral-50 p-4 text-center">
            <p className="mb-1 text-sm text-neutral-500">Order Number</p>
            <p className="text-xl font-bold tracking-wider text-neutral-950">
              {order.orderNumber}
            </p>
          </div>

          {/* Status & Amount */}
          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-green-600 capitalize">
                {order.status}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                Amount Paid
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {formatPrice(order.total)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                Items
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6 border-t border-neutral-200 pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-950">
              <Package className="h-4 w-4" />
              Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                      <Package className="h-5 w-5 text-neutral-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Qty: {item.quantity} &times; {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2">
                <span className="font-semibold text-neutral-950">Total</span>
                <span className="font-bold text-neutral-950">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-950">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h3>
            <p className="text-sm text-neutral-600">
              {order.customerName}
              <br />
              {address.address1}
              {address.address2 && (
                <>
                  <br />
                  {address.address2}
                </>
              )}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </p>
          </div>

          {/* Delivery Estimate */}
          <div className="mt-6 rounded-lg bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  Estimated Delivery
                </p>
                <p className="text-sm text-orange-700">
                  Your order will be delivered within 5-7 business days.
                  You&apos;ll receive a tracking link once your order is shipped.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <p className="mt-4 text-center text-xs text-neutral-400">
            A confirmation email has been sent to{" "}
            <span className="font-medium text-neutral-600">
              {order.customerEmail}
            </span>
          </p>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </Container>
  );
}
