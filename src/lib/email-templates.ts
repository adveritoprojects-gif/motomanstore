import { escapeHtml as esc, formatInr } from "@/lib/email";

/**
 * Pure email template renderers. Every value interpolated into the HTML is
 * escaped — customer names, product names, addresses and notes are untrusted.
 * Templates never receive provider secrets or internal database ids.
 */

export interface OrderEmailSnapshot {
  orderNumber: string;
  /** Absolute, validated link to the order success page. */
  orderUrl: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  codFee: number;
  total: number;
  /** "cod" | "razorpay" */
  paymentMethod: string;
  /** Payment row status: pending | success | failed | refunded */
  paymentStatus: string;
  /** Order status at render time. */
  orderStatus: string;
  /** Pre-joined shipping address lines (already plain text). */
  shippingAddressLines: string[];
  /** Amount actually collected from a successful payment, if any. */
  paidAmount?: number | null;
  /** Confirmed refunded amount (may be a partial refund), when known. */
  refundAmount?: number | null;
  /** Provider reference for a confirmed refund (e.g. Razorpay refund id). */
  refundReference?: string | null;
  /** Error summary for payment-failure emails (safe, short). */
  failureReason?: string | null;
  /** Customer email — rendered only in admin-alert templates, never customer-facing ones. */
  customerEmail?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const BRAND_NAME = "MOTOMAN";
const SUPPORT_CONTACT = "hello@motoman.in";

function layout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #0a0a0a; padding: 24px; text-align: center;">
    <h1 style="color: #f97316; margin: 0; font-size: 24px; letter-spacing: 2px;">${BRAND_NAME}</h1>
    <p style="color: #999; margin: 4px 0 0; font-size: 12px;">PREMIUM CAR CARE</p>
  </div>
  <div style="padding: 32px 0;">
    ${body}
  </div>
  <div style="border-top: 1px solid #eee; padding: 24px 0; text-align: center; color: #999; font-size: 12px;">
    <p style="margin: 0;">${BRAND_NAME} Premium Car Care | Mumbai, Maharashtra, India</p>
    <p style="margin: 4px 0 0;">Questions? Reply to this email or contact us at ${SUPPORT_CONTACT}</p>
  </div>
</body>
</html>`;
}

function orderNumberBlock(s: OrderEmailSnapshot): string {
  return `
    <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 4px; color: #666; font-size: 14px;">Order Number</p>
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #0a0a0a;">${esc(s.orderNumber)}</p>
    </div>`;
}

function itemsTable(s: OrderEmailSnapshot): string {
  const rows = s.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${esc(item.name)}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${esc(item.quantity)}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${esc(formatInr(item.price * item.quantity))}</td>
      </tr>`
    )
    .join("");

  const codRow = s.codFee
    ? `<tr>
        <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">COD Handling Fee</td>
        <td style="padding: 8px 0; text-align: right;">${esc(formatInr(s.codFee))}</td>
      </tr>`
    : "";

  return `
    <h3 style="font-size: 16px; margin: 0 0 12px; color: #333;">Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #333;">
          <th style="padding: 8px 0; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Product</th>
          <th style="padding: 8px 0; text-align: center; font-size: 12px; text-transform: uppercase; color: #666;">Qty</th>
          <th style="padding: 8px 0; text-align: right; font-size: 12px; text-transform: uppercase; color: #666;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">Subtotal</td>
          <td style="padding: 8px 0; text-align: right;">${esc(formatInr(s.subtotal))}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">Shipping</td>
          <td style="padding: 8px 0; text-align: right;">${s.shippingCost === 0 ? "Free" : esc(formatInr(s.shippingCost))}</td>
        </tr>
        ${codRow}
        <tr style="border-top: 2px solid #333;">
          <td colspan="2" style="padding: 12px 0 0; text-align: right; font-weight: bold;">Total</td>
          <td style="padding: 12px 0 0; text-align: right; font-weight: bold; font-size: 18px;">${esc(formatInr(s.total))}</td>
        </tr>
      </tfoot>
    </table>`;
}

