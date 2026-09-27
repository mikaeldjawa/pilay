import Link from "next/link";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { Meter } from "@/components/ui/meter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCounselorActivitySummary,
  getSessionsByCategory,
  getRiskLevelDistribution,
  getIncidentsByCategory,
  getFollowUpCompletionRate,
} from "@/modules/analytics/analytics.service";
import { RISK_STATUS } from "@/lib/status-colors";
import type { RiskLevel } from "@/generated/prisma/client";
import { daysAgo } from "@/lib/date";
import { cn } from "@/lib/utils";

// Code-split recharts out of the analytics bundle into its own chunk.
const MagnitudeBarChart = dynamic(() => import("@/components/dashboard/bar-chart").then((m) => m.MagnitudeBarChart));
const StatusBarChart = dynamic(() => import("@/components/dashboard/status-bar-chart").then((m) => m.StatusBarChart));

const RANGE_DAYS: Record<string, number> = {
  week: 7,
  month: 30,
  semester: 182,
  year: 365,
};

export default async function AnalyticsPage(props: PageProps<"/analytics">) {
  const searchParams = await props.searchParams;
  const range = typeof searchParams.range === "string" && searchParams.range in RANGE_DAYS
    ? searchParams.range
    : "month";
  const rangeDays = RANGE_DAYS[range];
  const since = daysAgo(rangeDays);
  const priorSince = daysAgo(rangeDays * 2);
  const priorUntil = since;

  const [summary, priorSummary, sessionsByCategory, riskLevels, incidentsByCategory, followUpCompletion, priorFollowUpCompletion] =
    await Promise.all([
      getCounselorActivitySummary(since),
      getCounselorActivitySummary(priorSince, priorUntil),
      getSessionsByCategory(since),
      getRiskLevelDistribution(since),
      getIncidentsByCategory(since),
      getFollowUpCompletionRate(since),
      getFollowUpCompletionRate(priorSince, priorUntil),
    ]);

  const riskLevelsWithStatus = riskLevels.map((r) => ({
    ...r,
    level: RISK_STATUS[r.name as RiskLevel],
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Analytics"
        description="Counts and categories only — no case narrative text."
        actions={
          <nav className="flex gap-1 text-sm">
            {Object.keys(RANGE_DAYS).map((key) => (
              <Link
                key={key}
                href={`/analytics?range=${key}`}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  key === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {key}
              </Link>
            ))}
          </nav>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatTile
          label="Sessions"
          value={summary.sessions}
          delta={{
            value: summary.sessions - priorSummary.sessions,
            comparedTo: "vs prior period",
            goodDirection: "neutral",
          }}
        />
        <StatTile
          label="Incidents"
          value={summary.incidents}
          delta={{
            value: summary.incidents - priorSummary.incidents,
            comparedTo: "vs prior period",
            goodDirection: "down",
          }}
        />
        <StatTile
          label="Open follow-ups"
          value={summary.followUpsOpen}
          emphasis={summary.followUpsOpen > 0 ? "attention" : "reference"}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">Follow-up completion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-semibold tabular-nums">{followUpCompletion.rate}%</div>
            <Meter value={followUpCompletion.rate} />
            <p className="text-xs text-muted-foreground">
              {followUpCompletion.rate - priorFollowUpCompletion.rate >= 0 ? "+" : ""}
              {followUpCompletion.rate - priorFollowUpCompletion.rate}% vs prior period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions by category</CardTitle>
          </CardHeader>
          <CardContent>
            <MagnitudeBarChart data={sessionsByCategory} emphasizeMax />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk level distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBarChart data={riskLevelsWithStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incidents by category</CardTitle>
          </CardHeader>
          <CardContent>
            <MagnitudeBarChart data={incidentsByCategory} emphasizeMax />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
