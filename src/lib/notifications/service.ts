import type { EmailConfig, EmailTransport } from "@/lib/email";
import { isValidEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/seo/site";
import {
  buildEventKey,
  classifyUnknownError,
  nextRetryDelayMs,
  type NotificationEventType,
  type RecipientRole,
} from "./core";
import {
  DuplicateEventError,
  type OutboxRecord,
  type OutboxRepository,
} from "./outbox";
import {
  renderOrderCancelledCustomer,
  renderOrderDeliveredCustomer,
  renderOrderPlacedAdmin,
  renderOrderPlacedCustomer,
  renderPaymentFailedCustomer,
  renderPaymentSucceededAdmin,
  renderPaymentSucceededCustomer,
  renderOrderShippedCustomer,
  renderRefundProcessedCustomer,
  type OrderEmailSnapshot,
} from "@/lib/email-templates";

/**
 * Notification service: schedules durable outbox rows from trusted events and
 * delivers them through an injectable transport. All order data is read from
 * the database at delivery time — nothing customer-submitted is trusted.
 */

/** Order fields the service needs; loaded fresh from the database. */
export interface OrderNotificationRow {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  codFee: number;
  total: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: unknown;
  items: { name: string; quantity: number; price: number }[];
  payments: {
    status: string;
    amount: number;
    method: string | null;
    razorpayPaymentId: string | null;
    /** Raw metadata JSON from the Payment row (error_description etc.). */
    metadata?: unknown;
  }[];
}

export interface NotificationDeps {
  repo: OutboxRepository;
  transport: EmailTransport;
  loadOrder(orderId: string): Promise<OrderNotificationRow | null>;
  config(): EmailConfig;
  /** Injectable clock for deterministic tests. */
  now?(): Date;
}

/** How long a `processing` lock is held before another worker may reclaim. */
export const LOCK_STALE_MS = 10 * 60_000;

function nowOf(deps: NotificationDeps): Date {
  return deps.now ? deps.now() : new Date();
}

function addressLines(shippingAddress: unknown): string[] {
  if (!shippingAddress || typeof shippingAddress !== "object") return [];
  const a = shippingAddress as Record<string, unknown>;
  const pick = (key: string) =>
    typeof a[key] === "string" && a[key] ? String(a[key]) : "";
  return [
    pick("address1"),
    pick("address2"),
    [pick("city"), pick("state")].filter(Boolean).join(", "),
    [pick("postalCode"), pick("country")].filter(Boolean).join(" "),
  ].filter(Boolean);
}

/**
 * Builds the template snapshot from a database row. Paid amount and refund
 * reference come from persisted Payment rows only — never from the event.
 */
export function buildSnapshot(
  order: OrderNotificationRow,
  extras?: { failureReason?: string | null }
): OrderEmailSnapshot {
  const successful = order.payments.find(
    (p) => p.status === "success" || p.status === "refunded"
  );
  const refunded = order.payments.find((p) => p.status === "refunded");
  const refundMeta = refunded?.metadata as
    | { refund_amount?: unknown; refund_id?: unknown }
    | null
    | undefined;
  const refundAmount =
    typeof refundMeta?.refund_amount === "number" &&
    Number.isFinite(refundMeta.refund_amount)
      ? (refundMeta.refund_amount as number)
      : null;
  const refundId =
    typeof refundMeta?.refund_id === "string" ? refundMeta.refund_id : null;
  const primary = order.payments[0];
  const snapshot: OrderEmailSnapshot = {
    orderNumber: order.orderNumber,
    orderUrl: absoluteUrl(`/order-success/${order.id}`),
    customerName: order.customerName,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    codFee: order.codFee,
    total: order.total,
    paymentMethod: primary?.method ?? "cod",
    paymentStatus: primary?.status ?? "pending",
    orderStatus: order.status,
    shippingAddressLines: addressLines(order.shippingAddress),
    paidAmount: successful ? successful.amount : null,
    refundAmount,
    refundReference: refundId ?? refunded?.razorpayPaymentId ?? null,
    failureReason: extras?.failureReason ?? null,
    customerEmail: order.customerEmail,
  };
  return snapshot;
}

/** Renders subject+HTML for an event/recipient pair from current DB state. */
export function renderNotification(
  eventType: NotificationEventType,
  recipientRole: RecipientRole,
  order: OrderNotificationRow,
  extras?: { failureReason?: string | null }
): { subject: string; html: string } | null {
  const snapshot = buildSnapshot(order, extras);
  switch (eventType) {
    case "ORDER_PLACED":
      return recipientRole === "customer"
        ? renderOrderPlacedCustomer(snapshot)
        : renderOrderPlacedAdmin(snapshot);
    case "PAYMENT_SUCCEEDED":
      return recipientRole === "customer"
        ? renderPaymentSucceededCustomer(snapshot)
        : renderPaymentSucceededAdmin(snapshot);
    case "PAYMENT_FAILED":
      return recipientRole === "customer"
        ? renderPaymentFailedCustomer(snapshot)
        : null;
    case "ORDER_SHIPPED":
      return recipientRole === "customer"
        ? renderOrderShippedCustomer(snapshot)
        : null;
    case "ORDER_DELIVERED":
      return recipientRole === "customer"
        ? renderOrderDeliveredCustomer(snapshot)
        : null;
    case "ORDER_CANCELLED":
      return recipientRole === "customer"
        ? renderOrderCancelledCustomer(snapshot)
        : null;
    case "REFUND_PROCESSED":
      return recipientRole === "customer"
        ? renderRefundProcessedCustomer(snapshot)
        : null;
    default:
      return null;
  }
}

export interface ScheduleResult {
  scheduled: boolean;
  duplicate?: boolean;
  id?: string;
  skippedReason?: string;
}

/**
 * Durably records a notification for a trusted (eventType, orderId, role).
 * Idempotent: concurrent or repeated calls for the same logical event collapse
 * onto one outbox row. Never throws — scheduling must not break checkout,
 * webhooks or admin actions.
 */
export async function scheduleNotification(
  deps: NotificationDeps,
  params: {
    eventType: NotificationEventType;
    orderId: string;
    recipientRole: RecipientRole;
  }
): Promise<ScheduleResult> {
  try {
    const { eventType, orderId, recipientRole } = params;

    const order = await deps.loadOrder(orderId);
    if (!order) {
      return { scheduled: false, skippedReason: "order not found" };
    }

    let recipient: string | null;
    if (recipientRole === "customer") {
      recipient = isValidEmail(order.customerEmail)
        ? order.customerEmail
        : null;
    } else {
      recipient = deps.config().adminEmail;
    }
    if (!recipient) {
      return {
        scheduled: false,
        skippedReason:
          recipientRole === "admin"
            ? "ADMIN_NOTIFICATION_EMAIL not configured"
            : "customer email missing or invalid",
      };
    }

    const rendered = renderNotification(eventType, recipientRole, order);
    if (!rendered) {
      return { scheduled: false, skippedReason: "no template for event" };
    }

    const eventKey = buildEventKey(eventType, orderId, recipientRole);
    try {
      const record = await deps.repo.create({
        eventKey,
        eventType,
        orderId,
        recipient,
        recipientRole,
        subject: rendered.subject,
      });
      return { scheduled: true, id: record.id };
    } catch (error) {
      if (error instanceof DuplicateEventError) {
        return { scheduled: false, duplicate: true };
      }
      throw error;
    }
  } catch (error) {
    console.error(
      "[notifications] schedule failed",
      error instanceof Error ? error.message : "unknown error"
    );
    return { scheduled: false, skippedReason: "scheduling error" };
  }
}

/**
 * Delivers one claimed row. Renders from current order state, sends through
 * the transport, and records sent/failed with bounded backoff. Never throws.
 */
export async function deliverClaimed(
  deps: NotificationDeps,
  claimed: OutboxRecord
): Promise<void> {
  const now = nowOf(deps);
  try {
    if (!claimed.orderId || !isValidEmail(claimed.recipient)) {
      await deps.repo.markFailure(
        claimed.id,
        now,
        null,
        "invalid recipient or missing order"
      );
      return;
    }

    const order = await deps.loadOrder(claimed.orderId);
    if (!order) {
      await deps.repo.markFailure(claimed.id, now, null, "order not found");
      return;
    }

    const failedPayment = order.payments.find((p) => p.status === "failed");
    const failureMeta = failedPayment?.metadata as
      | { error_description?: unknown }
      | null
      | undefined;
    const rendered = renderNotification(
      claimed.eventType,
      claimed.recipientRole,
      order,
      {
        failureReason:
          typeof failureMeta?.error_description === "string"
            ? failureMeta.error_description.slice(0, 160)
            : null,
      }
    );
    if (!rendered) {
      await deps.repo.markFailure(claimed.id, now, null, "no template for event");
      return;
    }

    const result = await deps.transport.send({
      to: claimed.recipient,
      subject: claimed.subject || rendered.subject,
      html: rendered.html,
    });

    if (result.ok) {
      await deps.repo.markSent(claimed.id, nowOf(deps));
      return;
    }

    const delay = result.retryable
      ? nextRetryDelayMs(claimed.attempts)
      : null;
    await deps.repo.markFailure(
      claimed.id,
      nowOf(deps),
      delay === null ? null : new Date(nowOf(deps).getTime() + delay),
      result.reason ?? "delivery failed"
    );
  } catch (error) {
    const failure = classifyUnknownError(error);
    const delay = failure.retryable ? nextRetryDelayMs(claimed.attempts) : null;
    await deps.repo.markFailure(
      claimed.id,
      nowOf(deps),
      delay === null ? null : new Date(nowOf(deps).getTime() + delay),
      failure.reason
    );
  }
}

/** Processes a single scheduled notification immediately (inline best-effort). */
export async function processNotificationById(
  deps: NotificationDeps,
  id: string
): Promise<void> {
  const now = nowOf(deps);
  const claimed = await deps.repo.claimById(id, now, LOCK_STALE_MS);
  if (!claimed) return;
  await deliverClaimed(deps, claimed);
}

/**
 * Cron entry point: claims and delivers every due notification (pending or
 * retryable-failed rows past their backoff, plus stale processing locks).
 */
export async function processDueNotifications(
  deps: NotificationDeps,
  options?: { limit?: number }
): Promise<{ processed: number }> {
  const now = nowOf(deps);
  const claimed = await deps.repo.claimDue(
    now,
    LOCK_STALE_MS,
    options?.limit ?? 25
  );
  for (const row of claimed) {
    await deliverClaimed(deps, row);
  }
  return { processed: claimed.length };
}

/**
 * Authorized admin retry: requeues a failed notification and attempts
 * delivery immediately. Terminal failures only — sent rows are never resent.
 */
export async function retryNotification(
  deps: NotificationDeps,
  id: string
): Promise<{ ok: boolean; reason?: string }> {
  const now = nowOf(deps);
  const reset = await deps.repo.resetForRetry(id, now);
  if (!reset) {
    return { ok: false, reason: "notification not found or already sent" };
  }
  await processNotificationById(deps, id);
  const after = await deps.repo.findById(id);
  return after?.status === "sent"
    ? { ok: true }
    : { ok: false, reason: after?.lastError ?? "delivery failed" };
}
