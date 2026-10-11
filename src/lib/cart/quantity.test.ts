import assert from "node:assert/strict";
import test from "node:test";
import { cartLineKey, changeQuantity, quantityCap } from "./quantity";

test("increases and decreases quantity without going below 1", () => {
  const increased = changeQuantity(1, "increase", 5);
  assert.deepEqual(increased, { ok: true, quantity: 2 });
  const decreased = changeQuantity(2, "decrease", 5);
  assert.deepEqual(decreased, { ok: true, quantity: 1 });
  const blocked = changeQuantity(1, "decrease", 5);
  assert.equal(blocked.ok, false);
});

test("stops at stock and at the checkout maximum of 10", () => {
  assert.equal(quantityCap(4), 4);
  assert.equal(quantityCap(80), 10);
  const atStock = changeQuantity(4, "increase", 4);
  assert.equal(atStock.ok, false);
  if (!atStock.ok) assert.match(atStock.message, /Only 4 available/);
  const atCheckoutMax = changeQuantity(10, "increase", 40);
  assert.equal(atCheckoutMax.ok, false);
  if (!atCheckoutMax.ok) assert.match(atCheckoutMax.message, /Maximum quantity is 10/);
});

test("keeps different variants on separate cart lines", () => {
  assert.notEqual(cartLineKey("prod", "red"), cartLineKey("prod", "blue"));
  assert.equal(cartLineKey("prod", "red"), cartLineKey("prod", "red"));
  assert.notEqual(cartLineKey("prod"), cartLineKey("prod", "red"));
});
