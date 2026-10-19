import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEmailConfig, getEmailTransport } from "@/lib/email";
import type {
  CreateOutboxInput,
  OutboxRecord,
  OutboxRepository,
} from "./outbox";
import { DuplicateEventError } from "./outbox";
import type { NotificationEventType, RecipientRole } from "./core";
import {
  processDueNotifications,
  processNotificationById,
  scheduleNotification,
  type NotificationDeps,
  type OrderNotificationRow,
  type ScheduleResult,
} from "./service";

export * from "./core";
export * from "./outbox";
export * from "./service";

function toRecord(row: {
  id: string;
  eventKey: string;
  eventType: string;
  orderId: string | null;
  recipient: string;
  recipientRole: string;
  subject: string;
  status: string;
  attempts: number;
  lastError: string | null;
  nextRetryAt: Date | null;
  lockedAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): OutboxRecord {
  return {
    ...row,
    eventType: row.eventType as NotificationEventType,
    recipientRole: row.recipientRole as RecipientRole,
    status: row.status as OutboxRecord["status"],
  };
}

/** Prisma-backed outbox with the same semantics as the in-memory version. */
export function createPrismaOutboxRepository(
  client: PrismaClient = prisma
): OutboxRepository {
  return {
    async create(input: CreateOutboxInput): Promise<OutboxRecord> {
      try {
        // Fresh rows are due immediately — same default as the in-memory repo.
        // (A NULL nextRetryAt would never satisfy `nextRetryAt <= now`.)
        const row = await client.emailNotification.create({
          data: { ...input, nextRetryAt: new Date() },
        });
        return toRecord(row);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          (error as { code?: string }).code === "P2002"
        ) {
          throw new DuplicateEventError(input.eventKey);
        }
        throw error;
      }
    },
    async findByEventKey(eventKey: string): Promise<OutboxRecord | null> {
      const row = await client.emailNotification.findUnique({
        where: { eventKey },
      });
      return row ? toRecord(row) : null;
    },
    async findById(id: string): Promise<OutboxRecord | null> {
      const row = await client.emailNotification.findUnique({ where: { id } });
      return row ? toRecord(row) : null;
    },
    async claimDue(
      now: Date,
      staleMs: number,
      limit: number
    ): Promise<OutboxRecord[]> {
      const staleBefore = new Date(now.getTime() - staleMs);
      const candidates = await client.emailNotification.findMany({
        where: {
          OR: [
            {
              status: { in: ["pending", "failed"] },
              nextRetryAt: { lte: now },
            },
            { status: "processing", lockedAt: { lt: staleBefore } },
          ],
        },
        orderBy: { updatedAt: "asc" },
        take: limit,
      });

      const claimed: OutboxRecord[] = [];
      for (const candidate of candidates) {
        const guard = await client.emailNotification.updateMany({
          where: {
            id: candidate.id,
            OR: [
              {
                status: { in: ["pending", "failed"] },
                nextRetryAt: { lte: now },
              },
              { status: "processing", lockedAt: { lt: staleBefore } },
            ],
          },
          data: {
            status: "processing",
            lockedAt: now,
            attempts: { increment: 1 },
          },
        });
        if (guard.count === 1) {
          const fresh = await client.emailNotification.findUnique({
            where: { id: candidate.id },
          });
          if (fresh) claimed.push(toRecord(fresh));
        }
      }
      return claimed;
    },
    async claimById(
      id: string,
      now: Date,
      staleMs: number
    ): Promise<OutboxRecord | null> {
      const staleBefore = new Date(now.getTime() - staleMs);
      const guard = await client.emailNotification.updateMany({
        where: {
          id,
          OR: [
            {
              status: { in: ["pending", "failed"] },
              nextRetryAt: { lte: now },
            },
            { status: "processing", lockedAt: { lt: staleBefore } },
          ],
        },
        data: {
          status: "processing",
          lockedAt: now,
          attempts: { increment: 1 },
        },
      });
      if (guard.count !== 1) return null;
      const fresh = await client.emailNotification.findUnique({ where: { id } });
      return fresh ? toRecord(fresh) : null;
    },
    async markSent(id: string, now: Date): Promise<void> {
      await client.emailNotification.updateMany({
        where: { id },
        data: { status: "sent", sentAt: now, lockedAt: null, lastError: null },
      });
    },
    async markFailure(
      id: string,
      now: Date,
      nextRetryAt: Date | null,
      reason: string
    ): Promise<void> {
      await client.emailNotification.updateMany({
        where: { id },
        data: { status: "failed", lockedAt: null, nextRetryAt, lastError: reason },
      });
    },
    async resetForRetry(id: string, now: Date): Promise<OutboxRecord | null> {
      const row = await client.emailNotification.findUnique({ where: { id } });
      if (!row || row.status === "sent") return null;
      const updated = await client.emailNotification.update({
        where: { id },
        data: { status: "pending", nextRetryAt: now, lockedAt: null },
      });
      return toRecord(updated);
    },
    async listForOrder(orderId: string): Promise<OutboxRecord[]> {
      const rows = await client.emailNotification.findMany({
        where: { orderId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toRecord);
    },
  };
}

async function prismaLoadOrder(
  orderId: string
): Promise<OrderNotificationRow | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true },
  });
}

/** Production wiring: Prisma outbox + Resend transport + env configuration. */
export function getDefaultNotificationDeps(): NotificationDeps {
  return {
    repo: createPrismaOutboxRepository(),
    transport: getEmailTransport(),
    loadOrder: prismaLoadOrder,
    config: getEmailConfig,
  };
}

/**
 * Schedules a notification and attempts immediate delivery on the current
 * invocation. Call from trusted server code inside `after()` so checkout,
 * webhook and admin responses are never blocked or failed by email issues.
 */
export async function scheduleAndDeliverNow(
  params: {
    eventType: NotificationEventType;
    orderId: string;
    recipientRole: RecipientRole;
  },
  deps: NotificationDeps = getDefaultNotificationDeps()
): Promise<ScheduleResult> {
  const result = await scheduleNotification(deps, params);
  if (result.scheduled && result.id) {
    await processNotificationById(deps, result.id);
    const after = await deps.repo.findById(result.id);
    return {
      ...result,
      skippedReason:
        after && after.status !== "sent" ? after.lastError ?? undefined : undefined,
    };
  }
  return result;
}

/** Cron entry: deliver everything currently due. */
export async function runDueNotifications(
  deps: NotificationDeps = getDefaultNotificationDeps()
): Promise<{ processed: number }> {
  return processDueNotifications(deps);
}
