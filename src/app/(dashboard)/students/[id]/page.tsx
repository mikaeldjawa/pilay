import { BehaviorRecordArchiveButton } from "@/components/students/behavior-record-archive-button";
import { BehaviorRecordEditDialog } from "@/components/students/behavior-record-edit-dialog";
import { GuardianArchiveButton } from "@/components/students/guardian-archive-button";
import { GuardianCreateForm } from "@/components/students/guardian-create-form";
import { GuardianEditDialog } from "@/components/students/guardian-edit-dialog";
import { ParentContactArchiveButton } from "@/components/students/parent-contact-archive-button";
import { ParentContactCreateForm } from "@/components/students/parent-contact-create-form";
import { StudentArchiveButton } from "@/components/students/student-archive-button";
import { StudentRestoreButton } from "@/components/students/student-restore-button";
import { StudentTimeline, TimelineEventRow } from "@/components/students/student-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { formatStudentName, mergeOptionalOptions } from "@/lib/utils";
import {
  listActionCodes,
  listBehaviorCategories,
  listBehaviorRecords,
} from "@/modules/behavior/behavior.repository";
import {
  listGuardiansForStudent,
  listParentContactsForStudent,
} from "@/modules/guardians/guardian.repository";
import { getStudentTimeline } from "@/modules/students/student-timeline.service";
import { findStudentById } from "@/modules/students/student.repository";
import { getCurrentEnrollment } from "@/modules/students/student.service";
import { FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StudentDetailPage(
  props: PageProps<"/students/[id]">,
) {
  const { id } = await props.params;
  const student = await findStudentById(id);
  if (!student) notFound();

  const enrollment = getCurrentEnrollment(student);
  const [
    timeline,
    sessionCount,
    incidentCount,
    openFollowUpCount,
    guardians,
    contacts,
    behaviorResult,
    activeBehaviorCategories,
    activeActionCodes,
  ] = await Promise.all([
    getStudentTimeline(student.id),
    db.counselingSession.count({ where: { studentId: id, deletedAt: null } }),
    db.incident.count({ where: { primaryStudentId: id, deletedAt: null } }),
    db.followUp.count({
      where: {
        studentId: id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        deletedAt: null,
      },
    }),
    listGuardiansForStudent(id),
    listParentContactsForStudent(id),
    listBehaviorRecords({ studentId: id, pageSize: 100 }),
    listBehaviorCategories(),
    listActionCodes(),
  ]);
  const behaviorRecords = behaviorResult.records;

  // A record's own category/action codes may have since been deactivated in
  // Settings — include them anyway so each record's edit dialog can still
  // resolve its current values to labels instead of falling back to raw ids.
  const behaviorCategories = mergeOptionalOptions(
    activeBehaviorCategories,
    behaviorRecords.flatMap((r) => r.categories.map((c) => c.behaviorCategory)),
  );
  const actionCodes = mergeOptionalOptions(
    activeActionCodes,
    behaviorRecords.flatMap((r) => r.actions.map((a) => a.actionCode)),
  );

  const positiveBehaviorCount = behaviorRecords.filter((r) =>
    r.categories.some((c) => c.behaviorCategory.type === "POSITIVE"),
  ).length;
  const negativeBehaviorCount = behaviorRecords.filter((r) =>
    r.categories.some((c) => c.behaviorCategory.type === "NEGATIVE"),
  ).length;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title={formatStudentName(student)}
        description={`${student.studentId}${enrollment ? ` — ${enrollment.grade.name}, ${enrollment.class.name}` : ""}`}
        titleBadges={
          <>
            <Badge>{student.status}</Badge>
            {student.deletedAt ? <Badge variant='destructive'>Archived</Badge> : null}
          </>
        }
        actions={
          <>
            <Button
              variant='outline'
              render={
                <Link href={`/reports/new?type=STUDENT_SUMMARY&studentId=${student.id}`} />
              }
              nativeButton={false}
            >
              <FileText />
              Generate report
            </Button>
            <Button
              variant='outline'
              render={<Link href={`/students/${student.id}/edit`} />}
              nativeButton={false}
            >
              <Pencil />
              Edit
            </Button>
            {student.deletedAt ? (
              <StudentRestoreButton studentId={student.id} />
            ) : (
              <StudentArchiveButton
                studentId={student.id}
                studentName={formatStudentName(student)}
              />
            )}
          </>
        }
      />

      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
          <TabsTrigger value='behavior'>Behavior</TabsTrigger>
          <TabsTrigger value='guardians'>Guardians</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='flex flex-col gap-4'>
          <div className='grid grid-cols-4 gap-4'>
            <StatTile label='Counseling sessions' value={sessionCount} />
            <StatTile label='Incidents' value={incidentCount} />
            <StatTile label='Behavior records' value={behaviorRecords.length} />
            <StatTile
              label='Open follow-ups'
              value={openFollowUpCount}
              emphasis={openFollowUpCount > 0 ? "attention" : "reference"}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-3 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Date of birth</p>
                <p className='tabular-nums'>
                  {student.dateOfBirth
                    ? student.dateOfBirth.toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground'>Gender</p>
                <p>{student.gender ?? "—"}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Academic year</p>
                <p>{enrollment?.academicYear.name ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <p className='whitespace-pre-wrap'>{student.notes ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-2 text-sm'>
              {timeline.length === 0 ? (
                <p className='text-muted-foreground'>No activity recorded yet.</p>
              ) : (
                timeline.slice(0, 3).map((event) => (
                  <TimelineEventRow key={`${event.type}-${event.id}`} event={event} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='timeline'>
          <StudentTimeline events={timeline} />
        </TabsContent>
        <TabsContent value='behavior' className='flex flex-col gap-4'>
          <div className='grid grid-cols-2 gap-4'>
            <StatTile label='Positive records' value={positiveBehaviorCount} />
            <StatTile
              label='Negative records'
              value={negativeBehaviorCount}
              emphasis={negativeBehaviorCount > 0 ? "attention" : "reference"}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Behavior records</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='flex flex-col gap-2 text-sm'>
                {behaviorRecords.map((r) => (
                  <li
                    key={r.id}
                    className='flex items-start justify-between gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/30'
                  >
                    <div className='flex flex-col gap-1'>
                      <p className='tabular-nums text-muted-foreground'>
                        {r.recordDate.toLocaleDateString()}
                        {r.recordTime ? ` ${r.recordTime}` : ""}
                      </p>
                      <div className='flex flex-wrap items-center gap-2'>
                        {r.categories.map((c) => (
                          <Badge
                            key={c.id}
                            variant={c.behaviorCategory.type === "POSITIVE" ? "secondary" : "outline"}
                          >
                            {c.behaviorCategory.code
                              ? `${c.behaviorCategory.code} — ${c.behaviorCategory.name}`
                              : c.behaviorCategory.name}
                          </Badge>
                        ))}
                        {r.otherBehaviorText ? (
                          <Badge variant='outline'>{r.otherBehaviorText}</Badge>
                        ) : null}
                        {r.actions.length > 0 || r.otherActionText ? (
                          <span className='text-muted-foreground'>
                            Action:{" "}
                            {[
                              ...r.actions.map((a) =>
                                a.actionCode.code ? `${a.actionCode.code} — ${a.actionCode.name}` : a.actionCode.name,
                              ),
                              r.otherActionText,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        ) : null}
                        {r.classroomReference ? (
                          <span className='text-muted-foreground'>{r.classroomReference}</span>
                        ) : null}
                      </div>
                      {r.description ? <p>{r.description}</p> : null}
                    </div>
                    <div className='flex items-center gap-1'>
                      <BehaviorRecordEditDialog
                        studentId={id}
                        behaviorCategories={behaviorCategories}
                        actionCodes={actionCodes}
                        record={{
                          id: r.id,
                          behaviorCategoryIds: r.categories.map((c) => c.behaviorCategoryId),
                          otherBehaviorText: r.otherBehaviorText,
                          recordDate: r.recordDate.toISOString().slice(0, 10),
                          recordTime: r.recordTime,
                          classroomReference: r.classroomReference,
                          actionCodeIds: r.actions.map((a) => a.actionCodeId),
                          otherActionText: r.otherActionText,
                          description: r.description,
                        }}
                      />
                      <BehaviorRecordArchiveButton
                        recordId={r.id}
                        studentId={id}
                      />
                    </div>
                  </li>
                ))}
                {behaviorRecords.length === 0 && (
                  <p className='text-muted-foreground'>
                    No behavior records on file.
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='guardians'>
          <div className='grid grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Guardians</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <ul className='flex flex-col gap-2 text-sm'>
                  {guardians.map((g) => (
                    <li
                      key={g.id}
                      className='flex items-center justify-between gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/30'
                    >
                      <span>
                        {g.guardian.fullName}{" "}
                        {g.guardian.relationship
                          ? `(${g.guardian.relationship})`
                          : ""}
                        {g.isPrimaryContact ? (
                          <Badge className='ml-2'>Primary</Badge>
                        ) : null}
                        {g.isEmergencyContact ? (
                          <Badge variant='outline' className='ml-2'>
                            Emergency
                          </Badge>
                        ) : null}
                        {g.guardian.phone ? ` — ${g.guardian.phone}` : ""}
                      </span>
                      <div className='flex items-center gap-1'>
                        <GuardianEditDialog
                          studentId={id}
                          guardian={{
                            id: g.guardian.id,
                            fullName: g.guardian.fullName,
                            relationship: g.guardian.relationship,
                            phone: g.guardian.phone,
                            email: g.guardian.email,
                            isPrimaryContact: g.isPrimaryContact,
                            isEmergencyContact: g.isEmergencyContact,
                          }}
                        />
                        <GuardianArchiveButton
                          guardianId={g.guardian.id}
                          studentId={id}
                          guardianName={g.guardian.fullName}
                        />
                      </div>
                    </li>
                  ))}
                  {guardians.length === 0 && (
                    <p className='text-muted-foreground'>No guardians on file.</p>
                  )}
                </ul>
                <GuardianCreateForm studentId={id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Parent contact log</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <ul className='flex flex-col gap-2 text-sm'>
                  {contacts.map((c) => (
                    <li
                      key={c.id}
                      className='flex items-start justify-between gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/30'
                    >
                      <div>
                        <p className='tabular-nums text-muted-foreground'>
                          {c.contactDate.toLocaleDateString()} — {c.method} —{" "}
                          {c.guardian.fullName}
                        </p>
                        <p>{c.summary}</p>
                      </div>
                      <ParentContactArchiveButton
                        contactId={c.id}
                        studentId={id}
                      />
                    </li>
                  ))}
                  {contacts.length === 0 && (
                    <p className='text-muted-foreground'>No contacts logged.</p>
                  )}
                </ul>
                <ParentContactCreateForm
                  studentId={id}
                  guardians={guardians.map((g) => ({
                    id: g.guardianId,
                    label: g.guardian.fullName,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
