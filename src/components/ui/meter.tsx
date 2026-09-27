import { cn } from "@/lib/utils";

// Neutral fill by default — deliberately not status-colored, since
// completion rate has no defined "good/bad" threshold anywhere in the
// product; tinting it would invent a value judgment the app doesn't make.
export function Meter({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-chart-1 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
