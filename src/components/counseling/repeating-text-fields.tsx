"use client";

import { useRowList } from "@/components/shared/use-row-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

type Row = { title: string; body: string };

export function RepeatingTextFields({
  name,
  label,
  description,
  initialRows,
}: {
  name: string;
  label: string;
  description?: string;
  initialRows?: Row[];
}) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({ title: "", body: "" }),
    initialRows,
  );

  const serialized = JSON.stringify(
    rows
      .map(({ title, body }) => ({ title, body }))
      .filter((r) => r.title || r.body),
  );

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>{label}</p>
          {description ? (
            <p className='text-xs text-muted-foreground'>{description}</p>
          ) : null}
        </div>
        <Button type='button' variant='outline' size='sm' onClick={addRow}>
          <Plus />
          Add
        </Button>
      </div>
      <input type='hidden' name={name} value={serialized} />
      {rows.map((row) => (
        <div key={row._key} className='flex gap-2 rounded-lg border p-2'>
          <div className='flex flex-1 flex-col gap-2'>
            <Input
              placeholder='Title'
              value={row.title}
              onChange={(e) => updateRow(row._key, { title: e.target.value })}
            />
            <Textarea
              placeholder='Details'
              rows={2}
              value={row.body}
              onChange={(e) => updateRow(row._key, { body: e.target.value })}
            />
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => removeRow(row._key)}
            aria-label='Remove'
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      {rows.length === 0 ? (
        <p className='text-xs text-muted-foreground'>No entries yet.</p>
      ) : null}
    </div>
  );
}
