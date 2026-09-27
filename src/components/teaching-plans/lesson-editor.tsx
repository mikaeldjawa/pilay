"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRowList } from "@/components/shared/use-row-list";

type Row = { title: string; description: string; content: string };

export function LessonEditor({
  name,
  initialRows,
}: {
  name: string;
  initialRows?: Row[];
}) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({ title: "", description: "", content: "" }),
    initialRows,
  );

  const serialized = JSON.stringify(
    rows
      .map(({ title, description, content }) => ({
        title,
        description: description || undefined,
        content: content || undefined,
      }))
      .filter((r) => r.title),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Lessons</p>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus />
          Add lesson
        </Button>
      </div>
      <input type="hidden" name={name} value={serialized} />
      {rows.map((row) => (
        <div key={row._key} className="flex gap-2 rounded-lg border p-2">
          <div className="flex flex-1 flex-col gap-2">
            <Input
              placeholder="Lesson title"
              value={row.title}
              onChange={(e) => updateRow(row._key, { title: e.target.value })}
            />
            <Input
              placeholder="Short description (optional)"
              value={row.description}
              onChange={(e) => updateRow(row._key, { description: e.target.value })}
            />
            <Textarea
              placeholder="Lesson content (optional)"
              rows={2}
              value={row.content}
              onChange={(e) => updateRow(row._key, { content: e.target.value })}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => removeRow(row._key)}
            aria-label="Remove lesson"
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No lessons yet.</p>
      ) : null}
    </div>
  );
}
