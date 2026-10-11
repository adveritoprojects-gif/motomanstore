import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { BUNDLE_ITEMS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

function BundleProductGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {BUNDLE_ITEMS.map((item) => (
        <li
          key={item.name}
          className="overflow-hidden rounded-xl border border-neutral-700/60 bg-neutral-900 shadow-sm"
        >
          <div className="relative aspect-square bg-neutral-800">
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 1024px) 42vw, 200px"
              className="object-contain p-2"
            />
          </div>
          <p className="px-2 py-2 text-center text-[11px] font-medium leading-snug text-neutral-200 md:text-xs">
            {item.name}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function BundleBanner() {
  return (
    <section className="overflow-hidden bg-neutral-950">
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-6 lg:py-20">
        <div className="grid items-center gap-5 rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 lg:grid-cols-2 lg:gap-12 lg:rounded-none lg:border-0 lg:bg-none lg:p-0">
          <div className="contents lg:block">
            <div className="order-1">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-orange-500 lg:mb-3 lg:text-xs">
                The Ultimate Care Package
              </p>
              <h2 className="mb-3 text-2xl font-bold leading-tight text-white lg:mb-4 lg:text-4xl lg:tracking-tight">
                <span className="lg:hidden">Complete Car Care Bundle</span>
                <span className="hidden lg:inline">
                  Complete
                  <br />
                  Car Care
                  <br />
                  Bundle
                </span>
              </h2>
              <p className="mb-4 max-w-md text-xs leading-relaxed text-neutral-400 lg:mb-6 lg:text-sm">
                Everything you need for a showroom finish.
                <span className="hidden lg:inline">
                  <br />
                  Clean. Protect. Maintain. All in one kit.
                </span>
              </p>

              <div className="mb-4 flex flex-wrap gap-2 lg:mb-8 lg:grid lg:grid-cols-2">
                {BUNDLE_ITEMS.map((item) => (
                  <div
                    key={item.name}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-3 py-1 text-[11px] text-neutral-300 lg:gap-2 lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:text-sm"
                  >
                    <Check className="h-3 w-3 text-orange-500 lg:h-4 lg:w-4" />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="order-3 lg:order-none">
              <div className="mb-5 flex items-baseline gap-2 lg:mb-6 lg:gap-3">
                <span className="text-2xl font-bold text-white lg:text-3xl">
                  {formatPrice(1299)}
                </span>
                <span className="text-sm text-neutral-500 line-through lg:text-lg">
                  {formatPrice(1599)}
                </span>
                <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white lg:text-xs">
                  19% OFF
                </span>
              </div>

              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 lg:w-auto lg:px-7 lg:hover:shadow-lg lg:hover:shadow-orange-500/20"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="order-2 mx-auto w-full max-w-[440px] lg:order-none">
            <BundleProductGrid />
          </div>
        </div>
      </div>
    </section>
  );
}
