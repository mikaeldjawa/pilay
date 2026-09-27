"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRowList } from "@/components/shared/use-row-list";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
type Row = { riskDimensionId: string; subjectLabel: string; riskLevel: RiskLevel; justification: string };

const RISK_LEVELS: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

export function RiskAssessmentsEditor({
  name,
  riskDimensions,
  initialRows,
}: {
  name: string;
  riskDimensions: { id: string; name: string }[];
  initialRows?: Row[];
}) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({
      riskDimensionId: riskDimensions[0]?.id ?? "",
      subjectLabel: "",
      riskLevel: "LOW",
      justification: "",
    }),
    initialRows,
  );

  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const riskDimensionItems = riskDimensions.map((d) => ({ value: d.id, label: d.name }));
  const riskLevelItems = RISK_LEVELS.map((level) => ({ value: level, label: level }));

  const serialized = JSON.stringify(
    rows
      .map((r) => ({
        riskDimensionId: r.riskDimensionId,
        subjectLabel: r.subjectLabel || undefined,
        riskLevel: r.riskLevel,
        justification: r.justification,
      }))
      .filter((r) => r.riskDimensionId && r.justification),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Risk &amp; Psychological Status</p>
          <p className="text-xs text-muted-foreground">Multi-dimensional risk rating</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus />
          Add
        </Button>
      </div>
      <input type="hidden" name={name} value={serialized} />
      {rows.map((row) => (
        <div key={row._key} className="flex gap-2 rounded-lg border p-2">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex gap-2">
              <Select
                value={row.riskDimensionId}
                onValueChange={(value) => updateRow(row._key, { riskDimensionId: value ?? "" })}
                items={riskDimensionItems}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Dimension" />
                </SelectTrigger>
                <SelectContent>
                  {riskDimensionItems.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={row.riskLevel}
                onValueChange={(value) => {
                  if (value) updateRow(row._key, { riskLevel: value as RiskLevel });
                }}
                items={riskLevelItems}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riskLevelItems.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Subject (optional)"
                value={row.subjectLabel}
                onChange={(e) => updateRow(row._key, { subjectLabel: e.target.value })}
                className="w-40"
              />
            </div>
            <Textarea
              placeholder="Justification"
              rows={2}
              value={row.justification}
              onChange={(e) => updateRow(row._key, { justification: e.target.value })}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => removeRow(row._key)}
            aria-label="Remove"
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No risk assessments yet.</p>
      ) : null}
    </div>
  );
}
