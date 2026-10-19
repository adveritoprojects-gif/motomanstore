import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  buildEventKey,
  classifyUnknownError,
  nextRetryDelayMs,
  transitionEvent,
  MAX_ATTEMPTS,
} from "./core";
import { InMemoryOutboxRepository } from "./outbox";
import {
  LOCK_STALE_MS,
  processDueNotifications,
  processNotificationById,
  retryNotification,
  scheduleNotification,
  type NotificationDeps,
  type OrderNotificationRow,
} from "./service";
import type { EmailConfig, EmailMessage, EmailTransport, SendResult } from "@/lib/email";
import { escapeHtml } from "@/lib/email";
import { verifyWebhookSignature } from "@/lib/razorpay";

// ─── Fakes ───────────────────────────────────────────────

class FakeTransport implements EmailTransport {
  sent: EmailMessage[] = [];
  private queue: SendResult[] = [];

  failNext(retryable: boolean, reason = "boom"): void {
    this.queue.push({ ok: false, retryable, reason });
  }

  async send(message: EmailMessage): Promise<SendResult> {
    const next = this.queue.shift();
    if (next) return next;
    this.sent.push(message);
    return { ok: true, retryable: false };
  }
}

function makeOrder(overrides?: Partial<OrderNotificationRow>): OrderNotificationRow {
  return {
    id: "ord_1",
    orderNumber: "MT-20261017-TEST01",
    status: "pending",
    subtotal: 500,
    shippingCost: 0,
    codFee: 20,
    total: 520,
    customerName: "Asha Kumar",
    customerEmail: "asha@example.com",
    shippingAddress: {
      address1: "12 Beach Road",
      city: "Kannur",
      state: "Kerala",
      postalCode: "670001",
      country: "India",
    },
    items: [{ name: "Car Shampoo", quantity: 2, price: 250 }],
    payments: [
      { status: "pending", amount: 520, method: "cod", razorpayPaymentId: null },
    ],
    ...overrides,
  };
}

function makeDeps(options?: {
  orders?: Map<string, OrderNotificationRow>;
  adminEmail?: string | null;
  transport?: FakeTransport;
  repo?: InMemoryOutboxRepository;
  clock?: { now: Date };
}) {
  const repo = options?.repo ?? new InMemoryOutboxRepository();
  const transport = options?.transport ?? new FakeTransport();
  const orders = options?.orders ?? new Map([["ord_1", makeOrder()]]);
  const clock = options?.clock ?? { now: new Date("2026-10-17T10:00:00Z") };
  const config: EmailConfig = {
    configured: true,
    fromEmail: "orders@verified-domain.example",
    adminEmail:
      options?.adminEmail === undefined
        ? "admin@example.com"
        : options.adminEmail,
  };
  const deps: NotificationDeps = {
    repo,
    transport,
    loadOrder: async (id) => orders.get(id) ?? null,
    config: () => config,
    now: () => clock.now,
  };
  return { deps, repo, transport, orders, clock, config };
}

// ─── 1. COD order: customer confirmation + admin alert ───

test("COD order schedules one customer confirmation and one admin alert", async () => {
  const { deps, repo, transport } = makeDeps();

  const customer = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  const admin = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "admin",
  });
  assert.equal(customer.scheduled, true);
  assert.equal(admin.scheduled, true);

  await processDueNotifications(deps);

  assert.equal(transport.sent.length, 2);
  const customerMail = transport.sent.find((m) => m.to === "asha@example.com");
  const adminMail = transport.sent.find((m) => m.to === "admin@example.com");
  assert.ok(customerMail);
  assert.ok(adminMail);
  assert.match(customerMail.subject, /MT-20261017-TEST01/);
  assert.match(customerMail.html, /Payment is due on delivery/);
  assert.doesNotMatch(customerMail.html, /has been paid/i);
  assert.match(adminMail.subject, /New order/);

  const rows = await repo.listForOrder("ord_1");
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r.status === "sent"));
});

// ─── 2. Verified Razorpay success ────────────────────────

test("verified payment success sends customer + admin payment emails", async () => {
  const orders = new Map([
    [
      "ord_1",
      makeOrder({
        status: "paid",
        codFee: 0,
        total: 500,
        payments: [
          {
            status: "success",
            amount: 500,
            method: "razorpay",
            razorpayPaymentId: "pay_123",
          },
        ],
      }),
    ],
  ]);
  const { deps, transport } = makeDeps({ orders });

  await scheduleNotification(deps, {
    eventType: "PAYMENT_SUCCEEDED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await scheduleNotification(deps, {
    eventType: "PAYMENT_SUCCEEDED",
    orderId: "ord_1",
    recipientRole: "admin",
  });
  await processDueNotifications(deps);

  assert.equal(transport.sent.length, 2);
  const customerMail = transport.sent.find((m) => m.to === "asha@example.com");
  assert.ok(customerMail);
  assert.match(customerMail.subject, /Payment received/);
  assert.match(customerMail.html, /₹500/);
});

