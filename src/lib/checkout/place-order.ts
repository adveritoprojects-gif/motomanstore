import { InsufficientStockError, mergeVariantQuantities } from "./inventory";

export class AttemptConflictError extends Error {
  constructor() {
    super("Checkout attempt already exists");
    this.name = "AttemptConflictError";
  }
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  paymentMethod: "cod" | "razorpay";
  total: number;
  status: string;
  inventoryHeld: boolean;
  razorpayOrderId: string | null;
  items: { variantId: string; quantity: number; name: string }[];
}

export interface PlaceInput {
  attemptId: string;
  paymentMethod: "cod" | "razorpay";
  orderNumber: string;
  total: number;
  lines: { variantId: string; quantity: number; name: string }[];
}

export interface PlaceTx {
  findByAttempt(attemptId: string): Promise<PlacedOrder | null>;
  reserve(lines: PlaceInput["lines"]): Promise<void>;
  insert(input: PlaceInput): Promise<PlacedOrder>;
}

export interface PlaceStore {
  findByAttempt(attemptId: string): Promise<PlacedOrder | null>;
  transaction<T>(fn: (tx: PlaceTx) => Promise<T>): Promise<T>;
}

export type PlaceOutcome =
  | { ok: true; created: boolean; order: PlacedOrder }
  | { ok: false; error: string };

function reuse(order: PlacedOrder, paymentMethod: PlaceInput["paymentMethod"]): PlaceOutcome {
  if (order.paymentMethod !== paymentMethod) {
    return {
      ok: false,
      error: "This checkout was already submitted. Refresh the page and try again.",
    };
  }
  return { ok: true, created: false, order };
}

export async function executePlace(store: PlaceStore, input: PlaceInput): Promise<PlaceOutcome> {
  try {
    return await store.transaction(async (tx) => {
      const existing = await tx.findByAttempt(input.attemptId);
      if (existing) return reuse(existing, input.paymentMethod);
      await tx.reserve(input.lines);
      const order = await tx.insert(input);
      return { ok: true as const, created: true, order };
    });
  } catch (error) {
    if (error instanceof AttemptConflictError) {
      const winner = await store.findByAttempt(input.attemptId);
      if (winner) return reuse(winner, input.paymentMethod);
    }
    if (error instanceof InsufficientStockError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

/** In-memory stand-in for the database transaction used by checkout tests. */
export function createMemoryCheckout(stock: Record<string, number>) {
  const variants = new Map(Object.entries(stock));
  const orders = new Map<string, PlacedOrder>();
  let chain: Promise<unknown> = Promise.resolve();
  let sequence = 0;

  function snapshot() {
    return {
      variants: new Map(variants),
      orders: new Map(orders),
    };
  }

  function restore(saved: ReturnType<typeof snapshot>) {
    variants.clear();
    for (const [key, value] of saved.variants) variants.set(key, value);
    orders.clear();
    for (const [key, value] of saved.orders) orders.set(key, value);
  }

  const store: PlaceStore & {
    stockOf(id: string): number;
    release(orderId: string): boolean;
  } = {
    stockOf(id) {
      return variants.get(id) ?? 0;
    },
    async findByAttempt(attemptId) {
      return [...orders.values()].find((order) => order.id === attemptId) ?? null;
    },
    async transaction(fn) {
      const run = chain.then(async () => {
        const saved = snapshot();
        try {
          return await fn({
            findByAttempt: (attemptId) => store.findByAttempt(attemptId),
            async reserve(lines) {
              for (const line of mergeVariantQuantities(lines)) {
                const current = variants.get(line.variantId) ?? 0;
                if (current < line.quantity) {
                  throw new InsufficientStockError(
                    `"${line.name}" does not have enough stock`,
                  );
                }
                variants.set(line.variantId, current - line.quantity);
              }
            },
            async insert(input) {
              if ([...orders.values()].some((order) => order.id === input.attemptId)) {
                throw new AttemptConflictError();
              }
              sequence += 1;
              const order: PlacedOrder = {
                id: input.attemptId,
                orderNumber: input.orderNumber || `MT-TEST-${sequence}`,
                paymentMethod: input.paymentMethod,
                total: input.total,
                status: "pending",
                inventoryHeld: true,
                razorpayOrderId: null,
                items: input.lines.map((line) => ({
                  variantId: line.variantId,
                  quantity: line.quantity,
                  name: line.name,
                })),
              };
              orders.set(order.id, order);
              return order;
            },
          });
        } catch (error) {
          restore(saved);
          throw error;
        }
      });
      chain = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
    release(orderId) {
      const order = orders.get(orderId);
      if (!order?.inventoryHeld) return false;
      for (const item of order.items) {
        variants.set(item.variantId, (variants.get(item.variantId) ?? 0) + item.quantity);
      }
      order.inventoryHeld = false;
      if (order.paymentMethod === "razorpay") order.status = "pending";
      return true;
    },
  };

  return store;
}