function addressBlock(s: OrderEmailSnapshot): string {
  if (s.shippingAddressLines.length === 0) return "";
  const lines = s.shippingAddressLines.map((line) => esc(line)).join("<br>");
  return `
    <h3 style="font-size: 16px; margin: 0 0 12px; color: #333;">Shipping Address</h3>
    <p style="color: #666; margin: 0 0 24px; line-height: 1.6;">${esc(s.customerName)}<br>${lines}</p>`;
}

function orderButton(s: OrderEmailSnapshot): string {
  return `
    <p style="margin: 0 0 24px;">
      <a href="${esc(s.orderUrl)}" style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">View order</a>
    </p>
    <p style="margin: 0 0 24px; font-size: 12px; color: #999;">${esc(s.orderUrl)}</p>`;
}

function paymentLabel(method: string): string {
  return method === "cod" ? "Cash on Delivery" : method === "razorpay" ? "Online payment (Razorpay)" : method;
}

export function renderOrderPlacedCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  const cod = s.paymentMethod === "cod";
  const intro = cod
    ? `<p style="color: #333; margin: 0 0 12px;"><strong>Payment is due on delivery.</strong> Please keep ${esc(formatInr(s.total))} ready in cash when your order arrives — this order is not paid online.</p>`
    : `<p style="color: #333; margin: 0 0 12px;"><strong>Payment is still pending.</strong> Your order is reserved and will ship once your online payment is completed and verified.</p>`;

  return {
    subject: `Your ${BRAND_NAME} order ${s.orderNumber} is confirmed`,
    html: layout(`
      <h2 style="color: #16a34a; margin: 0 0 8px;">Order received!</h2>
      <p style="color: #666; margin: 0 0 16px;">Thank you for your purchase, ${esc(s.customerName)}.</p>
      ${intro}
      ${orderNumberBlock(s)}
      <p style="color: #666; margin: 0 0 24px; font-size: 14px;">Payment method: ${esc(paymentLabel(s.paymentMethod))}</p>
      ${itemsTable(s)}
      ${addressBlock(s)}
      ${orderButton(s)}
    `),
  };
}

export function renderOrderPlacedAdmin(s: OrderEmailSnapshot): RenderedEmail {
  const cod = s.paymentMethod === "cod";
  return {
    subject: `New order ${s.orderNumber} — ${formatInr(s.total)}`,
    html: layout(`
      <h2 style="color: #0a0a0a; margin: 0 0 8px;">New order received</h2>
      <p style="color: #666; margin: 0 0 16px;">${cod ? "Cash on Delivery — payment due on delivery." : "Online payment pending."}</p>
      ${orderNumberBlock(s)}
      <p style="color: #666; margin: 0 0 8px; font-size: 14px;">Customer: <strong style="color:#0a0a0a;">${esc(s.customerName)}</strong> (${esc(s.customerEmail ?? "")})</p>
      <p style="color: #666; margin: 0 0 24px; font-size: 14px;">Total: <strong style="color:#0a0a0a;">${esc(formatInr(s.total))}</strong> · Method: ${esc(paymentLabel(s.paymentMethod))}</p>
      ${itemsTable(s)}
      ${addressBlock(s)}
      ${orderButton(s)}
    `),
  };
}

export function renderPaymentSucceededCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  return {
    subject: `Payment received for ${BRAND_NAME} order ${s.orderNumber}`,
    html: layout(`
      <h2 style="color: #16a34a; margin: 0 0 8px;">Payment received</h2>
      <p style="color: #666; margin: 0 0 16px;">Thank you, ${esc(s.customerName)} — your payment of <strong>${esc(formatInr(s.paidAmount ?? s.total))}</strong> for order ${esc(s.orderNumber)} has been confirmed. We'll prepare it for dispatch next.</p>
      ${orderNumberBlock(s)}
      ${itemsTable(s)}
      ${addressBlock(s)}
      ${orderButton(s)}
    `),
  };
}

export function renderPaymentSucceededAdmin(
  s: OrderEmailSnapshot
): RenderedEmail {
  return {
    subject: `Payment received — order ${s.orderNumber}`,
    html: layout(`
      <h2 style="color: #0a0a0a; margin: 0 0 8px;">Payment confirmed</h2>
      <p style="color: #666; margin: 0 0 16px;">${esc(s.customerName)} paid <strong>${esc(formatInr(s.paidAmount ?? s.total))}</strong> for order ${esc(s.orderNumber)}.</p>
      ${orderNumberBlock(s)}
      ${itemsTable(s)}
      ${orderButton(s)}
    `),
  };
}

