import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend API key not configured. Set RESEND_API_KEY.");
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const resend = getResend();
  const fromEmail = process.env.FROM_EMAIL || "orders@motoman.in";

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>
    `
    )
    .join("");

  const address = [
    data.shippingAddress.address1,
    data.shippingAddress.address2,
    data.shippingAddress.city,
    data.shippingAddress.state,
    data.shippingAddress.postalCode,
    data.shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0a0a0a; padding: 24px; text-align: center;">
        <h1 style="color: #f97316; margin: 0; font-size: 24px; letter-spacing: 2px;">MOTOMAN</h1>
        <p style="color: #999; margin: 4px 0 0; font-size: 12px;">PREMIUM CAR CARE</p>
      </div>

      <div style="padding: 32px 0;">
        <h2 style="color: #16a34a; margin: 0 0 8px;">Order Confirmed!</h2>
        <p style="color: #666; margin: 0 0 24px;">Thank you for your purchase, ${data.customerName}.</p>

        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; color: #666; font-size: 14px;">Order Number</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #0a0a0a;">${data.orderNumber}</p>
        </div>

        <h3 style="font-size: 16px; margin: 0 0 12px; color: #333;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid #333;">
              <th style="padding: 8px 0; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Product</th>
              <th style="padding: 8px 0; text-align: center; font-size: 12px; text-transform: uppercase; color: #666;">Qty</th>
              <th style="padding: 8px 0; text-align: right; font-size: 12px; text-transform: uppercase; color: #666;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right;">₹${data.subtotal.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">Shipping</td>
              <td style="padding: 8px 0; text-align: right;">${data.shippingCost === 0 ? "Free" : `₹${data.shippingCost.toLocaleString("en-IN")}`}</td>
            </tr>
            <tr style="border-top: 2px solid #333;">
              <td colspan="2" style="padding: 12px 0 0; text-align: right; font-weight: bold;">Total</td>
              <td style="padding: 12px 0 0; text-align: right; font-weight: bold; font-size: 18px;">₹${data.total.toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="font-size: 16px; margin: 0 0 12px; color: #333;">Shipping Address</h3>
        <p style="color: #666; margin: 0; line-height: 1.6;">
          ${data.customerName}<br>
          ${address}
        </p>
      </div>

      <div style="border-top: 1px solid #eee; padding: 24px 0; text-align: center; color: #999; font-size: 12px;">
        <p style="margin: 0;">MOTOMAN Premium Car Care | Mumbai, Maharashtra, India</p>
        <p style="margin: 4px 0 0;">Questions? Reply to this email or contact us at hello@motoman.in</p>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `MOTOMAN <${fromEmail}>`,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html,
    });
  } catch {
    // Don't throw — email failure shouldn't block order processing
  }
}