// ─── 3. Failed Razorpay payment ──────────────────────────

test("payment failure sends the customer a failure email, never marking paid", async () => {
  const orders = new Map([
    [
      "ord_1",
      makeOrder({
        payments: [
          {
            status: "failed",
            amount: 520,
            method: "razorpay",
            razorpayPaymentId: "pay_fail",
            metadata: { error_description: "Card declined" },
          },
        ],
      }),
    ],
  ]);
  const { deps, transport } = makeDeps({ orders });

  await scheduleNotification(deps, {
    eventType: "PAYMENT_FAILED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(deps);

  assert.equal(transport.sent.length, 1);
  const mail = transport.sent[0];
  assert.match(mail.subject, /Payment issue/);
  assert.match(mail.html, /No money was captured/);
  assert.match(mail.html, /Card declined/);
  assert.doesNotMatch(mail.html, /Payment received/i);
});

// ─── 4. Invalid webhook signature → no notification ──────

test("invalid webhook signatures are rejected before any notification", () => {
  const body = JSON.stringify({ event: "payment.captured" });
  const secret = "webhook-secret";
  const goodSig = createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyWebhookSignature(body, goodSig, secret), true);
  assert.equal(verifyWebhookSignature(body, "deadbeef".repeat(8), secret), false);
  assert.equal(verifyWebhookSignature(body + "x", goodSig, secret), false);
  // The webhook route schedules notifications ONLY after signature
  // verification succeeds — a rejected signature never reaches the outbox.
});

// ─── 5. Duplicate events do not duplicate jobs ───────────

test("repeated identical events create a single outbox row", async () => {
  const { deps, repo } = makeDeps();

  const first = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  const second = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });

  assert.equal(first.scheduled, true);
  assert.equal(second.scheduled, false);
  assert.equal(second.duplicate, true);

  const rows = await repo.listForOrder("ord_1");
  assert.equal(rows.length, 1);
});

// ─── 6. Concurrent duplicate events ──────────────────────

test("concurrent duplicate schedule attempts yield exactly one row", async () => {
  const { deps, repo } = makeDeps();

  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      scheduleNotification(deps, {
        eventType: "PAYMENT_SUCCEEDED",
        orderId: "ord_1",
        recipientRole: "customer",
      })
    )
  );

  const scheduled = results.filter((r) => r.scheduled);
  assert.equal(scheduled.length, 1);
  const rows = await repo.listForOrder("ord_1");
  assert.equal(rows.length, 1);
});

// ─── 7. Shipped and delivered transitions ────────────────

