import { JournalCreateForm } from "@/components/journal/journal-create-form";
import { JournalEntryArchiveButton } from "@/components/journal/journal-entry-archive-button";
import { JournalEntryEditDialog } from "@/components/journal/journal-entry-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { StatCard } from "@/components/ui/stat-card";
import { TablePanel, TablePanelFooter } from "@/components/ui/table-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { formatStudentName } from "@/lib/utils";
import {
  getJournalStats,
  listJournalEntries,
  listLinkableBehaviorRecordsForCounselor,
  listLinkableIncidentsForCounselor,
  listLinkableSessionsForCounselor,
  type JournalSortKey,
} from "@/modules/journal/journal.repository";
import Link from "next/link";
import { redirect } from "next/navigation";

const SORT_KEYS: JournalSortKey[] = ["date"];

const PATHNAME = "/journal";
const PAGE_SIZE = 25;

export default async function JournalPage(props: PageProps<"/journal">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort =
    typeof searchParams.sort === "string" &&
    SORT_KEYS.includes(searchParams.sort as JournalSortKey)
      ? (searchParams.sort as JournalSortKey)
      : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page =
    typeof searchParams.page === "string"
      ? Math.max(1, parseInt(searchParams.page, 10) || 1)
      : 1;

  const [{ entries, total }, sessionOptions, incidentOptions, behaviorRecordOptions, stats] =
    await Promise.all([
      listJournalEntries({
        authorUserId: session.user.id,
        search,
        sort,
        dir,
        page,
        pageSize: PAGE_SIZE,
      }),
      listLinkableSessionsForCounselor(session.user.id),
      listLinkableIncidentsForCounselor(session.user.id),
      listLinkableBehaviorRecordsForCounselor(session.user.id),
      getJournalStats(session.user.id),
    ]);

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title='Journal'
        description='Your private log — cross-linked to your own casework.'
      />

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          lead
          label='Entries this month'
          value={stats.entriesThisMonth}
          delta={`${total} total`}
          spark={stats.spark}
        />
        <StatCard
          label='Linked to sessions'
          value={stats.linkedSessions}
          delta='Cross-referenced'
        />
        <StatCard
          label='Linked to incidents'
          value={stats.linkedIncidents}
          delta='Cross-referenced'
          deltaTone='flat'
        />
        <StatCard
          label='Linked behavior logs'
          value={stats.linkedBehaviorRecords}
          delta='Cross-referenced'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <JournalCreateForm
            sessionOptions={sessionOptions}
            incidentOptions={incidentOptions}
            behaviorRecordOptions={behaviorRecordOptions}
          />
        </CardContent>
      </Card>

      <TablePanel
        toolbar={
          <form className='flex flex-wrap items-center gap-2'>
            <Input
              key={search}
              name='q'
              className='w-full sm:w-56'
              placeholder='Search title or note...'
              defaultValue={search}
            />
            {sort ? <input type='hidden' name='sort' value={sort} /> : null}
            {dir ? <input type='hidden' name='dir' value={dir} /> : null}
            <Button type='submit' variant='outline' size='sm'>
              Filter
            </Button>
            <Button
              variant='ghost'
              size='sm'
              render={<Link href={PATHNAME} />}
              nativeButton={false}
            >
              Clear
            </Button>
          </form>
        }
      >

        <Table>
          <TableHeader>
          <TableRow>
            <SortableTableHead
              label='Date'
              sortKey='date'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Title</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Linked to</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState
                  illustration='privacy'
                  title='Your journal is private'
                  description='Only you can see these notes. Jot down a quick reflection to get started.'
                />
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className='tabular-nums'>
                  {entry.entryDate.toLocaleDateString()}
                  {entry.entryTime ? ` ${entry.entryTime}` : ""}
                </TableCell>
                <TableCell className='font-medium'>{entry.title}</TableCell>
                <TableCell className='max-w-md truncate text-muted-foreground'>
                  {entry.note}
                </TableCell>
                <TableCell>
                  {entry.linkedSessions.length === 0 &&
                  entry.linkedIncidents.length === 0 &&
                  entry.linkedBehaviorRecords.length === 0 ? null : (
                    <div className='flex flex-wrap gap-1'>
                      {entry.linkedSessions.map((link) => (
                        <Badge
                          key={link.id}
                          variant='info'
                          render={
                            <Link href={`/counseling/${link.counselingSessionId}`} />
                          }
                        >
                          {formatStudentName(link.counselingSession.student)}
                        </Badge>
                      ))}
                      {entry.linkedIncidents.map((link) => (
                        <Badge
                          key={link.id}
                          variant='warning'
                          render={<Link href={`/incidents/${link.incidentId}`} />}
                        >
                          {link.incident.incidentNumber}
                        </Badge>
                      ))}
                      {entry.linkedBehaviorRecords.map((link) => (
                        <Badge
                          key={link.id}
                          variant='success'
                          render={
                            <Link href={`/students/${link.behaviorRecord.studentId}`} />
                          }
                        >
                          {formatStudentName(link.behaviorRecord.student)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1'>
                    <JournalEntryEditDialog
                      entry={{
                        id: entry.id,
                        entryDate: entry.entryDate.toISOString().slice(0, 10),
                        entryTime: entry.entryTime,
                        title: entry.title,
                        note: entry.note,
                        sessionIds: entry.linkedSessions.map(
                          (l) => l.counselingSessionId,
                        ),
                        incidentIds: entry.linkedIncidents.map(
                          (l) => l.incidentId,
                        ),
                        behaviorRecordIds: entry.linkedBehaviorRecords.map(
                          (l) => l.behaviorRecordId,
                        ),
                      }}
                      sessionOptions={sessionOptions}
                      incidentOptions={incidentOptions}
                      behaviorRecordOptions={behaviorRecordOptions}
                    />
                    <JournalEntryArchiveButton id={entry.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
          </TableBody>
        </Table>

        <TablePanelFooter>
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            pathname={PATHNAME}
            searchParams={searchParams}
          />
        </TablePanelFooter>
      </TablePanel>
    </div>
  );
}
