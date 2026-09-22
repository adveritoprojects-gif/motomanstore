"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", measurementId, { page_path: url });
  }, [pathname, searchParams, measurementId]);

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />;
}
