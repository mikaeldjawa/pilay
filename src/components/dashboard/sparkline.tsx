"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

// Compact inline trend indicator for StatTile — no axes/gridlines, every
// point de-emphasized except the last (current period), which gets an
// accented end-dot per the stat-tile mark spec.
export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;

  const points = data.map((value, i) => ({ i, value }));
  const lastIndex = points.length - 1;

  return (
    <div className={className} style={{ width: "100%", height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            fill="url(#sparkline-fill)"
            dot={(props: { cx?: number; cy?: number; index?: number }) => {
              if (props.index !== lastIndex) return <g key={props.index} />;
              return (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill="var(--chart-1)"
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              );
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
