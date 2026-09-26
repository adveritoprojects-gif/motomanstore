#!/usr/bin/env bash
# Build 4 gallery images per product (7 x 4 = 28) from the supplied Motoman
# photos in public/products/. Crops only — the logo, label and product shape
# are never altered, and no text/packaging is invented.
#
# Source photos (p*.jpeg) are the real Motoman reference shots:
#   p1 = yellow/blue/black microfiber cloths   (680 GSM / 350 GSM coloured cloths)
#   p2 = official Glass Cleaning Microfiber Cloth graphic
#   p3 = car shampoo + foam sprayer on a car bonnet
#   p4 = Motoman Premium Car Shampoo 500ml bottle on a microfiber cloth
#   p5 = foam sprayer held in a gloved hand
#   p6 = stack of grey/black microfiber towels   (1200 GSM cloth)
#
# Every product gets 4 distinct crops — no file is reused across products.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=public/products
OUT="${OUT_DIR:-public/products}"

img() { # img <out> <args...>
  local out="$OUT/$1"; shift
  magick "$@" -filter Lanczos -resize "1400x1400>" -strip -interlace Plane -quality 82 "$out"
  printf '%s %s\n' "$(identify -format '%wx%h' "$out")" "$out"
}

mkdir -p "$OUT"

# ── 1. Car Shampoo (source: p4 bottle photo, p3 car-hood shot) ─────────────
# strip the social-app chrome out of p4, keep the real bottle untouched
img shampoo-1.jpg "$SRC/p4.jpeg" -crop 572x760+0+300 +repage
img shampoo-2.jpg "$SRC/p4.jpeg" -crop 300x430+136+420 +repage
img shampoo-3.jpg "$SRC/p3.jpeg" +repage
img shampoo-4.jpg "$SRC/p3.jpeg" -crop 300x420+150+560 +repage

# ── 2. Foam Sprayer (source: p3 on bonnet, p5 hand-held) ───────────────────
img sprayer-1.jpg "$SRC/p3.jpeg" -crop 440x700+380+330 +repage
img sprayer-2.jpg "$SRC/p3.jpeg" -crop 340x300+450+600 +repage
img sprayer-3.jpg "$SRC/p5.jpeg" -crop 620x820+120+380 +repage
img sprayer-4.jpg "$SRC/p5.jpeg" -crop 420x360+230+300 +repage

# ── 3. 1200 GSM — black/grey Motoman microfiber towels (source: p6 stack) ──
img mf1200-1.jpg "$SRC/p6.jpeg" +repage
img mf1200-2.jpg "$SRC/p6.jpeg" -crop 420x320+150+180 +repage
img mf1200-3.jpg "$SRC/p6.jpeg" -crop 500x360+60+60 +repage
img mf1200-4.jpg "$SRC/p6.jpeg" -crop 420x340+340+220 +repage

# ── 4. 680 GSM — yellow/blue/black cloths (source: p1) ────────────────────
img mf680-1.jpg "$SRC/p1.jpeg" -resize 1400x +repage
img mf680-2.jpg "$SRC/p1.jpeg" -crop 500x400+600+250 +repage
img mf680-3.jpg "$SRC/p1.jpeg" -crop 480x1024+1056+0 +repage
img mf680-4.jpg "$SRC/p1.jpeg" -crop 480x400+240+600 +repage

# ── 5. 350 GSM — coloured cloths, second set of crops from p1 ─────────────
img mf350-1.jpg "$SRC/p1.jpeg" -crop 700x760+270+130 +repage
img mf350-2.jpg "$SRC/p1.jpeg" -crop 380x420+840+260 +repage
img mf350-3.jpg "$SRC/p1.jpeg" -crop 700x1024+0+0 +repage
img mf350-4.jpg "$SRC/p1.jpeg" -crop 600x420+900+560 +repage

# ── 6. Microfiber Gloves (source: p5 — gloved hand in use) ─────────────────
img gloves-1.jpg "$SRC/p5.jpeg" -crop 400x560+420+520 +repage
img gloves-2.jpg "$SRC/p5.jpeg" +repage
img gloves-3.jpg "$SRC/p5.jpeg" -crop 320x340+450+560 +repage
img gloves-4.jpg "$SRC/p5.jpeg" -crop 500x520+160+700 +repage

# ── 7. Glass Cleaning Cloth (source: p2 official product graphic) ─────────
img glass-1.jpg "$SRC/p2.jpeg" -crop 1254x745+0+0 +repage
img glass-2.jpg "$SRC/p2.jpeg" -crop 418x395+0+745 +repage -resize 200%
img glass-3.jpg "$SRC/p2.jpeg" -crop 418x395+418+745 +repage -resize 200%
img glass-4.jpg "$SRC/p2.jpeg" -crop 418x395+836+745 +repage -resize 200%

echo "---- generated files:"
ls -la "$OUT"
