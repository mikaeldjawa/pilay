"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export type ComboboxOption = { id: string; label: string };

// Searchable select for fields backed by a long list (students, etc.) — a
// plain <Select> becomes unusable to scan once the option count grows much
// past a screenful, and browsers only let users jump-to-match by the first
// typed letter, not a name search. Filtering here is by each option's label
// (see the `value={option.label}` below, which is what cmdk searches
// against), never the id — the id is only ever the value actually submitted.
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  id,
  placeholder = "Select...",
  emptyText = "No results found.",
  searchPlaceholder = "Search...",
  required,
  disabled,
  className,
}: {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

  const selectedId = isControlled ? value : internalValue;
  const selected = options.find((option) => option.id === selectedId);

  function handleSelect(option: ComboboxOption) {
    if (!isControlled) setInternalValue(option.id);
    onValueChange?.(option.id);
    setOpen(false);
  }

  return (
    <>
      {name ? (
        <input
          type='hidden'
          name={name}
          value={selectedId ?? ""}
          required={required}
        />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type='button'
              variant='outline'
              role='combobox'
              aria-expanded={open}
              disabled={disabled}
              id={id}
              className={cn(
                "w-full justify-between font-normal",
                !selected && "text-muted-foreground",
                className,
              )}
            >
              <span className='truncate'>{selected?.label ?? placeholder}</span>
              <ChevronsUpDown className='opacity-50' />
            </Button>
          }
          // nativeButton={false}
        />
        <PopoverContent
          align='start'
          className='w-(--anchor-width) min-w-56 p-0'
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    data-checked={option.id === selectedId}
                    onSelect={() => handleSelect(option)}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
