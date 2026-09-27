"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { useRowList } from "@/components/shared/use-row-list";
import { INVOLVEMENT_TYPES } from "@/modules/incidents/incident.schema";

type Row = { studentId: string; involvementType: (typeof INVOLVEMENT_TYPES)[number]; notes: string };

const INVOLVEMENT_TYPE_ITEMS = INVOLVEMENT_TYPES.map((t) => ({ value: t, label: t }));

export function ParticipantsEditor({
  name,
  students,
  initialRows,
}: {
  name: string;
  students: { id: string; label: string }[];
  initialRows?: Row[];
}) {
  const { rows, addRow, removeRow, updateRow } = useRowList<Row>(
    () => ({
      studentId: students[0]?.id ?? "",
      involvementType: "INVOLVED",
      notes: "",
    }),
    initialRows,
  );

  const serialized = JSON.stringify(
    rows
      .map((r) => ({ studentId: r.studentId, involvementType: r.involvementType, notes: r.notes || undefined }))
      .filter((r) => r.studentId),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Individuals Involved</p>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus />
          Add participant
        </Button>
      </div>
      <input type="hidden" name={name} value={serialized} />
      {rows.map((row) => (
        <div key={row._key} className="flex items-center gap-2 rounded-lg border p-2">
          <Combobox
            className="flex-1"
            value={row.studentId}
            onValueChange={(value) => updateRow(row._key, { studentId: value })}
            options={students}
            placeholder="Student"
            searchPlaceholder="Search students..."
          />
          <Select
            value={row.involvementType}
            onValueChange={(value) =>
              value && updateRow(row._key, { involvementType: value as Row["involvementType"] })
            }
            items={INVOLVEMENT_TYPE_ITEMS}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOLVEMENT_TYPE_ITEMS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Notes (optional)"
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
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No participants added yet.</p>
      ) : null}
    </div>
  );
}
