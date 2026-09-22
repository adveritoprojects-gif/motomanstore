import { cn } from "@/lib/utils";
import { PackageOpen } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 text-muted-foreground" aria-hidden="true">
        {icon || <PackageOpen className="h-12 w-12" strokeWidth={1} />}
      </div>
      <Typography variant="h4" className="mb-2">
        {title}
      </Typography>
      {description && (
        <Typography variant="body-sm" className="mb-6 max-w-sm text-muted-foreground">
          {description}
        </Typography>
      )}
      {action && (
        <Button asChild variant="outline">
          <a href={action.href}>{action.label}</a>
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
