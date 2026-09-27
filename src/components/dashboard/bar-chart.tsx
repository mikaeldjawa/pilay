"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Single-hue magnitude chart — for "count across buckets" data (one metric,
// many categories/time-buckets), never a multi-series/rainbow chart. Used
// wherever color would otherwise carry no real identity/severity meaning.
export function MagnitudeBarChart({
  data,
  dataKey = "count",
  labelKey = "name",
  emphasizeMax = false,
}: {
  data: Record<string, string | number>[];
  dataKey?: string;
  labelKey?: string;
  emphasizeMax?: boolean;
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data for this period.</p>;
  }

  const maxValue = emphasizeMax ? Math.max(...data.map((d) => Number(d[dataKey]) || 0)) : undefined;

  return (
    <ResponsiveContainer width="100%" height={240}>
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
        <Bar dataKey={dataKey} fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24}>
          {emphasizeMax ? (
            <LabelList
              dataKey={dataKey}
              position="top"
              fontSize={11}
              fill="var(--foreground)"
              formatter={(value: string | number | boolean | null | undefined) => (value === maxValue ? value : "")}
            />
          ) : null}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
