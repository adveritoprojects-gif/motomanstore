import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { checkoutRequestSchema, cartSchema } from "../validations";
import {
  COD_HANDLING_FEE,
  captureDecision,
  codHandlingFee,
  orderTotals,
  paymentAmountMatches,
  paymentCurrencyMatches,
  paymentMethodAvailable,
  priceCart,
} from "./price-cart";
import { executePlace, createMemoryCheckout } from "./place-order";
import { verifyRazorpaySignature, verifyWebhookSignature } from "../razorpay";

const address = {
  firstName: "Asha",
  phone: "9876543210",
  address1: "12 Beach Road",
  city: "Kannur",
  state: "Kerala",
  postalCode: "670001",
  country: "India",
  paymentMethod: "cod" as const,
  attemptId: "6f1b1b4e-8c2a-4e3a-9d4f-1a2b3c4d5e6f",
};

const product = {
  id: "prod-1",
  name: "Motoman Premium Car Shampoo",
  price: 340,
  inStock: true,
  images: [{ url: "/products/shampoo-1.jpg" }],
  variants: [{ id: "var-1", name: "500 ml", price: 340, stock: 2 }],
};

test("rejects missing and invalid delivery details", () => {
  const missing = checkoutRequestSchema.safeParse({
    ...address,
    address1: "",
    phone: "123",
    postalCode: "12",
    city: "",
  });
  assert.equal(missing.success, false);

  const valid = checkoutRequestSchema.safeParse(address);
  assert.equal(valid.success, true);
});

test("rejects invalid quantities", () => {
  assert.equal(cartSchema.safeParse({ items: [] }).success, false);
  assert.equal(
    cartSchema.safeParse({
      items: [{ id: "prod-1", name: "Shampoo", price: 1, image: "/", quantity: 0 }],
    }).success,
    false,
  );
  assert.equal(
    priceCart([{ id: "prod-1", name: "Shampoo", quantity: 11, variantId: "var-1" }], [product]).ok,
    false,
  );
});

test("ignores a manipulated client price and uses the database price", () => {
  const priced = priceCart(
    [{ id: "prod-1", name: "Shampoo", quantity: 2, variantId: "var-1", price: 1 }],
    [product],
  );
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.items[0]?.price, 340);
  assert.equal(priced.subtotal, 680);
});

test("rejects a quantity above variant stock", () => {
  const priced = priceCart(
    [{ id: "prod-1", name: "Shampoo", quantity: 3, variantId: "var-1" }],
    [product],
  );
  assert.equal(priced.ok, false);
});

test("verifies a Razorpay payment signature and rejects a tampered one", () => {
  process.env.RAZORPAY_KEY_SECRET = "test-secret";
  const payload = {
    razorpay_order_id: "order_test",
    razorpay_payment_id: "pay_test",
    razorpay_signature: createHmac("sha256", "test-secret")
      .update("order_test|pay_test")
      .digest("hex"),
  };
  assert.equal(verifyRazorpaySignature(payload), true);
  assert.equal(
    verifyRazorpaySignature({ ...payload, razorpay_signature: "0".repeat(64) }),
    false,
  );
});

test("verifies webhook signatures", () => {
  const body = JSON.stringify({ event: "payment.captured" });
  const signature = createHmac("sha256", "whsec_test").update(body).digest("hex");
  assert.equal(verifyWebhookSignature(body, signature, "whsec_test"), true);
  assert.equal(verifyWebhookSignature(body, signature, "wrong-secret"), false);
});

test("does not capture a duplicate, underpaid, or wrong-currency webhook", () => {
  assert.equal(paymentAmountMatches(1299, 129900), true);
  assert.equal(paymentAmountMatches(1299, 100), false);
  assert.equal(paymentCurrencyMatches("INR"), true);
  assert.equal(paymentCurrencyMatches("USD"), false);
  assert.equal(captureDecision("paid", true, true), "skip");
  assert.equal(captureDecision("cancelled", true, true), "skip");
  assert.equal(captureDecision("pending", false, true), "ignore-amount");
  assert.equal(captureDecision("pending", true, false), "ignore-amount");
  assert.equal(captureDecision("pending", true, true), "capture");
});

