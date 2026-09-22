"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  message?: string;
  href?: string;
}

export function AnnouncementBar({
  message = "Free shipping on orders above ₹999",
  href,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-orange-500 text-white">
      <div className="flex h-9 items-center justify-center px-4">
        {href ? (
          <a
            href={href}
            className="text-xs font-medium tracking-wide hover:opacity-80 transition-opacity"
          >
            {message}
          </a>
        ) : (
          <span className="text-xs font-medium tracking-wide">{message}</span>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          aria-label="Close announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
