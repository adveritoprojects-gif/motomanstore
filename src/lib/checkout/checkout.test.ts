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

// ─── Product / variant resolution ───────────────────────

const foamSprayer = {
  // Mirrors production: single "1 Unit" variant, product price 599.
  id: "prod-fs",
  name: "Motoman Foam Sprayer",
  price: 599,
  inStock: true,
  images: [{ url: "/products/form-spray.jpeg" }],
  variants: [{ id: "var-fs-1", name: "1 Unit", price: 599, stock: 50 }],
};

const multiVariant = {
  id: "prod-mv",
  name: "Motoman 1200 GSM Microfiber Cloth",
  price: 499,
  inStock: true,
  images: [{ url: "/products/cloth.jpg" }],
  variants: [
    { id: "var-mv-1", name: "Pack of 1", price: 499, stock: 100 },
    { id: "var-mv-2", name: "Pack of 2", price: 799, stock: 60 },
  ],
};

const simpleProduct = {
  id: "prod-simple",
  name: "Motoman Basic Sponge",
  price: 149,
  inStock: true,
  images: [{ url: "/products/sponge.jpg" }],
  variants: [],
};

test("Foam Sprayer cart line without a variant id resolves to its only variant", () => {
  // Listing cards historically stored no variantId — checkout must reconcile.
  const priced = priceCart(
    [{ id: "prod-fs", name: "Motoman Foam Sprayer", quantity: 1, price: 599 }],
    [foamSprayer],
  );
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.items[0]?.variantId, "var-fs-1");
  assert.equal(priced.items[0]?.price, 599);
  assert.equal(priced.items[0]?.name, "Motoman Foam Sprayer - 1 Unit");
  assert.equal(priced.subtotal, 599);
});

test("simple product without variants checks out at the database price", () => {
  const priced = priceCart(
    [{ id: "prod-simple", name: "Sponge", quantity: 2, price: 1 }],
    [simpleProduct],
  );
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.items[0]?.variantId, null);
  assert.equal(priced.items[0]?.price, 149);
  assert.equal(priced.subtotal, 298);
});

test("simple product that is out of stock is rejected", () => {
  const priced = priceCart(
    [{ id: "prod-simple", name: "Sponge", quantity: 1 }],
    [{ ...simpleProduct, inStock: false }],
  );
  assert.equal(priced.ok, false);
});

test("legacy cart line on a multi-variant product reconciles by option name", () => {
  const priced = priceCart(
    [{ id: "prod-mv", name: "Cloth", quantity: 1, variantName: "Pack of 2", price: 1 }],
    [multiVariant],
  );
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.items[0]?.variantId, "var-mv-2");
  assert.equal(priced.items[0]?.price, 799);
});

test("legacy cart line on a multi-variant product without a matching name asks to re-add", () => {
  const missingName = priceCart(
    [{ id: "prod-mv", name: "Cloth", quantity: 1 }],
    [multiVariant],
  );
  assert.equal(missingName.ok, false);
  if (missingName.ok) return;
  assert.match(missingName.error, /re-add/);

  const wrongName = priceCart(
    [{ id: "prod-mv", name: "Cloth", quantity: 1, variantName: "Pack of 9" }],
    [multiVariant],
  );
  assert.equal(wrongName.ok, false);
  if (wrongName.ok) return;
  assert.match(wrongName.error, /re-add/);
});

test("variant id from another product is rejected", () => {
  const priced = priceCart(
    [{ id: "prod-fs", name: "Foam Sprayer", quantity: 1, variantId: "var-mv-1" }],
    [foamSprayer],
  );
  assert.equal(priced.ok, false);
  if (priced.ok) return;
  assert.match(priced.error, /no longer available/);
});

test("valid variant id still prices from the variant record", () => {
  const priced = priceCart(
    [{ id: "prod-mv", name: "Cloth", quantity: 2, variantId: "var-mv-2", price: 1 }],
    [multiVariant],
  );
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.items[0]?.price, 799);
  assert.equal(priced.subtotal, 1598);
});

test("variant stock limits still apply after reconciliation", () => {
  const priced = priceCart(
    [{ id: "prod-fs", name: "Foam Sprayer", quantity: 3 }],
    [{ ...foamSprayer, variants: [{ id: "var-fs-1", name: "1 Unit", price: 599, stock: 2 }] }],
  );
  assert.equal(priced.ok, false);
  if (priced.ok) return;
  assert.match(priced.error, /2 units/);
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
