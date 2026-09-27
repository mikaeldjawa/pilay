"use client";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchAction } from "@/modules/search/search.actions";
import type { SearchResult } from "@/modules/search/search.service";
import { AlertTriangle, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TYPE_ICON = { student: Users, incident: AlertTriangle, report: FileText };

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      searchAction(query).then(setResults);
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Command>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title='Quick navigation'
      >
        <CommandInput
          placeholder='Search students, incidents, reports, or jump to a section...'
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 ? (
            <CommandGroup heading='Search results'>
              {results.map((r) => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <CommandItem
                    key={`${r.type}-${r.id}`}
                    onSelect={() => go(r.href)}
                  >
                    <Icon />
                    <div className='flex flex-col'>
                      <span>{r.title}</span>
                      <span className='text-xs text-muted-foreground'>
                        {r.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
          <CommandGroup heading='Navigate'>
            {NAV_ITEMS.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </Command>
  );
}
