import * as React from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   Typography System — Premium Editorial Scale
   ═══════════════════════════════════════════════════════ */

type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "body-lg"
  | "body"
  | "body-sm"
  | "caption"
  | "overline"
  | "lead";

type TypographyElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "label";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: TypographyElement;
  variant?: TypographyVariant;
}

const variantStyles: Record<TypographyVariant, string> = {
  display: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]",
  h1: "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight",
  h2: "text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight",
  h3: "text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight",
  h4: "text-lg sm:text-xl md:text-2xl font-semibold",
  h5: "text-base sm:text-lg font-semibold",
  "body-lg": "text-lg leading-relaxed",
  body: "text-base leading-relaxed",
  "body-sm": "text-sm leading-relaxed",
  caption: "text-xs leading-normal text-muted-foreground",
  overline: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
  lead: "text-lg sm:text-xl text-muted-foreground leading-relaxed",
};

const defaultElements: Record<TypographyVariant, TypographyElement> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "p",
  overline: "p",
  lead: "p",
};

function Typography({ className, variant = "body", as, children, ...props }: TypographyProps) {
  const Component = as || defaultElements[variant];
  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

Typography.displayName = "Typography";

export { Typography };
