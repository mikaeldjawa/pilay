import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Code-split recharts out of every route's main bundle — StatTile is used
// on several pages that render zero or one sparkline at most, so this
// shouldn't be part of the shared first-load JS.
const Sparkline = dynamic(() => import("@/components/dashboard/sparkline").then((m) => m.Sparkline));

export type StatDelta = {
  value: number;
  unit?: "%" | "count";
  comparedTo: string;
  // Which direction of the raw value is "good" — the delta's color/tone is
  // computed from this, never from the sign alone (e.g. open incidents
  // going up is bad even though the number itself is positive).
  goodDirection: "up" | "down" | "neutral";
};

export function StatTile({
  label,
  value,
  icon: Icon,
  delta,
  trend,
  emphasis = "reference",
  href,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: StatDelta;
  trend?: number[];
  emphasis?: "reference" | "attention";
  href?: string;
}) {
  const card = (
    <Card
      className={cn(emphasis === "attention" && "border-l-2 border-l-status-serious bg-status-serious/5")}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
          {Icon ? <Icon className="size-3.5" /> : null}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        {delta ? <StatTileDelta delta={delta} /> : null}
        {trend ? <Sparkline data={trend} /> : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {card}
      </Link>
    );
  }
  return card;
}

function StatTileDelta({ delta }: { delta: StatDelta }) {
  const direction = delta.value > 0 ? "up" : delta.value < 0 ? "down" : "neutral";
  const isGood = delta.goodDirection === "neutral" || direction === "neutral" || direction === delta.goodDirection;
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const sign = delta.value > 0 ? "+" : "";
  const unit = delta.unit === "%" ? "%" : "";

  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className={cn("flex items-center gap-0.5", isGood ? "text-muted-foreground" : "text-status-serious")}>
        <Icon className="size-3" />
        <span className="tabular-nums">
          {sign}
          {delta.value}
          {unit}
        </span>
      </span>
      <span>{delta.comparedTo}</span>
    </p>
  );
}
