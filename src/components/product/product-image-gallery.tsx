"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt?: string | null;
  sortOrder: number;
}

interface ProductImageGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number>(0);

  const prev = useCallback(() => {
    setSelected((s) => (s > 0 ? s - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setSelected((s) => (s < images.length - 1 ? s + 1 : 0));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  useEffect(() => {
    if (thumbRef.current) {
      const active = thumbRef.current.children[selected] as HTMLElement;
      if (active) {
        active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selected]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-200">
            <ShoppingBag className="h-12 w-12 text-neutral-300" />
          </div>
          <span className="text-sm text-neutral-400">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-col">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          ref={thumbRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar lg:overflow-x-visible"
        >
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              onClick={() => setSelected(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                selected === i
                  ? "border-orange-500 shadow-md"
                  : "border-neutral-200 hover:border-neutral-400"
              )}
            >
              <div className="flex h-full w-full items-center justify-center bg-neutral-50">
                <ShoppingBag className="h-4 w-4 text-neutral-300" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-50"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images[selected]?.url?.startsWith("/") ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-neutral-100">
                <ShoppingBag className="h-16 w-16 text-neutral-300" />
              </div>
            </div>
          ) : (
            <Image
              src={images[selected].url}
              alt={images[selected].alt || productName}
              fill
              className="object-contain"
              priority={selected === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        {/* Navigation Arrows - Desktop only */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:bg-white hover:shadow-lg lg:flex"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-neutral-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:bg-white hover:shadow-lg lg:flex"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-neutral-700" />
            </button>
          </>
        )}

        {/* Dot Indicators - Mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  selected === i
                    ? "w-5 bg-orange-500"
                    : "w-2 bg-white/60"
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
