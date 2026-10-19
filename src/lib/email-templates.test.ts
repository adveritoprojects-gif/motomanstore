import assert from "node:assert/strict";
import test from "node:test";
import {
  renderOrderCancelledCustomer,
  renderOrderPlacedCustomer,
  renderRefundProcessedCustomer,
  type OrderEmailSnapshot,
} from "./email-templates";
import { escapeHtml, isValidEmail } from "./email";

function snapshot(overrides?: Partial<OrderEmailSnapshot>): OrderEmailSnapshot {
  return {
    orderNumber: "MT-20261017-ABC123",
    orderUrl: "https://motoman.in/order-success/ord_1",
    customerName: "Asha Kumar",
    items: [{ name: "Car Shampoo", quantity: 2, price: 250 }],
    subtotal: 500,
    shippingCost: 0,
    codFee: 20,
    total: 520,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "pending",
    shippingAddressLines: ["12 Beach Road", "Kannur, Kerala", "670001 India"],
    ...overrides,
  };
}

test("order-placed subject and COD wording never claim payment", () => {
  const cod = renderOrderPlacedCustomer(snapshot());
  assert.equal(cod.subject, "Your MOTOMAN order MT-20261017-ABC123 is confirmed");
  assert.match(cod.html, /Payment is due on delivery/);
  assert.doesNotMatch(cod.html, /has been paid|payment received/i);

  const online = renderOrderPlacedCustomer(
    snapshot({ paymentMethod: "razorpay", codFee: 0 })
  );
  assert.match(online.html, /Payment is still pending/);
  assert.doesNotMatch(online.html, /due on delivery|has been paid/i);
});

test("cancellation copy is honest about refunds", () => {
  const paid = renderOrderCancelledCustomer(
    snapshot({
      paymentMethod: "razorpay",
      codFee: 0,
      paidAmount: 500,
      paymentStatus: "success",
    })
  );
  assert.match(paid.html, /was collected/);
  assert.match(paid.html, /not a refund confirmation/i);
  assert.doesNotMatch(paid.html, /refund processed/i);

  const unpaid = renderOrderCancelledCustomer(snapshot());
  assert.match(unpaid.html, /No payment was collected/i);
});

test("refund email uses the confirmed refund amount, not the order total", () => {
  const mail = renderRefundProcessedCustomer(
    snapshot({ refundAmount: 150, refundReference: "rfnd_abc", paidAmount: 500 })
  );
  assert.match(mail.subject, /Refund processed/);
  assert.match(mail.html, /₹150/);
  assert.match(mail.html, /rfnd_abc/);
  assert.doesNotMatch(mail.html, /₹500/);
});

test("all template interpolations are escaped", () => {
  const mail = renderOrderPlacedCustomer(
    snapshot({
      customerName: '"><img src=x onerror=alert(1)>',
      items: [{ name: "<b onmouseover=alert(2)>Wax</b>", quantity: 1, price: 100 }],
      orderNumber: "MT-<script>3</script>",
    })
  );
  // Escaped output keeps the payload as inert text — no live tags survive.
  assert.doesNotMatch(mail.html, /<img|<script/i);
  assert.match(mail.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(mail.html, /&lt;b onmouseover=alert\(2\)&gt;/);
});

test("emails never expose internal order ids", () => {
  const mail = renderOrderPlacedCustomer(snapshot());
  // The public link uses the id path segment; the body copy shows only the
  // human order number, and no cuid-style ids appear in the text.
  assert.doesNotMatch(mail.html, /ord_[a-z0-9]{10,}/i);
  assert.match(mail.html, /MT-20261017-ABC123/);
});

test("email address validation and escaping helpers", () => {
  assert.equal(isValidEmail("asha@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail(42), false);
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml("a&b"), "a&amp;b");
});
