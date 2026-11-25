"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

interface ShareProductProps {
  productName: string;
  slug: string;
  className?: string;
}

/**
 * Canonical share URL. Uses the site's configured origin (production domain)
 * instead of window.location, and never falls back to a localhost URL.
 */
function canonicalProductUrl(slug: string): string {
  const path = `/products/${slug}`;
  const url = absoluteUrl(path);
  try {
    const host = new URL(url).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
      return `https://motoman.in${path}`;
    }
  } catch {
    // Invalid URL — return whatever absoluteUrl produced.
  }
  return url;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/**
 * Subtle share trigger plus a premium share dialog.
 *
 * Opens a clean share interface with the native Web Share API
 * (`navigator.share`) when the browser supports it, and always offers
 * WhatsApp, Facebook, X and Copy Link as fallbacks.
 */
export function ShareProduct({ productName, slug, className }: ShareProductProps) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url = canonicalProductUrl(slug);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const closeDialog = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeDialog]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: productName,
        text: `Check out ${productName} on ${SITE_NAME}`,
        url,
      });
      closeDialog();
    } catch (error) {
      // User dismissed the native sheet — keep the dialog open.
      if (error instanceof Error && error.name === "AbortError") return;
      // Anything else: stay on the fallback dialog.
    }
  };

  const handleCopy = async () => {
    try {
      if (typeof navigator.clipboard?.writeText === "function") {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!copied) throw new Error("Copy command failed");
      }
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState("idle"), 3000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${productName}\n${url}`
  )}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(productName)}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setCopyState("idle");
          setOpen(true);
        }}
        aria-label={`Share ${productName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700",
          className
        )}
      >
        <Share2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDialog}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-product-title"
            className="relative w-full animate-slide-up rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-sm sm:animate-fade-in sm:rounded-2xl sm:pb-5"
          >
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200 sm:hidden"
              aria-hidden="true"
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="share-product-title"
                  className="text-base font-semibold text-neutral-950"
                >
                  Share Product
                </h2>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  {productName}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDialog}
                aria-label="Close share dialog"
                className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share via device
              </button>
            )}

            <div className="mt-4 grid grid-cols-4 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeDialog}
                aria-label={`Share ${productName} on WhatsApp`}
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-neutral-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium text-neutral-600">
                  WhatsApp
                </span>
              </a>

              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeDialog}
                aria-label={`Share ${productName} on Facebook`}
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-neutral-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm">
                  <FacebookIcon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium text-neutral-600">
                  Facebook
                </span>
              </a>

              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeDialog}
                aria-label={`Share ${productName} on X`}
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-neutral-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white shadow-sm">
                  <XIcon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[11px] font-medium text-neutral-600">
                  X
                </span>
              </a>

              <button
                type="button"
                onClick={handleCopy}
                aria-label={
                  copyState === "copied"
                    ? "Link copied"
                    : `Copy link to ${productName}`
                }
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-neutral-50"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition-colors",
                    copyState === "copied" ? "bg-green-600" : "bg-orange-500"
                  )}
                >
                  {copyState === "copied" ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <span className="text-[11px] font-medium text-neutral-600">
                  {copyState === "copied" ? "Copied" : "Copy Link"}
                </span>
              </button>
            </div>

            <p
              role="status"
              aria-live="polite"
              className="mt-3 flex min-h-[1.25rem] items-center justify-center text-center text-xs"
            >
              {copyState === "copied" && (
                <span className="flex items-center gap-1 font-medium text-green-600">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Link copied to clipboard
                </span>
              )}
              {copyState === "error" && (
                <span className="text-red-500">
                  Couldn&apos;t copy the link. Select it below instead.
                </span>
              )}
            </p>

            <p
              className="mt-1 truncate text-center text-[11px] text-neutral-400"
              title={url}
            >
              {url}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