test("COD stays available when Razorpay is not configured", () => {
  assert.equal(paymentMethodAvailable("cod", false).ok, true);
  assert.equal(paymentMethodAvailable("razorpay", false).ok, false);
  assert.equal(paymentMethodAvailable("razorpay", true).ok, true);
});

test("online payment totals never include the COD handling fee", () => {
  assert.equal(codHandlingFee("razorpay"), 0);
  const totals = orderTotals(499, "razorpay");
  assert.equal(totals.codFee, 0);
  assert.equal(totals.total, 499);
  // Amount sent to Razorpay is in paise and excludes the COD fee.
  assert.equal(Math.round(totals.total * 100), 49900);
});

test("COD totals add the flat ₹20 handling fee", () => {
  assert.equal(COD_HANDLING_FEE, 20);
  assert.equal(codHandlingFee("cod"), 20);
  const totals = orderTotals(499, "cod");
  assert.equal(totals.codFee, 20);
  assert.equal(totals.subtotal, 499);
  assert.equal(totals.shippingCost, 0);
  assert.equal(totals.total, 519);
});

test("switching between Pay Online and COD toggles the ₹20 fee immediately", () => {
  const online = orderTotals(499, "razorpay");
  const cod = orderTotals(499, "cod");
  assert.equal(online.total, 499);
  assert.equal(cod.total, 519);
  assert.equal(cod.total - online.total, COD_HANDLING_FEE);
  // Shipping stays free and subtotal untouched in both cases.
  assert.equal(online.subtotal, cod.subtotal);
  assert.equal(online.shippingCost, 0);
  assert.equal(cod.shippingCost, 0);
});

test("COD order records the fee-inclusive total", async () => {
  const store = createMemoryCheckout({ "var-1": 4 });
  const totals = orderTotals(340, "cod");
  const placed = await executePlace(store, {
    attemptId: "attempt-cod-fee",
    paymentMethod: "cod",
    orderNumber: "MT-COD-FEE",
    total: totals.total,
    lines: [line],
  });
  assert.equal(placed.ok, true);
  if (!placed.ok) return;
  assert.equal(placed.order.total, 360);
  assert.equal(store.stockOf("var-1"), 3);
});

const line = { variantId: "var-1", quantity: 1, name: "Shampoo" };

test("creates one COD order and reserves stock once for simultaneous attempts", async () => {
  const store = createMemoryCheckout({ "var-1": 4 });
  const input = {
    attemptId: "attempt-cod",
    paymentMethod: "cod" as const,
    orderNumber: "MT-COD-1",
    total: 340,
    lines: [line],
  };
  const [first, second] = await Promise.all([
    executePlace(store, input),
    executePlace(store, input),
  ]);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(first.order.id, second.order.id);
  assert.equal(first.order.paymentMethod, "cod");
  assert.equal(store.stockOf("var-1"), 3);
  assert.equal([first.created, second.created].filter(Boolean).length, 1);
});

test("stops concurrent purchases from overselling the last unit", async () => {
  const store = createMemoryCheckout({ "var-1": 1 });
  const [first, second] = await Promise.all([
    executePlace(store, {
      attemptId: "buyer-a",
      paymentMethod: "cod",
      orderNumber: "MT-A",
      total: 340,
      lines: [line],
    }),
    executePlace(store, {
      attemptId: "buyer-b",
      paymentMethod: "razorpay",
      orderNumber: "MT-B",
      total: 340,
      lines: [line],
    }),
  ]);
  const results = [first, second];
  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.equal(results.filter((result) => !result.ok).length, 1);
  assert.equal(store.stockOf("var-1"), 0);
});

test("releases reserved stock once when a payment fails", () => {
  const store = createMemoryCheckout({ "var-1": 2 });
  return executePlace(store, {
    attemptId: "attempt-online",
    paymentMethod: "razorpay",
    orderNumber: "MT-PAY-1",
    total: 340,
    lines: [line],
  }).then((placed) => {
    assert.equal(placed.ok, true);
    assert.equal(store.stockOf("var-1"), 1);
    if (!placed.ok) return;
    assert.equal(store.release(placed.order.id), true);
    assert.equal(store.stockOf("var-1"), 2);
    assert.equal(store.release(placed.order.id), false);
    assert.equal(store.stockOf("var-1"), 2);
  });
});
