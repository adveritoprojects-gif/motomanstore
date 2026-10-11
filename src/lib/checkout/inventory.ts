import type { Prisma } from "@prisma/client";

export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export interface StockLine {
  variantId: string;
  quantity: number;
  name: string;
}

export function mergeVariantQuantities(lines: StockLine[]): StockLine[] {
  const merged = new Map<string, StockLine>();
  for (const line of lines) {
    const current = merged.get(line.variantId);
    if (current) {
      current.quantity += line.quantity;
    } else {
      merged.set(line.variantId, { ...line });
    }
  }
  return [...merged.values()].sort((a, b) => a.variantId.localeCompare(b.variantId));
}

export async function reserveInventory(
  tx: Prisma.TransactionClient,
  lines: StockLine[],
) {
  for (const line of mergeVariantQuantities(lines)) {
    const updated = await tx.productVariant.updateMany({
      where: { id: line.variantId, stock: { gte: line.quantity } },
      data: { stock: { decrement: line.quantity } },
    });
    if (updated.count !== 1) {
      throw new InsufficientStockError(
        `"${line.name}" does not have enough stock`,
      );
    }
  }
}

/** Returns true only the first time stock is put back. */
export async function releaseHeldInventory(
  tx: Prisma.TransactionClient,
  orderId: string,
  options?: { onlyStatus?: string },
) {
  const claimed = await tx.order.updateMany({
    where: {
      id: orderId,
      inventoryHeld: true,
      ...(options?.onlyStatus ? { status: options.onlyStatus } : {}),
    },
    data: { inventoryHeld: false },
  });
  if (claimed.count !== 1) return false;

  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (!item.variantId) continue;
    await tx.productVariant.updateMany({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
  }
  return true;
}
