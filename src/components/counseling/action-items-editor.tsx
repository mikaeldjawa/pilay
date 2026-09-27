"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRowList } from "@/components/shared/use-row-list";

type Row = { title: string; body: string; owner: string };

export function ActionItemsEditor({ name, initialRows }: { name: string; initialRows?: Row[] }) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({
      title: "",
      body: "",
      owner: "",
    }),
    initialRows,
  );

  const serialized = JSON.stringify(
    rows
      .map(({ title, body, owner }) => ({ title, body, owner: owner || undefined }))
      .filter((r) => r.title || r.body),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Section 4 — Action Plan / Recommendations</p>
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
              <Input
                placeholder="Action item title"
                value={row.title}
                onChange={(e) => updateRow(row._key, { title: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Owner (optional)"
                value={row.owner}
                onChange={(e) => updateRow(row._key, { owner: e.target.value })}
                className="w-40"
              />
            </div>
            <Textarea
              placeholder="Details"
              rows={2}
              value={row.body}
              onChange={(e) => updateRow(row._key, { body: e.target.value })}
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
        <p className="text-xs text-muted-foreground">No action items yet.</p>
      ) : null}
    </div>
  );
}
