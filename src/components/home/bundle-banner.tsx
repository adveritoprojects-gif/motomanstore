import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { BUNDLE_ITEMS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function BundleBanner() {
  return (
    <section className="bg-neutral-950 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        {/* Desktop */}
        <div className="hidden py-16 md:py-20 lg:block">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
                The Ultimate Care Package
              </p>
              <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white">
                Complete
                <br />
                Car Care
                <br />
                Bundle
              </h2>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-neutral-400">
                Everything you need for a showroom finish.
                <br />
                Clean. Protect. Maintain. All in one kit.
              </p>

              {/* Items list */}
              <div className="mb-8 grid grid-cols-2 gap-2">
                {BUNDLE_ITEMS.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="mb-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(1299)}
                </span>
                <span className="text-lg text-neutral-500 line-through">
                  {formatPrice(1599)}
                </span>
                <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  19% OFF
                </span>
              </div>

              <Link
                href="/shop?product=complete-car-care-kit"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: Product visual */}
            <div className="relative flex items-center justify-center" aria-hidden="true">
              <div className="relative h-[380px] w-[380px]">
                {/* Main bundle card */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50" />
                {/* Accent glow */}
                <div className="absolute -inset-4 rounded-3xl bg-orange-500/5 blur-xl" />
                {/* Inner product placeholders */}
                <div className="absolute left-6 top-6 h-[120px] w-[120px] rounded-xl bg-neutral-700/50 border border-neutral-600/30" />
                <div className="absolute right-6 top-6 h-[120px] w-[120px] rounded-xl bg-neutral-700/50 border border-neutral-600/30" />
                <div className="absolute bottom-6 left-6 h-[120px] w-[120px] rounded-xl bg-neutral-700/50 border border-neutral-600/30" />
                <div className="absolute bottom-6 right-6 h-[120px] w-[120px] rounded-xl bg-orange-500/10 border border-orange-500/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="py-10 lg:hidden">
          <div className="rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700/50 p-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-orange-500">
              The Ultimate Care Package
            </p>
            <h2 className="mb-3 text-2xl font-bold leading-tight text-white">
              Complete Car Care Bundle
            </h2>
            <p className="mb-4 text-xs text-neutral-400">
              Everything you need for a showroom finish.
            </p>

            {/* Items */}
            <div className="mb-4 flex flex-wrap gap-2">
              {BUNDLE_ITEMS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-3 py-1 text-[11px] text-neutral-300"
                >
                  <Check className="h-3 w-3 text-orange-500" />
                  {item}
                </span>
              ))}
            </div>

            {/* Pricing */}
            <div className="mb-5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {formatPrice(1299)}
              </span>
              <span className="text-sm text-neutral-500 line-through">
                {formatPrice(1599)}
              </span>
              <span className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                19% OFF
              </span>
            </div>

            <Link
              href="/shop?product=complete-car-care-kit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
