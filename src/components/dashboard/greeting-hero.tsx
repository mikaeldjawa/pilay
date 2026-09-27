"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Sunrise, Moon, Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA_ICONS = { plus: Plus, list: ListChecks } as const;

function greetingForHour(hour: number) {
  if (hour < 12) return { greeting: "Good morning", Icon: Sunrise };
  if (hour < 18) return { greeting: "Good afternoon", Icon: Sun };
  return { greeting: "Good evening", Icon: Moon };
}

export function GreetingHero({
  firstName,
  summary,
  cta,
}: {
  firstName: string;
  summary: string;
  cta: { href: string; label: string; icon: keyof typeof CTA_ICONS };
}) {
  // Time of day must come from the visitor's own clock, never the server's —
  // Vercel runs in UTC, so a server-computed hour greeted evening users with
  // "Good morning". Compute after mount to keep the greeting local and avoid a
  // hydration mismatch (first paint shows the neutral "Welcome").
  const [time, setTime] = useState<ReturnType<typeof greetingForHour> | null>(
    null,
  );
  useEffect(() => {
    setTime(greetingForHour(new Date().getHours()));
  }, []);

  const greeting = time?.greeting ?? "Welcome";
  const TimeIcon = time?.Icon ?? Sun;
  const CtaIcon = CTA_ICONS[cta.icon];

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-10 size-44 rounded-full"
        style={{ background: "color-mix(in oklch, var(--marigold), transparent 84%)" }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-marigold text-marigold-foreground shadow-soft-sm">
            <TimeIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">{summary}</p>
          </div>
        </div>
        <Button
          variant="accent"
          render={<Link href={cta.href} />}
          nativeButton={false}
        >
          <CtaIcon />
          {cta.label}
        </Button>
      </div>
    </section>
  );
}
