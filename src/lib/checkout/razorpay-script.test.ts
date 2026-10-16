import assert from "node:assert/strict";
import test from "node:test";
import {
  RAZORPAY_CHECKOUT_SRC,
  RAZORPAY_SCRIPT_ERROR_MESSAGE,
  RazorpayScriptError,
  createRazorpayScriptLoader,
} from "./razorpay-script";

const g = globalThis as unknown as { window?: unknown; document?: unknown };

interface FakeScriptElement {
  src: string;
  async: boolean;
  listeners: Record<string, Array<() => void>>;
  addEventListener(type: string, listener: () => void): void;
}

function createFakeDom() {
  const appended: FakeScriptElement[] = [];
  const doc = {
    createElement(): FakeScriptElement {
      const element: FakeScriptElement = {
        src: "",
        async: false,
        listeners: {},
        addEventListener(type, listener) {
          (element.listeners[type] ??= []).push(listener);
        },
      };
      return element;
    },
    body: {
      appendChild(element: FakeScriptElement) {
        appended.push(element);
      },
    },
    head: {
      appendChild(element: FakeScriptElement) {
        appended.push(element);
      },
    },
  };
  return { doc, appended };
}

function fire(element: FakeScriptElement, event: "load" | "error") {
  for (const listener of element.listeners[event] ?? []) listener();
}

function withDom(fn: (ctx: ReturnType<typeof createFakeDom>) => Promise<void>) {
  return async () => {
    const ctx = createFakeDom();
    const previousWindow = g.window;
    const previousDocument = g.document;
    g.document = ctx.doc;
    g.window = undefined;
    try {
      await fn(ctx);
    } finally {
      g.window = previousWindow;
      g.document = previousDocument;
    }
  };
}

test(
  "resolves immediately when the checkout library is already available",
  withDom(async ({ appended }) => {
    g.window = { Razorpay: function Razorpay() {} };
    const loader = createRazorpayScriptLoader();
    await loader.ensureRazorpayScript(50);
    assert.equal(loader.getStatus(), "ready");
    assert.equal(appended.length, 0, "no extra script tag is injected");
  }),
);

test(
  "never resolves before the library exists and waits for the router's script",
  withDom(async ({ appended }) => {
    const loader = createRazorpayScriptLoader();
    loader.markLoading(); // <Script strategy="afterInteractive"> mounted
    const pending = loader.ensureRazorpayScript(500);
    assert.equal(loader.getStatus(), "loading");
    assert.equal(appended.length, 0, "no duplicate script while one is loading");

    g.window = { Razorpay: function Razorpay() {} };
    loader.notifyLoaded(); // onLoad from next/script
    await pending;
    assert.equal(loader.getStatus(), "ready");
  }),
);

test(
  "rejects with a shopper-friendly error when the script fails to load",
  withDom(async () => {
    const loader = createRazorpayScriptLoader();
    loader.markLoading();
    const pending = loader.ensureRazorpayScript(500);
    loader.notifyFailed(); // onError from next/script
    await assert.rejects(pending, (error: unknown) => {
      assert.ok(error instanceof RazorpayScriptError);
      assert.equal(error.message, RAZORPAY_SCRIPT_ERROR_MESSAGE);
      return true;
    });
    assert.equal(loader.getStatus(), "error");
  }),
);

test(
  "treats an onLoad replay without the library as a failure",
  withDom(async () => {
    const loader = createRazorpayScriptLoader();
    loader.markLoading();
    const pending = loader.ensureRazorpayScript(500);
    loader.notifyLoaded(); // router replays onLoad for an already-tried src
    await assert.rejects(pending, RazorpayScriptError);
    assert.equal(loader.getStatus(), "error");
  }),
);

test(
  "retries without a page refresh by injecting a fresh script",
  withDom(async ({ appended }) => {
    const loader = createRazorpayScriptLoader();
    loader.notifyFailed(); // an earlier attempt already failed
    assert.equal(loader.getStatus(), "error");

    const first = loader.ensureRazorpayScript(500);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].src, RAZORPAY_CHECKOUT_SRC);
    assert.equal(appended[0].async, true);
    fire(appended[0], "error");
    await assert.rejects(first, RazorpayScriptError);

    const second = loader.ensureRazorpayScript(500);
    assert.equal(appended.length, 2, "retry appends a new script tag");
    g.window = { Razorpay: function Razorpay() {} };
    fire(appended[1], "load");
    await second;
    assert.equal(loader.getStatus(), "ready");
  }),
);

test(
  "gives up after the load timeout so the shopper is never stuck",
  withDom(async ({ appended }) => {
    const loader = createRazorpayScriptLoader();
    const pending = loader.ensureRazorpayScript(10);
    assert.equal(appended.length, 1);
    await assert.rejects(pending, RazorpayScriptError);
    assert.equal(loader.getStatus(), "error");
  }),
);
