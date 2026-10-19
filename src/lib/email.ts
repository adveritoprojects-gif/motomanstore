import { Resend } from "resend";

/**
 * Server-only email transport. Credentials (RESEND_API_KEY) never leave this
 * module; callers pass already-rendered subjects/HTML and a validated
 * recipient address.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface SendResult {
  ok: boolean;
  /** True when a later retry could plausibly succeed (5xx, 429, network). */
  retryable: boolean;
  /** Safe, short summary — never the API key or full provider payload. */
  reason?: string;
}

export interface EmailTransport {
  send(message: EmailMessage): Promise<SendResult>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && EMAIL_RE.test(value);
}

export interface EmailConfig {
  /** True when the Resend API key is present (delivery possible). */
  configured: boolean;
  /** Verified sender address; null when FROM_EMAIL is unset/invalid. */
  fromEmail: string | null;
  /** Admin alert address; null when unset/invalid (admin emails are skipped). */
  adminEmail: string | null;
}

/**
 * Runtime validation of server-side email configuration. Never throws — a
 * missing provider must not break checkout or admin actions.
 */
export function getEmailConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const rawFrom = process.env.FROM_EMAIL?.trim();
  const rawAdmin = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

  return {
    configured: Boolean(apiKey),
    fromEmail: rawFrom && isValidEmail(rawFrom) ? rawFrom : null,
    adminEmail: rawAdmin && isValidEmail(rawAdmin) ? rawAdmin : null,
  };
}

/** Resend error names that indicate a permanent problem (no point retrying). */
const PERMANENT_RESEND_ERRORS = new Set([
  "validation_error",
  "missing_required_field",
  "invalid_attachment",
  "invalid_from",
  "invalid_api_key",
  "missing_api_key",
  "invalid_parameter",
  "invalid_region",
  "rate_limit_exceeded_exceeded", // defensive; real 429 is retryable below
]);

function classifyResendError(error: {
  name?: string;
  message?: string;
}): SendResult {
  const name = error.name ?? "unknown";
  const message = (error.message ?? "").slice(0, 200);

  if (name === "rate_limit_exceeded" || /rate.?limit|429/i.test(message)) {
    return { ok: false, retryable: true, reason: `rate limited: ${message}` };
  }
  if (PERMANENT_RESEND_ERRORS.has(name) || /4\d\d/.test(message)) {
    return { ok: false, retryable: false, reason: `${name}: ${message}` };
  }
  // 5xx and unknown failures: retry with backoff.
  return { ok: false, retryable: true, reason: `${name}: ${message}` };
}

let resendInstance: Resend | null = null;

function getResend(apiKey: string): Resend {
  if (!resendInstance) resendInstance = new Resend(apiKey);
  return resendInstance;
}

/** Production transport backed by Resend. */
export function createResendTransport(): EmailTransport {
  return {
    async send(message: EmailMessage): Promise<SendResult> {
      const config = getEmailConfig();
      if (!config.configured || !config.fromEmail) {
        return {
          ok: false,
          retryable: true,
          reason: "email provider not configured (RESEND_API_KEY / FROM_EMAIL)",
        };
      }
      if (!isValidEmail(message.to)) {
        return { ok: false, retryable: false, reason: "invalid recipient address" };
      }

      try {
        const resend = getResend(process.env.RESEND_API_KEY as string);
        const { error } = await resend.emails.send({
          from: `MOTOMAN <${config.fromEmail}>`,
          to: message.to,
          subject: message.subject,
          html: message.html,
        });
        if (error) return classifyResendError(error);
        return { ok: true, retryable: false };
      } catch (err) {
        const text = err instanceof Error ? err.message : "unknown error";
        return {
          ok: false,
          retryable: true,
          reason: `provider exception: ${text.slice(0, 200)}`,
        };
      }
    },
  };
}

let defaultTransport: EmailTransport | null = null;

/** Lazy singleton used by the notification service in production wiring. */
export function getEmailTransport(): EmailTransport {
  if (!defaultTransport) defaultTransport = createResendTransport();
  return defaultTransport;
}

/** Test hook — swaps the process-wide transport. Pass null to reset. */
export function __setEmailTransportForTests(
  transport: EmailTransport | null
): void {
  defaultTransport = transport;
}

/** Escapes a value for interpolation into HTML email bodies. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Formats an INR amount consistently across email templates. */
export function formatInr(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `₹${safe.toLocaleString("en-IN")}`;
}
