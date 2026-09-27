import Link from "next/link";
import { BookOpen, Check, Eye, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meter } from "@/components/ui/meter";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

type TimelineWeek = {
  id: string;
  weekNumber: number;
  topic: string | null;
  learningObjective: string | null;
  startDate: Date | null;
  endDate: Date | null;
  _count: { lessons: number; materials: number };
};

// A chronological, vertical rail of the semester's weeks — planned weeks show a
// filled marker and their topic; unplanned weeks stay hollow with a "Create
// plan" prompt, so the gaps in the plan are obvious at a glance.
export function TeachingPlanTimeline({
  planId,
  weeks,
}: {
  planId: string;
  weeks: TimelineWeek[];
}) {
  const total = weeks.length;
  const planned = weeks.filter((w) => w.topic).length;
  const pct = total > 0 ? Math.round((planned / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Planning progress</span>
          <span className="tabular-nums text-muted-foreground">
            {planned} / {total} weeks planned
          </span>
        </div>
        <Meter value={pct} />
      </div>

      <ol className="relative flex flex-col gap-3 border-l pl-6">
        {weeks.map((week) => {
          const isPlanned = !!week.topic;
          const dateRange =
            week.startDate && week.endDate
              ? `${formatDate(week.startDate)} – ${formatDate(week.endDate)}`
              : null;

          return (
            <li key={week.id} className="relative text-sm">
              <span
                className={cn(
                  "absolute top-2.5 -left-[calc(1.5rem+9px)] flex size-[18px] items-center justify-center rounded-full border",
                  isPlanned
                    ? "border-chart-1 bg-chart-1 text-white"
                    : "border-dashed bg-background text-muted-foreground",
                )}
                aria-hidden
              >
                {isPlanned ? <Check className="size-3" /> : null}
              </span>

              <div className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Week {week.weekNumber}</p>
                    {dateRange ? (
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {dateRange}
                      </span>
                    ) : null}
                  </div>
                  {isPlanned ? (
                    <>
                      <p className="truncate">{week.topic}</p>
                      {week.learningObjective ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {week.learningObjective}
                        </p>
                      ) : null}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {week._count.lessons} lesson(s)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className="size-3" />
                          {week._count.materials} material(s)
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Not planned yet</p>
                  )}
                </div>

                <Button
                  variant={isPlanned ? "outline" : "default"}
                  size="sm"
                  render={
                    <Link
                      href={
                        isPlanned
                          ? `/teaching-plans/${planId}/weeks/${week.id}`
                          : `/teaching-plans/${planId}/weeks/${week.id}/edit`
                      }
                    />
                  }
                  nativeButton={false}
                >
                  {isPlanned ? (
                    <>
                      <Eye />
                      View
                    </>
                  ) : (
                    <>
                      <Plus />
                      Create plan
                    </>
                  )}
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
