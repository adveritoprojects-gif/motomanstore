import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND, HERO_FEATURES } from "@/lib/data";
import {
  Sparkles,
  ShieldCheck,
  Users,
  Leaf,
} from "lucide-react";

const featureIcons = [Sparkles, ShieldCheck, Users, Leaf];

export function Hero() {
  return (
    <section className="relative bg-neutral-950 overflow-hidden">
      {/* Desktop Hero */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="relative flex min-h-[560px] items-center">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent z-10" aria-hidden="true" />

            {/* Hero background image placeholder - dark automotive scene */}
            <div className="absolute inset-0" aria-hidden="true">
              <div className="h-full w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                aria-hidden="true"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "60px 60px",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
                {BRAND.slogan.split(".").join(".   ")}
              </p>
              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-white">
                Premium
                <br />
                Car Care
                <br />
                For a Better{" "}
                <span className="text-orange-500">Drive.</span>
              </h1>
              <p className="mb-8 max-w-md text-base leading-relaxed text-neutral-400">
                {BRAND.description}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-white"
                >
                  Explore Products
                </Link>
              </div>
            </div>

            {/* Decorative elements - product silhouette area */}
            <div className="absolute right-0 top-0 z-10 hidden h-full w-1/2 items-center justify-center xl:flex" aria-hidden="true">
              <div className="relative">
                {/* Abstract product shapes */}
                <div className="h-[400px] w-[300px] rounded-2xl bg-gradient-to-b from-neutral-800/40 to-neutral-900/20 backdrop-blur-sm border border-neutral-700/30" />
                <div className="absolute -right-8 top-12 h-[200px] w-[120px] rounded-xl bg-gradient-to-b from-orange-500/10 to-orange-600/5 border border-orange-500/20" />
                <div className="absolute -left-6 bottom-16 h-[160px] w-[100px] rounded-xl bg-gradient-to-b from-neutral-700/30 to-neutral-800/20 border border-neutral-600/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature indicators */}
        <div className="border-t border-neutral-800">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="grid grid-cols-4 divide-x divide-neutral-800">
              {HERO_FEATURES.map((feature, i) => {
                const Icon = featureIcons[i];
                return (
                  <div key={feature} className="flex items-center gap-3 py-5">
                    <Icon className="h-5 w-5 text-orange-500 shrink-0" />
                    <span className="text-xs font-medium text-neutral-300">
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hero */}
      <div className="lg:hidden">
        <div className="relative min-h-[480px] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            aria-hidden="true"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex min-h-[480px] flex-col justify-center px-5 py-12">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-orange-500">
              Drive Cleaner. Drive Better.
            </p>
            <h1 className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight text-white">
              Premium
              <br />
              Car Care
              <br />
              For a Better{" "}
              <span className="text-orange-500">Drive.</span>
            </h1>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-400">
              {BRAND.description}
            </p>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Carousel indicators */}
            <div className="mt-8 flex items-center gap-2" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
            </div>
          </div>
        </div>

        {/* Mobile Feature indicators */}
        <div className="grid grid-cols-2 divide-x divide-y divide-neutral-800 border-t border-neutral-800">
          {HERO_FEATURES.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={feature} className="flex items-center gap-2 px-5 py-3">
                <Icon className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="text-[11px] font-medium text-neutral-300">
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
