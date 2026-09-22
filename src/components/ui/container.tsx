import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "xl", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", className)}
        style={{
          maxWidth:
            size === "full"
              ? "100%"
              : size === "sm"
                ? "var(--container-sm)"
                : size === "md"
                  ? "var(--container-md)"
                  : size === "lg"
                    ? "var(--container-lg)"
                    : size === "xl"
                      ? "var(--container-xl)"
                      : "var(--container-2xl)",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = "Container";

export { Container };
