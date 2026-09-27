"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function JournalLinkPicker({
  name,
  label,
  options,
  initialSelected,
  entryDate,
}: {
  name: string;
  label: string;
  options: { id: string; label: string; date: string }[];
  initialSelected?: string[];
  // Entry's date (yyyy-mm-dd) — the list defaults to just that day's items,
  // since a journal entry is almost always about what happened that day.
  entryDate?: string;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);
  const [showAll, setShowAll] = useState(false);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  const sameDayOptions = useMemo(
    () => (entryDate ? options.filter((o) => o.date === entryDate) : options),
    [options, entryDate],
  );
  // Always keep already-selected items visible even if they fall outside the
  // day filter (editing an older entry shouldn't hide its existing links).
  const visibleOptions = useMemo(() => {
    if (showAll || !entryDate) return options;
    const selectedElsewhere = options.filter(
      (o) => selected.includes(o.id) && o.date !== entryDate,
    );
    return [...sameDayOptions, ...selectedElsewhere];
  }, [showAll, entryDate, options, sameDayOptions, selected]);

  if (options.length === 0) return null;

  const canShowAll = entryDate && !showAll && sameDayOptions.length < options.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {canShowAll ? (
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setShowAll(true)}
          >
            Show all ({options.length})
          </button>
        ) : null}
      </div>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
      {visibleOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing on this day.</p>
      ) : (
        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border p-2">
          {visibleOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(option.id)}
                onCheckedChange={(checked) => toggle(option.id, checked === true)}
              />
              <Label className="font-normal">{option.label}</Label>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
