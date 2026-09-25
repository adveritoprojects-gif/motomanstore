#!/usr/bin/env bash
# Build 4 gallery images per product (7 x 4 = 28) from the supplied Motoman
# photos in public/products/. Crops only — the logo, label and product shape
# are never altered, and no text/packaging is invented.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=public/products
OUT=public/products

img() { # img <out> <args...>
  local out="$OUT/$1"; shift
  magick "$@" -filter Lanczos -resize "1400x1400>" -strip -interlace Plane -quality 82 "$out"
  printf '%s %s\n' "$(identify -format '%wx%h' "$out")" "$out"
}

# ── 1. Car Shampoo (source: p4 product photo, p3 car-hood shot) ─────────────
# strip the social-app chrome out of p4, keep the real bottle untouched
img shampoo-1.jpg "$SRC/p4.jpeg" -crop 572x760+0+300 +repage
img shampoo-2.jpg "$SRC/p4.jpeg" -crop 300x430+136+420 +repage
img shampoo-3.jpg "$SRC/p3.jpeg" +repage
img shampoo-4.jpg "$SRC/p3.jpeg" -crop 300x420+150+560 +repage

# ── 2. Foam Sprayer (source: p3 on bonnet, p5 hand-held) ────────────────────
img sprayer-1.jpg "$SRC/p3.jpeg" -crop 440x700+380+330 +repage
img sprayer-2.jpg "$SRC/p3.jpeg" +repage
img sprayer-3.jpg "$SRC/p5.jpeg" +repage
img sprayer-4.jpg "$SRC/p5.jpeg" -crop 420x360+230+300 +repage

# ── 3. 1200 GSM (source: p1 folded cloths, p6 stack) ───────────────────────
img mf1200-1.jpg "$SRC/p1.jpeg" +repage
img mf1200-2.jpg "$SRC/p1.jpeg" -crop 720x560+400+230 +repage
img mf1200-3.jpg "$SRC/p1.jpeg" -crop 540x1024+996+0 +repage
img mf1200-4.jpg "$SRC/p6.jpeg" +repage

# ── 4. 680 GSM (source: p6 stack, p1 cloths) ───────────────────────────────
img mf680-1.jpg "$SRC/p6.jpeg" +repage
img mf680-2.jpg "$SRC/p6.jpeg" -crop 520x420+140+90 +repage
img mf680-3.jpg "$SRC/p1.jpeg" -crop 540x1024+996+0 +repage
img mf680-4.jpg "$SRC/p1.jpeg" +repage

# ── 5. 350 GSM (source: p1 cloths, p6 stack) ───────────────────────────────
img mf350-1.jpg "$SRC/p1.jpeg" -crop 700x760+270+130 +repage
img mf350-2.jpg "$SRC/p1.jpeg" -crop 560x420+520+330 +repage
img mf350-3.jpg "$SRC/p1.jpeg" -crop 700x1024+0+0 +repage
img mf350-4.jpg "$SRC/p6.jpeg" -crop 640x500+80+60 +repage

# ── 6. Microfiber Gloves (source: p5 — gloved hand in use) ──────────────────
img gloves-1.jpg "$SRC/p5.jpeg" -crop 400x560+420+520 +repage
img gloves-2.jpg "$SRC/p5.jpeg" +repage
img gloves-3.jpg "$SRC/p5.jpeg" -crop 320x340+450+560 +repage
img gloves-4.jpg "$SRC/p5.jpeg" -crop 500x520+160+700 +repage

# ── 7. Glass Cleaning Cloth (source: p2 supplied product graphic) ───────────
img glass-1.jpg "$SRC/p2.jpeg" -crop 1254x745+0+0 +repage
img glass-2.jpg "$SRC/p2.jpeg" -crop 418x395+0+745 +repage -resize 200%
img glass-3.jpg "$SRC/p2.jpeg" -crop 418x395+418+745 +repage -resize 200%
img glass-4.jpg "$SRC/p2.jpeg" -crop 418x395+836+745 +repage -resize 200%

echo "---- generated files:"
ls -la "$OUT" | grep -c '^-'