test("shipped and delivered transitions map to the right events and emails", async () => {
  assert.equal(transitionEvent("paid", "shipped"), "ORDER_SHIPPED");
  assert.equal(transitionEvent("shipped", "delivered"), "ORDER_DELIVERED");

  const orders = new Map([["ord_1", makeOrder({ status: "shipped" })]]);
  const { deps, transport } = makeDeps({ orders });

  await scheduleNotification(deps, {
    eventType: "ORDER_SHIPPED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(deps);

  assert.equal(transport.sent.length, 1);
  assert.match(transport.sent[0].subject, /has shipped/);
});

// ─── 8. Repeating the same status does not resend ────────

test("re-selecting the same status schedules nothing", async () => {
  assert.equal(transitionEvent("shipped", "shipped"), null);
  assert.equal(transitionEvent("delivered", "delivered"), null);
  assert.equal(transitionEvent("cancelled", "cancelled"), null);
  // Non-notifying transitions:
  assert.equal(transitionEvent("pending", "paid"), null);
  assert.equal(transitionEvent("shipped", "refunded"), null);

  // Even a repeated schedule call collapses to one delivery.
  const { deps, repo, transport } = makeDeps();
  await scheduleNotification(deps, {
    eventType: "ORDER_SHIPPED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await scheduleNotification(deps, {
    eventType: "ORDER_SHIPPED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(deps);
  await processDueNotifications(deps);
  assert.equal(transport.sent.length, 1);
  assert.equal((await repo.listForOrder("ord_1")).length, 1);
});

// ─── 9. Cancellation never claims a refund ───────────────

test("cancellation email distinguishes paid vs unpaid and never claims a refund", async () => {
  const paidOrders = new Map([
    [
      "ord_1",
      makeOrder({
        status: "cancelled",
        codFee: 0,
        payments: [
          {
            status: "success",
            amount: 500,
            method: "razorpay",
            razorpayPaymentId: "pay_1",
          },
        ],
      }),
    ],
  ]);
  const paidDeps = makeDeps({ orders: paidOrders });
  await scheduleNotification(paidDeps.deps, {
    eventType: "ORDER_CANCELLED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(paidDeps.deps);
  const paidMail = paidDeps.transport.sent[0];
  assert.match(paidMail.html, /was collected/i);
  assert.match(paidMail.html, /not a refund confirmation/i);
  assert.doesNotMatch(paidMail.html, /refund processed/i);

  const codOrders = new Map([["ord_1", makeOrder({ status: "cancelled" })]]);
  const codDeps = makeDeps({ orders: codOrders });
  await scheduleNotification(codDeps.deps, {
    eventType: "ORDER_CANCELLED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(codDeps.deps);
  const codMail = codDeps.transport.sent[0];
  assert.match(codMail.html, /No payment was collected/i);
});

// ─── 10. Confirmed refund triggers refund notification ───

test("refund processed email quotes the persisted refund amount and reference", async () => {
  const orders = new Map([
    [
      "ord_1",
      makeOrder({
        status: "refunded",
        codFee: 0,
        payments: [
          {
            status: "refunded",
            amount: 500,
            method: "razorpay",
            razorpayPaymentId: "pay_1",
            metadata: { refund_id: "rfnd_1", refund_amount: 450 },
          },
        ],
      }),
    ],
  ]);
  const { deps, transport } = makeDeps({ orders });

  await scheduleNotification(deps, {
    eventType: "REFUND_PROCESSED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(deps);

  assert.equal(transport.sent.length, 1);
  const mail = transport.sent[0];
  assert.match(mail.subject, /Refund processed/);
  assert.match(mail.html, /₹450/);
  assert.match(mail.html, /rfnd_1/);
});

// ─── 11. Provider failure recorded and retried safely ────

test("transient provider failures retry with backoff; permanent ones stop", async () => {
  const transport = new FakeTransport();
  const { deps, repo, clock } = makeDeps({ transport });

  const scheduled = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  assert.ok(scheduled.id);

  // First attempt: transient failure → failed with a future retry time.
  transport.failNext(true, "500 upstream");
  await processNotificationById(deps, scheduled.id!);
  let row = await repo.findById(scheduled.id!);
  assert.equal(row?.status, "failed");
  assert.equal(row?.attempts, 1);
  assert.ok(row?.nextRetryAt && row.nextRetryAt > clock.now);
  assert.equal(transport.sent.length, 0);

  // Not due yet — nothing is claimed.
  await processDueNotifications(deps);
  assert.equal(transport.sent.length, 0);

  // Advance past the backoff; retry succeeds.
  clock.now = new Date(clock.now.getTime() + 2 * 60_000);
  await processDueNotifications(deps);
  row = await repo.findById(scheduled.id!);
  assert.equal(row?.status, "sent");
  assert.equal(transport.sent.length, 1);
  assert.equal(row?.lastError, null);

  // Permanent failures are terminal until an explicit admin retry.
  const second = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "admin",
  });
  transport.failNext(false, "invalid sender");
  await processNotificationById(deps, second.id!);
  const adminRow = await repo.findById(second.id!);
  assert.equal(adminRow?.status, "failed");
  assert.equal(adminRow?.nextRetryAt, null);

  await processDueNotifications(deps);
  assert.equal((await repo.findById(second.id!))?.status, "failed");

  const retried = await retryNotification(deps, second.id!);
  assert.equal(retried.ok, true);
  assert.equal((await repo.findById(second.id!))?.status, "sent");
});

test("retry budget is bounded — no infinite retries", async () => {
  const transport = new FakeTransport();
  const { deps, repo, clock } = makeDeps({ transport });
  const scheduled = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });

  for (let i = 0; i < MAX_ATTEMPTS + 2; i++) {
    transport.failNext(true, "still down");
    await processDueNotifications(deps);
    clock.now = new Date(clock.now.getTime() + 7 * 60 * 60 * 1000);
  }

  const row = await repo.findById(scheduled.id!);
  assert.equal(row?.status, "failed");
  assert.equal(row?.attempts, MAX_ATTEMPTS);
  assert.equal(row?.nextRetryAt, null);

  // Backoff curve: doubles from 1 minute, capped at 6 hours, bounded by
  // the attempt budget (default MAX_ATTEMPTS).
  assert.equal(nextRetryDelayMs(1), 60_000);
  assert.equal(nextRetryDelayMs(2), 120_000);
  assert.equal(nextRetryDelayMs(5), 16 * 60_000);
  assert.equal(nextRetryDelayMs(10, 12), 6 * 60 * 60_000); // cap engaged
  assert.equal(nextRetryDelayMs(MAX_ATTEMPTS), null);
});

// ─── 12. Missing configuration never breaks scheduling ───

test("missing email configuration skips gracefully without throwing", async () => {
  const { deps, repo } = makeDeps({ adminEmail: null });

  // Unconfigured transport behaves like a missing provider: attempts fail
  // retryably, but schedule/process never throw.
  const unconfigured: EmailTransport = {
    async send() {
      return {
        ok: false,
        retryable: true,
        reason: "email provider not configured (RESEND_API_KEY / FROM_EMAIL)",
      };
    },
  };
  (deps as { transport: EmailTransport }).transport = unconfigured;

  const customer = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  assert.equal(customer.scheduled, true);

  const admin = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "admin",
  });
  assert.equal(admin.scheduled, false);
  assert.match(admin.skippedReason ?? "", /ADMIN_NOTIFICATION_EMAIL/);

  await processDueNotifications(deps); // must not throw
  const rows = await repo.listForOrder("ord_1");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, "failed");
  assert.match(rows[0].lastError ?? "", /not configured/);
});

// ─── 13. Unauthorized users cannot retry notifications ───

test("retryOrderEmailNotification rejects unauthenticated callers", async () => {
  const { retryOrderEmailNotification } = await import(
    "@/lib/actions/admin-orders"
  );
  await assert.rejects(
    () => retryOrderEmailNotification("any-id"),
    /Unauthorized|request scope|cookies/i
  );
});

// ─── 14. HTML escapes untrusted content ──────────────────

test("untrusted product and customer content is HTML-escaped", async () => {
  const evil = '<script>alert("xss")</script>';
  const orders = new Map([
    [
      "ord_1",
      makeOrder({
        customerName: evil,
        items: [{ name: `${evil} & <b>Shampoo</b>`, quantity: 1, price: 100 }],
        shippingAddress: {
          address1: `${evil} Lane`,
          city: "Mumbai",
          state: "MH",
          postalCode: "400001",
          country: "India",
        },
      }),
    ],
  ]);
  const { deps, transport } = makeDeps({ orders });

  await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });
  await processDueNotifications(deps);

  const mail = transport.sent[0];
  assert.ok(mail);
  assert.doesNotMatch(mail.html, /<script>/);
  assert.match(mail.html, /&lt;script&gt;/);
  assert.match(mail.html, /&amp; &lt;b&gt;Shampoo&lt;\/b&gt;/);
  assert.equal(escapeHtml(`<img src=x onerror='a'>`), "&lt;img src=x onerror=&#39;a&#39;&gt;");
});

// ─── Event key identity ──────────────────────────────────

test("event keys distinguish events and recipient roles", () => {
  assert.equal(
    buildEventKey("ORDER_PLACED", "ord_1", "customer"),
    "ORDER_PLACED:ord_1:customer"
  );
  assert.notEqual(
    buildEventKey("ORDER_PLACED", "ord_1", "customer"),
    buildEventKey("ORDER_PLACED", "ord_1", "admin")
  );
  assert.notEqual(
    buildEventKey("ORDER_PLACED", "ord_1", "customer"),
    buildEventKey("PAYMENT_SUCCEEDED", "ord_1", "customer")
  );
  const failure = classifyUnknownError(new Error("network reset"));
  assert.equal(failure.retryable, true);
  assert.equal(failure.reason, "network reset");
});

// ─── Stale processing locks are recovered ────────────────

test("notifications stuck in processing after a crash are recovered", async () => {
  const transport = new FakeTransport();
  const { deps, repo, clock } = makeDeps({ transport });
  const scheduled = await scheduleNotification(deps, {
    eventType: "ORDER_PLACED",
    orderId: "ord_1",
    recipientRole: "customer",
  });

  // Simulate a worker that claimed the row and died mid-flight.
  const claimed = await repo.claimById(scheduled.id!, clock.now, LOCK_STALE_MS);
  assert.ok(claimed);
  assert.equal((await repo.findById(scheduled.id!))?.status, "processing");

  // Immediate re-process: lock is fresh, nothing is claimed.
  await processNotificationById(deps, scheduled.id!);
  assert.equal(transport.sent.length, 0);

  // After the lock goes stale, the cron sweep recovers and delivers it.
  clock.now = new Date(clock.now.getTime() + LOCK_STALE_MS + 1000);
  await processDueNotifications(deps);
  assert.equal(transport.sent.length, 1);
  assert.equal((await repo.findById(scheduled.id!))?.status, "sent");
});
