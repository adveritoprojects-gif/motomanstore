-- Additive transactional email outbox. Existing data is untouched.
CREATE TABLE IF NOT EXISTS "EmailNotification" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "recipient" TEXT NOT NULL,
    "recipientRole" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailNotification_eventKey_key"
    ON "EmailNotification"("eventKey");

CREATE INDEX IF NOT EXISTS "EmailNotification_status_nextRetryAt_idx"
    ON "EmailNotification"("status", "nextRetryAt");

CREATE INDEX IF NOT EXISTS "EmailNotification_orderId_idx"
    ON "EmailNotification"("orderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EmailNotification_orderId_fkey'
  ) THEN
    ALTER TABLE "EmailNotification"
      ADD CONSTRAINT "EmailNotification_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
