/**
 * Pure notification-domain logic: event identity, retry backoff, error
 * classification and status-transition mapping. No I/O — unit tested.
 */

export const NOTIFICATION_EVENTS = [
  "ORDER_PLACED",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "REFUND_PROCESSED",
] as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[number];

export type RecipientRole = "customer" | "admin";

export type NotificationStatus = "pending" | "processing" | "sent" | "failed";

export function isNotificationEventType(
  value: string
): value is NotificationEventType {
  return (NOTIFICATION_EVENTS as readonly string[]).includes(value);
}

/**
 * Logical identity of one notification. One (event, order, recipient-role)
 * triple produces at most one outbox row — webhook retries and repeated
 * status updates collapse onto the same key.
 */
export function buildEventKey(
  eventType: NotificationEventType,
  orderId: string,
  recipientRole: RecipientRole
): string {
  return `${eventType}:${orderId}:${recipientRole}`;
}

export const MAX_ATTEMPTS = 6;
/** First retry after ~1 minute, doubling up to 6 hours. */
const BASE_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 6 * 60 * 60_000;

/**
 * Bounded exponential backoff for attempt `attempt` (1-based — the attempt
 * that just failed). Returns null when the retry budget is exhausted, i.e.
 * the notification is terminally failed until an explicit admin retry.
 */
export function nextRetryDelayMs(
  attempt: number,
  maxAttempts: number = MAX_ATTEMPTS
): number | null {
  if (attempt >= maxAttempts) return null;
  const exponent = Math.min(attempt - 1, 20);
  const delay = BASE_BACKOFF_MS * Math.pow(2, exponent);
  return Math.min(delay, MAX_BACKOFF_MS);
}

/**
 * Maps an order status transition (previous → next) to the customer
 * notification event it warrants, or null when nothing should be sent.
 * Repeating the same status yields null (no resend).
 */
export function transitionEvent(
  previousStatus: string,
  nextStatus: string
): NotificationEventType | null {
  if (previousStatus === nextStatus) return null;
  switch (nextStatus) {
    case "shipped":
      return "ORDER_SHIPPED";
    case "delivered":
      return "ORDER_DELIVERED";
    case "cancelled":
      return "ORDER_CANCELLED";
    default:
      return null;
  }
}

/** Minimal shape of a delivery failure the transport can report. */
export interface ClassifiedFailure {
  retryable: boolean;
  /** Safe, truncated summary — never credentials or full payloads. */
  reason: string;
}

export function classifyUnknownError(error: unknown): ClassifiedFailure {
  const message =
    error instanceof Error ? error.message : String(error ?? "unknown error");
  return { retryable: true, reason: message.slice(0, 200) };
}
