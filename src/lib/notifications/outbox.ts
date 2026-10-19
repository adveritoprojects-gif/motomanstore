import type {
  NotificationEventType,
  NotificationStatus,
  RecipientRole,
} from "./core";

/**
 * Storage contract for the transactional email outbox. The Prisma-backed
 * implementation lives in index.ts; tests use the in-memory repository below,
 * which mirrors the same uniqueness and atomic-claim semantics.
 */

export interface OutboxRecord {
  id: string;
  eventKey: string;
  eventType: NotificationEventType;
  orderId: string | null;
  recipient: string;
  recipientRole: RecipientRole;
  subject: string;
  status: NotificationStatus;
  attempts: number;
  lastError: string | null;
  nextRetryAt: Date | null;
  lockedAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutboxInput {
  eventKey: string;
  eventType: NotificationEventType;
  orderId: string | null;
  recipient: string;
  recipientRole: RecipientRole;
  subject: string;
}

export class DuplicateEventError extends Error {
  constructor(eventKey: string) {
    super(`Notification already scheduled: ${eventKey}`);
    this.name = "DuplicateEventError";
  }
}

export interface OutboxRepository {
  /** Inserts a row; must throw DuplicateEventError when eventKey exists. */
  create(input: CreateOutboxInput): Promise<OutboxRecord>;
  findByEventKey(eventKey: string): Promise<OutboxRecord | null>;
  findById(id: string): Promise<OutboxRecord | null>;
  /**
   * Atomically claims up to `limit` due notifications (pending/failed with
   * nextRetryAt <= now, or processing rows whose lock is stale). Each claimed
   * row moves to `processing` with lockedAt set and attempts incremented.
   */
  claimDue(now: Date, staleMs: number, limit: number): Promise<OutboxRecord[]>;
  /** Same guard as claimDue but for a single row (inline processing/retry). */
  claimById(id: string, now: Date, staleMs: number): Promise<OutboxRecord | null>;
  markSent(id: string, now: Date): Promise<void>;
  /** nextRetryAt = null marks a terminal failure (admin retry only). */
  markFailure(
    id: string,
    now: Date,
    nextRetryAt: Date | null,
    reason: string
  ): Promise<void>;
  /** Requeues a terminally failed row (authorized admin retry). */
  resetForRetry(id: string, now: Date): Promise<OutboxRecord | null>;
  listForOrder(orderId: string): Promise<OutboxRecord[]>;
}

function isDue(row: OutboxRecord, now: Date, staleMs: number): boolean {
  if (row.status === "pending" || row.status === "failed") {
    return row.nextRetryAt !== null && row.nextRetryAt.getTime() <= now.getTime();
  }
  if (row.status === "processing") {
    return (
      row.lockedAt !== null &&
      now.getTime() - row.lockedAt.getTime() >= staleMs
    );
  }
  return false;
}

let memorySeq = 0;

/** In-memory outbox used by automated tests (no database, no network). */
export class InMemoryOutboxRepository implements OutboxRepository {
  private rows = new Map<string, OutboxRecord>();
  private byEventKey = new Map<string, string>();

  async create(input: CreateOutboxInput): Promise<OutboxRecord> {
    if (this.byEventKey.has(input.eventKey)) {
      throw new DuplicateEventError(input.eventKey);
    }
    const now = new Date();
    const record: OutboxRecord = {
      id: `outbox-${++memorySeq}`,
      eventKey: input.eventKey,
      eventType: input.eventType,
      orderId: input.orderId,
      recipient: input.recipient,
      recipientRole: input.recipientRole,
      subject: input.subject,
      status: "pending",
      attempts: 0,
      lastError: null,
      nextRetryAt: now,
      lockedAt: null,
      sentAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.rows.set(record.id, record);
    this.byEventKey.set(input.eventKey, record.id);
    return { ...record };
  }

  async findByEventKey(eventKey: string): Promise<OutboxRecord | null> {
    const id = this.byEventKey.get(eventKey);
    const row = id ? this.rows.get(id) : undefined;
    return row ? { ...row } : null;
  }

  async findById(id: string): Promise<OutboxRecord | null> {
    const row = this.rows.get(id);
    return row ? { ...row } : null;
  }

  async claimDue(
    now: Date,
    staleMs: number,
    limit: number
  ): Promise<OutboxRecord[]> {
    const due = [...this.rows.values()]
      .filter((row) => isDue(row, now, staleMs))
      .sort((a, b) => (a.nextRetryAt?.getTime() ?? 0) - (b.nextRetryAt?.getTime() ?? 0))
      .slice(0, limit);
    const claimed: OutboxRecord[] = [];
    for (const row of due) {
      const fresh = this.rows.get(row.id);
      if (!fresh || !isDue(fresh, now, staleMs)) continue; // lost the race
      fresh.status = "processing";
      fresh.lockedAt = now;
      fresh.attempts += 1;
      fresh.updatedAt = now;
      claimed.push({ ...fresh });
    }
    return claimed;
  }

  async claimById(
    id: string,
    now: Date,
    staleMs: number
  ): Promise<OutboxRecord | null> {
    const fresh = this.rows.get(id);
    if (!fresh || !isDue(fresh, now, staleMs)) return null;
    fresh.status = "processing";
    fresh.lockedAt = now;
    fresh.attempts += 1;
    fresh.updatedAt = now;
    return { ...fresh };
  }

  async markSent(id: string, now: Date): Promise<void> {
    const row = this.rows.get(id);
    if (!row) return;
    row.status = "sent";
    row.sentAt = now;
    row.lockedAt = null;
    row.lastError = null;
    row.updatedAt = now;
  }

  async markFailure(
    id: string,
    now: Date,
    nextRetryAt: Date | null,
    reason: string
  ): Promise<void> {
    const row = this.rows.get(id);
    if (!row) return;
    row.status = "failed";
    row.lockedAt = null;
    row.nextRetryAt = nextRetryAt;
    row.lastError = reason;
    row.updatedAt = now;
  }

  async resetForRetry(id: string, now: Date): Promise<OutboxRecord | null> {
    const row = this.rows.get(id);
    if (!row || row.status === "sent") return null;
    row.status = "pending";
    row.nextRetryAt = now;
    row.lockedAt = null;
    row.updatedAt = now;
    return { ...row };
  }

  async listForOrder(orderId: string): Promise<OutboxRecord[]> {
    return [...this.rows.values()]
      .filter((row) => row.orderId === orderId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((row) => ({ ...row }));
  }
}
