import Link from "next/link";
import Image from "next/image";
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
    <section className="relative bg-neutral-950 overflow-hidden ">
      {/* Desktop Hero */}
      <div className="relative hidden lg:block">
        {/* Background Image - Full Width */}
        <Image
          src="/hero image.png"
          alt="MOTOMAN premium car care"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />

        <div className="relative mx-auto max-w-[1280px] px-6">
          <div className="flex min-h-[560px] items-center">
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
          </div>
        </div>
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
          {/* Background Image */}
          <Image
            src="/hero image.png"
            alt="MOTOMAN premium car care"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/60 to-neutral-950" />

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
