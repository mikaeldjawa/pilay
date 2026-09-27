import { cn } from "@/lib/utils";

// The Blue / Marigold stat tile. One "lead" tile per row is filled blue with
// an optional sparkline; the rest are plain white surfaces. Mirrors the
// `.stat` / `.stat.lead` recipe in docs/Design System Preview.md.
export function StatCard({
  label,
  value,
  delta,
  deltaTone = "up",
  lead = false,
  spark,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: "up" | "flat";
  lead?: boolean;
  spark?: number[];
  className?: string;
}) {
  const max = spark && spark.length ? Math.max(...spark, 1) : 1;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-[18px] shadow-soft-sm",
        lead && "border-primary bg-primary text-primary-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "text-[13px] font-medium text-muted-foreground",
          lead && "text-primary-foreground/70",
        )}
      >
        {label}
      </div>
      <div className="mt-1.5 mb-0.5 text-[28px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
        {value}
      </div>
      {delta ? (
        <div
          className={cn(
            "text-xs font-semibold",
            deltaTone === "up" ? "text-success" : "text-muted-foreground",
            lead && "text-[var(--yellow-300)]",
          )}
        >
          {delta}
        </div>
      ) : null}
      {spark && spark.length ? (
        <div className="mt-3 flex h-[30px] items-end gap-1">
          {spark.map((v, i) => {
            const isLast = i === spark.length - 1;
            return (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-t-[3px]",
                  lead
                    ? isLast
                      ? "bg-marigold"
                      : "bg-white/20"
                    : isLast
                      ? "bg-marigold"
                      : "bg-secondary",
                )}
                style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
