import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type PaymentStatus = "pending" | "success" | "failed" | "refunded";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment";
}

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const styles =
    type === "payment"
      ? PAYMENT_STATUS_STYLES[status as PaymentStatus]
      : ORDER_STATUS_STYLES[status as OrderStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles || "bg-neutral-100 text-neutral-600"
      )}
    >
      {status}
    </span>
  );
}
