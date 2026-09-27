import { Badge } from "@/components/ui/badge";
import { STATUS_ICON, type StatusLevel } from "@/lib/status-colors";
import { cn } from "@/lib/utils";

// Mirrors Badge's own `destructive` variant recipe (bg-x/10 text-x, darker
// wash in dark mode) generalized across the 4 status levels, so this reads
// as native to the design system rather than a bolted-on color language.
const LEVEL_CLASS: Record<StatusLevel, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  warning: "bg-status-warning/10 text-status-warning border-status-warning/20 dark:bg-status-warning/20",
  serious: "bg-status-serious/10 text-status-serious border-status-serious/20 dark:bg-status-serious/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
};

export function StatusBadge({ level, label, className }: { level: StatusLevel; label: string; className?: string }) {
  const Icon = STATUS_ICON[level];

  return (
    <Badge variant="outline" className={cn(LEVEL_CLASS[level], className)}>
      <Icon data-icon="inline-start" />
      {label}
    </Badge>
  );
}
