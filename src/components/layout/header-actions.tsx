"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandMenu } from "@/components/layout/command-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const QUICK_ACTIONS = [
  { label: "New counseling session", href: "/counseling/new" },
  { label: "New incident", href: "/incidents/major/new" },
  { label: "Log minor behavior", href: "/incidents/minor/new" },
  { label: "Add follow-up", href: "/follow-ups?new=1" },
  { label: "Generate report", href: "/reports/new" },
];

export function HeaderActions() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline-block">
          &#8984;K
        </kbd>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="accent" />}>
          <Plus />
          <span className="hidden sm:inline">Quick actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {QUICK_ACTIONS.map((action) => (
            <DropdownMenuItem key={action.href} onClick={() => router.push(action.href)}>
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <CommandMenu open={open} onOpenChange={setOpen} />
      <ThemeToggle />
    </div>
  );
}
