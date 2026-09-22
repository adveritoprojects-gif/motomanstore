// ─── Razorpay Types ──────────────────────────────────────

export interface RazorpayInstance {
  orders: {
    create: (params: RazorpayOrderCreateParams) => Promise<RazorpayOrder>;
    fetch: (orderId: string) => Promise<RazorpayOrder>;
  };
  payments: {
    fetch: (paymentId: string) => Promise<RazorpayPayment>;
  };
}

export interface RazorpayOrderCreateParams {
  amount: number; // in paise
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  notes?: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  description?: string;
  captured: boolean;
  created_at: number;
}

export interface RazorpayVerificationParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ─── Razorpay Checkout (Client-side) ────────────────────

export interface RazorpayCheckoutOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  };
}

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ─── Window Extension ───────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}
