-- Additive checkout guards. Existing orders keep NULL attempt ids and inventoryHeld = false.
-- Multiple NULLs are allowed by this unique index, so historical rows are unchanged.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "checkoutAttemptId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "inventoryHeld" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_checkoutAttemptId_key" ON "Order"("checkoutAttemptId");
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "variantId" TEXT;
