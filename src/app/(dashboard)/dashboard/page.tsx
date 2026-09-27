import Link from "next/link";
import dynamic from "next/dynamic";
import {
  CalendarClock,
  AlertCircle,
  Activity,
  ListChecks,
  MessagesSquare,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GreetingHero } from "@/components/dashboard/greeting-hero";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBehaviorTrend, getOpenIncidentsTrend } from "@/modules/analytics/analytics.service";
import { startOfToday, endOfToday, daysAgo, daysFromNow } from "@/lib/date";
import { formatStudentName } from "@/lib/utils";

// Code-split recharts out of the dashboard's main bundle into its own chunk.
const MagnitudeBarChart = dynamic(() => import("@/components/dashboard/bar-chart").then((m) => m.MagnitudeBarChart));

export default async function DashboardPage() {
  const today = startOfToday();
  const todayEnd = endOfToday();

  const [
    sessionsToday,
    sessionsTrailing7d,
    followUpsDueToday,
    openIncidents,
    openIncidentsTrend,
    majorIncidentsThisWeek,
    majorIncidentsPriorWeek,
    todaysSessions,
    todaysFollowUps,
    overdueFollowUps,
    dueSoonFollowUps,
    recentIncidents,
    recentSessions,
    behaviorTrend,
  ] = await Promise.all([
    db.counselingSession.count({ where: { deletedAt: null, sessionDate: { gte: today, lte: todayEnd } } }),
    db.counselingSession.count({ where: { deletedAt: null, sessionDate: { gte: daysAgo(7), lt: today } } }),
    db.followUp.count({ where: { deletedAt: null, dueDate: { gte: today, lte: todayEnd }, status: { in: ["PENDING", "IN_PROGRESS"] } } }),
    db.incident.count({ where: { deletedAt: null, status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    getOpenIncidentsTrend(8),
    db.incident.count({
      where: {
        deletedAt: null,
        severity: "MAJOR",
        incidentDate: { gte: daysAgo(7) },
      },
    }),
    db.incident.count({
      where: {
        deletedAt: null,
        severity: "MAJOR",
        incidentDate: { gte: daysAgo(14), lt: daysAgo(7) },
      },
    }),
    db.counselingSession.findMany({
      where: { deletedAt: null, sessionDate: { gte: today, lte: todayEnd } },
      include: { student: true },
      orderBy: { startTime: "asc" },
    }),
    db.followUp.findMany({
      where: { deletedAt: null, dueDate: { gte: today, lte: todayEnd }, status: { in: ["PENDING", "IN_PROGRESS"] } },
      include: { student: true },
    }),
    db.followUp.findMany({
      where: { deletedAt: null, dueDate: { lt: today }, status: { in: ["PENDING", "IN_PROGRESS"] } },
      include: { student: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.followUp.findMany({
      where: {
        deletedAt: null,
        dueDate: { gt: todayEnd, lte: daysFromNow(3) },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      include: { student: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.incident.findMany({
      where: { deletedAt: null },
      include: { primaryStudent: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.counselingSession.findMany({
      where: { deletedAt: null },
      include: { student: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getBehaviorTrend(8),
  ]);

  const trailingDailyAvg = sessionsTrailing7d / 7;
  const sessionsDelta = Math.round(sessionsToday - trailingDailyAvg);
  const majorIncidentsDelta = majorIncidentsThisWeek - majorIncidentsPriorWeek;
  const openIncidentsSparkline = openIncidentsTrend.map((t) => t.count);

  // A warm, data-driven greeting — the friendly front door to the day rather
  // than a bare "Dashboard" title. The time-of-day itself is resolved on the
  // client (see GreetingHero) so it follows the visitor's local clock, not the
  // UTC server.
  const session = await auth();
  const firstName = (session?.user?.name ?? "Counselor").split(" ")[0];

  const overdueCount = overdueFollowUps.length;
  const scheduleBits: string[] = [];
  if (sessionsToday) scheduleBits.push(`${sessionsToday} session${sessionsToday > 1 ? "s" : ""}`);
  if (followUpsDueToday)
    scheduleBits.push(`${followUpsDueToday} follow-up${followUpsDueToday > 1 ? "s" : ""}`);

  let summary: string;
  if (scheduleBits.length === 0 && openIncidents === 0) {
    summary = "A clear board today — a great moment to catch up on notes. ☕";
  } else if (scheduleBits.length === 0) {
    summary = "Nothing on the calendar today — a lighter one.";
  } else {
    summary = `You've got ${scheduleBits.join(" and ")} on deck today.`;
  }
  if (overdueCount > 0) {
    summary += ` ${overdueCount} follow-up${overdueCount > 1 ? "s are" : " is"} overdue, though.`;
  }

  const cta =
    overdueCount > 0
      ? { href: "/follow-ups", label: `Clear ${overdueCount} overdue`, icon: "list" as const }
      : { href: "/counseling/new", label: "New session", icon: "plus" as const };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <GreetingHero firstName={firstName} summary={summary} cta={cta} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile
          icon={MessagesSquare}
          label="Sessions today"
          value={sessionsToday}
          delta={{
            value: sessionsDelta,
            comparedTo: "vs 7-day avg",
            goodDirection: "neutral",
          }}
        />
        <StatTile
          icon={ListChecks}
          label="Follow-ups due today"
          value={followUpsDueToday}
          emphasis={followUpsDueToday > 0 ? "attention" : "reference"}
        />
        <StatTile
          icon={AlertTriangle}
          label="Open incidents"
          value={openIncidents}
          emphasis={openIncidents > 0 ? "attention" : "reference"}
          trend={openIncidentsSparkline.length >= 2 ? openIncidentsSparkline : undefined}
        />
        <StatTile
          icon={ShieldAlert}
          label="Major incidents (7d)"
          value={majorIncidentsThisWeek}
          delta={{
            value: majorIncidentsDelta,
            comparedTo: "vs prior week",
            goodDirection: "down",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" />
              Today&apos;s schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {todaysSessions.length === 0 && todaysFollowUps.length === 0 ? (
              <p className="text-muted-foreground">
                Nothing on the calendar today — enjoy the calm. 🌤️
              </p>
            ) : (
              <>
                {todaysSessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <Link href={`/counseling/${s.id}`} className="hover:underline">
                      {s.startTime ?? ""} {formatStudentName(s.student)}
                    </Link>
                    <Badge variant="outline">Session</Badge>
                  </div>
                ))}
                {todaysFollowUps.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <Link href={`/students/${f.student.id}`} className="hover:underline">
                      {f.title} — {formatStudentName(f.student)}
                    </Link>
                    <Badge variant="outline">Follow-up</Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="size-4" />
              Follow-up alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {overdueFollowUps.length === 0 && dueSoonFollowUps.length === 0 ? (
              <p className="text-muted-foreground">
                All clear — no follow-ups need chasing. 🎉
              </p>
            ) : (
              <>
                {overdueFollowUps.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <Link href={`/students/${f.student.id}`} className="hover:underline">
                      {f.title} — {formatStudentName(f.student)}
                    </Link>
                    <StatusBadge level="critical" label="Overdue" />
                  </div>
                ))}
                {dueSoonFollowUps.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <Link href={`/students/${f.student.id}`} className="hover:underline">
                      {f.title} — {formatStudentName(f.student)}
                    </Link>
                    <StatusBadge level="warning" label="Due soon" />
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4" />
            Recent activity
          </CardTitle>
          <CardDescription>Case summaries only — session notes stay in the case record.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {[...recentIncidents.map((i) => ({
            id: i.id,
            href: `/incidents/${i.id}`,
            label: `Incident ${i.incidentNumber} — ${formatStudentName(i.primaryStudent)}`,
            date: i.createdAt,
          })), ...recentSessions.map((s) => ({
            id: s.id,
            href: `/counseling/${s.id}`,
            label: `Counseling session — ${formatStudentName(s.student)}`,
            date: s.createdAt,
          }))]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 8)
            .map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
                <span className="tabular-nums text-muted-foreground">{item.date.toLocaleDateString()}</span>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Behavior trend — last 8 weeks</CardTitle>
        </CardHeader>
        <CardContent>
          <MagnitudeBarChart data={behaviorTrend} dataKey="count" labelKey="week" emphasizeMax />
        </CardContent>
      </Card>
    </div>
  );
}
