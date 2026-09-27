"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRowList } from "@/components/shared/use-row-list";

type Row = { name: string; role: string; notes: string };

export function WitnessesEditor({ name, initialRows }: { name: string; initialRows?: Row[] }) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({
      name: "",
      role: "",
      notes: "",
    }),
    initialRows,
  );

  const serialized = JSON.stringify(
    rows
      .map((r) => ({ name: r.name, role: r.role || undefined, notes: r.notes || undefined }))
      .filter((r) => r.name),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Witnesses <span className="text-muted-foreground">(non-student adults)</span>
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus />
          Add witness
        </Button>
      </div>
      <input type="hidden" name={name} value={serialized} />
      {rows.map((row) => (
        <div key={row._key} className="flex items-center gap-2 rounded-lg border p-2">
          <Input
            placeholder="Name"
            value={row.name}
            onChange={(e) => updateRow(row._key, { name: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="Role"
            value={row.role}
            onChange={(e) => updateRow(row._key, { role: e.target.value })}
            className="w-32"
          />
          <Input
            placeholder="Notes"
            value={row.notes}
            onChange={(e) => updateRow(row._key, { notes: e.target.value })}
            className="flex-1"
          />
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
    </div>
  );
}
