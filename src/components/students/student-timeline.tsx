import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  FileText,
  History,
  ListChecks,
  MessagesSquare,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TimelineEvent } from "@/modules/students/student-timeline.service";

const EVENT_ICON: Record<TimelineEvent["type"], LucideIcon> = {
  counseling_session: MessagesSquare,
  counseling_session_subject: MessagesSquare,
  incident: AlertTriangle,
  behavior_record: ClipboardList,
  follow_up: ListChecks,
  parent_contact: Phone,
  generated_report: FileText,
};

export function eventHref(event: TimelineEvent): string | undefined {
  switch (event.type) {
    case "counseling_session":
    case "counseling_session_subject":
      return `/counseling/${event.id}`;
    case "incident":
      return `/incidents/${event.id}`;
    case "generated_report":
      return `/reports/${event.id}`;
    default:
      return undefined;
  }
}

export function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const Icon = EVENT_ICON[event.type];
  const href = eventHref(event);
  const row = (
    <div className='flex items-start gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/30'>
      <span className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background'>
        <Icon className='size-3 text-muted-foreground' />
      </span>
      <div>
        <p className='tabular-nums text-muted-foreground'>
          {event.date.toLocaleDateString("en-US", { timeZone: "UTC" })}
        </p>
        <p className={href ? "hover:underline" : undefined}>{event.summary}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className='block'>
      {row}
    </Link>
  ) : (
    row
  );
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function groupByMonth(events: TimelineEvent[]): { label: string; events: TimelineEvent[] }[] {
  const groups: { label: string; events: TimelineEvent[] }[] = [];
  for (const event of events) {
    const label = monthLabel(event.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(event);
    } else {
      groups.push({ label, events: [event] });
    }
  }
  return groups;
}

export function StudentTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground'>
          <History className='size-6' />
          No activity recorded yet. Counseling sessions, incidents, behavior
          records, and follow-ups will appear here as they happen.
        </CardContent>
      </Card>
    );
  }

  const groups = groupByMonth(events);

  return (
    <div className='flex flex-col gap-6'>
      {groups.map((group) => (
        <div key={group.label}>
          <p className='mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase'>
            {group.label}
          </p>
          <ul className='relative flex flex-col gap-3 border-l pl-6'>
            {group.events.map((event) => {
              const Icon = EVENT_ICON[event.type];
              const href = eventHref(event);
              const row = (
                <div className='flex items-start justify-between gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/30'>
                  <div>
                    <p className='tabular-nums text-muted-foreground'>
                      {event.date.toLocaleDateString("en-US", { timeZone: "UTC" })}
                    </p>
                    <p className={href ? "hover:underline" : undefined}>{event.summary}</p>
                  </div>
                </div>
              );

              return (
                <li key={`${event.type}-${event.id}`} className='relative text-sm'>
                  <span className='absolute top-2 -left-[calc(1.5rem+9px)] flex size-[18px] items-center justify-center rounded-full border bg-background'>
                    <Icon className='size-3 text-muted-foreground' />
                  </span>
                  {href ? (
                    <Link href={href} className='block'>
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