export function renderPaymentFailedCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  const reason = s.failureReason
    ? `<p style="color: #666; margin: 0 0 16px; font-size: 14px;">Reason: ${esc(s.failureReason)}</p>`
    : "";
  return {
    subject: `Payment issue with ${BRAND_NAME} order ${s.orderNumber}`,
    html: layout(`
      <h2 style="color: #dc2626; margin: 0 0 8px;">We couldn't take your payment</h2>
      <p style="color: #666; margin: 0 0 16px;">Hi ${esc(s.customerName)} — the online payment for order ${esc(s.orderNumber)} did not go through. <strong>No money was captured.</strong> Your order is still saved as unpaid.</p>
      ${reason}
      ${orderNumberBlock(s)}
      <p style="color: #333; margin: 0 0 24px;">You can retry the payment from the checkout page. If you were charged, the amount will be auto-reversed by your bank — please contact support with your order number.</p>
      ${orderButton(s)}
    `),
  };
}

export function renderOrderShippedCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  return {
    subject: `Your ${BRAND_NAME} order ${s.orderNumber} has shipped`,
    html: layout(`
      <h2 style="color: #16a34a; margin: 0 0 8px;">Your order is on its way</h2>
      <p style="color: #666; margin: 0 0 16px;">${esc(s.customerName)}, order ${esc(s.orderNumber)} has been shipped.</p>
      ${orderNumberBlock(s)}
      ${itemsTable(s)}
      ${orderButton(s)}
      <p style="color: #999; margin: 0; font-size: 12px;">Tracking details will be shared separately when available.</p>
    `),
  };
}

export function renderOrderDeliveredCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  return {
    subject: `Your ${BRAND_NAME} order ${s.orderNumber} has been delivered`,
    html: layout(`
      <h2 style="color: #16a34a; margin: 0 0 8px;">Delivered</h2>
      <p style="color: #666; margin: 0 0 16px;">${esc(s.customerName)}, order ${esc(s.orderNumber)} was delivered. We hope everything looks great!</p>
      ${orderNumberBlock(s)}
      ${itemsTable(s)}
      ${orderButton(s)}
    `),
  };
}

export function renderOrderCancelledCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  const paid = (s.paidAmount ?? 0) > 0;
  const paymentNote = paid
    ? `<p style="color: #333; margin: 0 0 12px;">A payment of <strong>${esc(formatInr(s.paidAmount ?? 0))}</strong> was collected for this order. If a refund applies, it will be processed separately — you'll receive a separate email once the refund is confirmed. This message is not a refund confirmation.</p>`
    : `<p style="color: #333; margin: 0 0 12px;">No payment was collected for this order, so there is nothing to refund.</p>`;

  return {
    subject: `Update on your ${BRAND_NAME} order ${s.orderNumber}`,
    html: layout(`
      <h2 style="color: #dc2626; margin: 0 0 8px;">Order cancelled</h2>
      <p style="color: #666; margin: 0 0 16px;">${esc(s.customerName)}, your order ${esc(s.orderNumber)} has been cancelled at your request.</p>
      ${orderNumberBlock(s)}
      ${paymentNote}
      ${itemsTable(s)}
      ${orderButton(s)}
    `),
  };
}

export function renderRefundProcessedCustomer(
  s: OrderEmailSnapshot
): RenderedEmail {
  const amount = s.refundAmount ?? s.paidAmount ?? s.total;
  const reference = s.refundReference
    ? `<p style="color: #666; margin: 0 0 16px; font-size: 14px;">Refund reference: ${esc(s.refundReference)}</p>`
    : "";
  return {
    subject: `Refund processed for ${BRAND_NAME} order ${s.orderNumber}`,
    html: layout(`
      <h2 style="color: #16a34a; margin: 0 0 8px;">Refund processed</h2>
      <p style="color: #666; margin: 0 0 16px;">${esc(s.customerName)}, a refund of <strong>${esc(formatInr(amount))}</strong> for order ${esc(s.orderNumber)} has been processed. Depending on your bank, it may take 5–7 business days to appear on your statement.</p>
      ${orderNumberBlock(s)}
      ${reference}
      ${orderButton(s)}
    `),
  };
}
