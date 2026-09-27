"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CodeOption = { id: string; code: string | null; name: string };

export function MultiCodeChecklist({
  idsFieldName,
  otherFieldName,
  options,
  initialSelected,
  initialOther,
  otherPlaceholder,
}: {
  idsFieldName: string;
  otherFieldName: string;
  options: CodeOption[];
  initialSelected?: string[];
  initialOther?: string;
  otherPlaceholder?: string;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  return (
    <div className='flex flex-col gap-2'>
      <input type='hidden' name={idsFieldName} value={JSON.stringify(selected)} />
      <div className='grid grid-cols-2 gap-2'>
        {options.map((o) => (
          <label key={o.id} className='flex items-center gap-2 text-sm'>
            <Checkbox
              checked={selected.includes(o.id)}
              onCheckedChange={(checked) => toggle(o.id, checked === true)}
            />
            <Label className='font-normal'>{o.code ? `${o.code} — ${o.name}` : o.name}</Label>
          </label>
        ))}
      </div>
      <Input
        name={otherFieldName}
        defaultValue={initialOther}
        placeholder={otherPlaceholder ?? "Other, please specify"}
      />
    </div>
  );
}
