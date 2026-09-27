"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CategoriesChecklist({
  name,
  categories,
  excludeId,
  initialSelected,
}: {
  name: string;
  categories: { id: string; name: string }[];
  excludeId?: string;
  initialSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Additional categories (multi-select)</p>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
      <div className="grid grid-cols-2 gap-2">
        {categories
          .filter((c) => c.id !== excludeId)
          .map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={(checked) => toggle(c.id, checked === true)}
              />
              <Label className="font-normal">{c.name}</Label>
            </label>
          ))}
      </div>
    </div>
  );
}
