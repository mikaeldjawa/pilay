"use client";

import { useRowList } from "@/components/shared/use-row-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

type Row = {
  phase: "BEFORE" | "DURING" | "AFTER" | "CUSTOM";
  title: string;
  body: string;
};

const PHASES: Row["phase"][] = ["BEFORE", "DURING", "AFTER", "CUSTOM"];
const PHASE_ITEMS = PHASES.map((phase) => ({ value: phase, label: phase }));

export function TimelineEventsEditor({
  name,
  initialRows,
}: {
  name: string;
  initialRows?: Row[];
}) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({
      phase: "BEFORE",
      title: "",
      body: "",
    }),
    initialRows,
  );

  const serialized = JSON.stringify(
    rows
      .map(({ phase, title, body }) => ({ phase, title, body }))
      .filter((r) => r.body),
  );

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>A. Timeline of Incident</p>
          <p className='text-xs text-muted-foreground'>
            Before / During / After
          </p>
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
            <div className='flex gap-2'>
              <Select
                value={row.phase}
                onValueChange={(value) => {
                  if (value)
                    updateRow(row._key, { phase: value as Row["phase"] });
                }}
                items={PHASE_ITEMS}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_ITEMS.map((phase) => (
                    <SelectItem key={phase.value} value={phase.value}>
                      {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder='Title (optional)'
                value={row.title}
                onChange={(e) => updateRow(row._key, { title: e.target.value })}
              />
            </div>
            <Textarea
              placeholder='What happened'
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
        <p className='text-xs text-muted-foreground'>No timeline events yet.</p>
      ) : null}
    </div>
  );
}
