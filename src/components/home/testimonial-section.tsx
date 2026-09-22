"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";

export function TestimonialSection() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prev = () => {
    setCurrent(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  const testimonial = TESTIMONIALS[current];

  return (
    <section className="relative overflow-hidden bg-neutral-950">
      {/* Background pattern */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900/50 to-neutral-950" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(249,115,22,0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-6">
        {/* Desktop */}
        <div className="hidden py-16 md:py-20 lg:block">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Trusted by
              <br />
              Car Enthusiasts
            </h2>
            <p className="mt-3 text-sm text-neutral-400">
              Real people. Real results.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-sm">
              <Quote className="absolute left-6 top-6 h-8 w-8 text-orange-500/20" aria-hidden="true" />

              {/* Stars */}
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-orange-500 text-orange-500"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-base leading-relaxed text-neutral-200">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                {/* Navigation arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-colors hover:border-white hover:text-white"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={next}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-colors hover:border-white hover:text-white"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="py-10 lg:hidden">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Trusted by
              <br />
              Car Enthusiasts
            </h2>
            <p className="mt-2 text-xs text-neutral-400">
              Real people. Real results.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5">
            {/* Stars */}
            <div className="mb-3 flex items-center gap-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-orange-500 text-orange-500"
                />
              ))}
            </div>

            <p className="mb-4 text-sm leading-relaxed text-neutral-200">
              &ldquo;{testimonial.text}&rdquo;
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-white">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prev}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-400"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={next}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-400"
                  aria-label="Next"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
