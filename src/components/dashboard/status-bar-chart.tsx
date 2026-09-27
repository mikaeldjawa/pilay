"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STATUS_ICON, STATUS_LABEL, type StatusLevel } from "@/lib/status-colors";

const LEVEL_VAR: Record<StatusLevel, string> = {
  neutral: "var(--muted-foreground)",
  warning: "var(--status-warning)",
  serious: "var(--status-serious)",
  critical: "var(--destructive)",
};

// Per-bar color carries real identity/severity meaning here (unlike
// MagnitudeBarChart's single hue), so — per the status-color rules — this
// always ships a legend and never relies on color alone.
export function StatusBarChart({
  data,
  dataKey = "count",
  labelKey = "name",
  levelKey = "level",
}: {
  data: (Record<string, string | number> & { [key: string]: string | number })[];
  dataKey?: string;
  labelKey?: string;
  levelKey?: string;
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data for this period.</p>;
  }

  const levelsPresent = Array.from(new Set(data.map((d) => d[levelKey] as StatusLevel)));

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis
            dataKey={labelKey}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((row, i) => (
              <Cell key={i} fill={LEVEL_VAR[row[levelKey] as StatusLevel]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {levelsPresent.map((level) => {
          const Icon = STATUS_ICON[level];
          return (
            <span key={level} className="flex items-center gap-1">
              <Icon className="size-3" style={{ color: LEVEL_VAR[level] }} />
              {STATUS_LABEL[level]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
