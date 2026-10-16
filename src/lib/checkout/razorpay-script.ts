/**
 * Client-side loader for the Razorpay Checkout library (checkout.js).
 *
 * The first load is started by `<Script strategy="afterInteractive">` in the
 * checkout form, which reports the outcome back through
 * `notifyRazorpayScriptLoaded` / `notifyRazorpayScriptFailed`.
 *
 * `ensureRazorpayScript()` never resolves before `window.Razorpay` exists, so
 * the payment modal can never open without its library. When the initial load
 * fails (blocked by a browser extension, offline, timeout) a later call
 * injects a fresh `<script>` so the shopper can retry without reloading the
 * page.
 */

export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const RAZORPAY_SCRIPT_ERROR_MESSAGE =
  "We could not load the secure payment window. Check your connection and press the pay button to try again.";

const DEFAULT_LOAD_TIMEOUT_MS = 20_000;

export class RazorpayScriptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RazorpayScriptError";
  }
}

export type RazorpayScriptStatus = "idle" | "loading" | "ready" | "error";

interface Waiter {
  resolve: () => void;
  reject: (error: Error) => void;
}

function checkoutAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.Razorpay === "function";
}

export function createRazorpayScriptLoader() {
  let status: RazorpayScriptStatus = "idle";
  let waiters: Waiter[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function clearTimer() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function settle(error?: Error) {
    const pending = waiters;
    waiters = [];
    clearTimer();
    for (const waiter of pending) {
      if (error) waiter.reject(error);
      else waiter.resolve();
    }
  }

  function notifyFailed() {
    if (checkoutAvailable()) {
      status = "ready";
      settle();
      return;
    }
    status = "error";
    settle(new RazorpayScriptError(RAZORPAY_SCRIPT_ERROR_MESSAGE));
  }

  function notifyLoaded() {
    // The router can replay onLoad for a src it already attempted, so only
    // trust the event when the library is genuinely available.
    if (!checkoutAvailable()) {
      notifyFailed();
      return;
    }
    status = "ready";
    settle();
  }

  function startTimer(timeoutMs: number) {
    if (timeoutId !== null) return;
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (checkoutAvailable()) {
        notifyLoaded();
        return;
      }
      notifyFailed();
    }, timeoutMs);
  }

  function injectScript() {
    if (typeof document === "undefined") return;
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.addEventListener("load", () => notifyLoaded());
    script.addEventListener("error", () => notifyFailed());
    const parent = document.body ?? document.head;
    if (parent) parent.appendChild(script);
  }

  return {
    /** Call when the `next/script` tag mounts so waiters know a load is under way. */
    markLoading() {
      if (checkoutAvailable()) {
        status = "ready";
      } else if (status === "idle") {
        status = "loading";
      }
    },
    notifyLoaded,
    notifyFailed,
    getStatus: (): RazorpayScriptStatus => status,
    async ensureRazorpayScript(timeoutMs = DEFAULT_LOAD_TIMEOUT_MS): Promise<void> {
      if (checkoutAvailable()) {
        status = "ready";
        return;
      }

      // Idle, previously failed, or "ready" without the global: (re)start now.
      if (status !== "loading") {
        status = "loading";
        injectScript();
      }

      await new Promise<void>((resolve, reject) => {
        waiters.push({ resolve, reject });
        startTimer(timeoutMs);
      });

      if (!checkoutAvailable()) {
        status = "error";
        throw new RazorpayScriptError(RAZORPAY_SCRIPT_ERROR_MESSAGE);
      }
    },
  };
}

export type RazorpayScriptLoader = ReturnType<typeof createRazorpayScriptLoader>;

const loader = createRazorpayScriptLoader();

export const markRazorpayScriptLoading = loader.markLoading;
export const notifyRazorpayScriptLoaded = loader.notifyLoaded;
export const notifyRazorpayScriptFailed = loader.notifyFailed;
export const getRazorpayScriptStatus = loader.getStatus;
export const ensureRazorpayScript = loader.ensureRazorpayScript;
