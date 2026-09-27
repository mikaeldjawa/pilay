import { AcademicYearManager } from "@/components/settings/academic-year-manager";
import { ClassManager } from "@/components/settings/class-manager";
import { GradeManager } from "@/components/settings/grade-manager";
import { LookupTableEditor } from "@/components/settings/lookup-table-editor";
import { ReportingPeriodManager } from "@/components/settings/reporting-period-manager";
import { UpdateSettingForm } from "@/components/settings/update-setting-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import {
  createActionCodeAction,
  createBehaviorCategoryAction,
  createCounselingCategoryAction,
  createDocumentCategoryAction,
  createIncidentCategoryAction,
  createRiskDimensionAction,
  createSubjectAction,
  deleteSubjectAction,
  deleteCounselingCategoryAction,
  deleteIncidentCategoryAction,
  deleteBehaviorCategoryAction,
  deleteActionCodeAction,
  deleteRiskDimensionAction,
  deleteDocumentCategoryAction,
  deleteAcademicYearAction,
  deleteGradeAction,
  deleteClassAction,
  deleteReportingPeriodAction,
  toggleActionCodeAction,
  toggleBehaviorCategoryAction,
  toggleCounselingCategoryAction,
  toggleIncidentCategoryAction,
  toggleRiskDimensionAction,
  toggleSubjectAction,
  updateActionCodeAction,
  updateBehaviorCategoryAction,
  updateCounselingCategoryAction,
  updateDocumentCategoryAction,
  updateIncidentCategoryAction,
  updateRiskDimensionAction,
  updateSubjectAction,
} from "@/modules/settings/settings.actions";
import { BEHAVIOR_TYPES } from "@/modules/settings/settings.schema";
import {
  listSettings,
  SETTING_KEYS,
} from "@/modules/settings/settings.service";
import { listDocumentCategories } from "@/modules/documents/document.service";
import { ScrollText } from "lucide-react";
import Link from "next/link";

const SETTING_LABELS: Record<string, string> = {
  [SETTING_KEYS.SCHOOL_NAME]: "School name",
  [SETTING_KEYS.CONFIDENTIALITY_NOTICE]: "Default confidentiality notice",
  [SETTING_KEYS.TIMEZONE]: "Timezone",
};

export default async function SettingsPage() {
  const [
    settings,
    academicYears,
    grades,
    classes,
    counselingCategories,
    incidentCategories,
    behaviorCategories,
    actionCodes,
    riskDimensions,
    documentCategories,
    reportingPeriods,
    subjects,
  ] = await Promise.all([
    listSettings(),
    db.academicYear.findMany({ orderBy: { startDate: "desc" } }),
    db.grade.findMany({ orderBy: { level: "asc" } }),
    db.class.findMany({
      include: { grade: true, academicYear: true },
      orderBy: [{ academicYear: { startDate: "desc" } }, { name: "asc" }],
    }),
    db.counselingCategory.findMany({ orderBy: { name: "asc" } }),
    db.incidentCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.behaviorCategory.findMany({ orderBy: { name: "asc" } }),
    db.actionCode.findMany({ orderBy: { sortOrder: "asc" } }),
    db.riskDimension.findMany({ orderBy: { sortOrder: "asc" } }),
    listDocumentCategories(),
    db.reportingPeriod.findMany({
      include: { academicYear: true },
      orderBy: [{ academicYear: { startDate: "desc" } }, { startDate: "asc" }],
    }),
    db.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  const academicYearOptions = academicYears.map((y) => ({
    id: y.id,
    label: y.name,
  }));
  const gradeOptions = grades.map((g) => ({ id: g.id, label: g.name }));

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title='Settings'
        description='System configuration and reference data.'
        actions={
          <Button
            variant='outline'
            render={<Link href='/settings/audit-log' />}
            nativeButton={false}
          >
            <ScrollText />
            Audit log
          </Button>
        }
      />

      <Card className='bg-muted/20'>
        <CardHeader>
          <CardTitle className='text-base'>General</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          {Object.values(SETTING_KEYS).map((key) => {
            const existing = settings.find((s) => s.key === key);
            return (
              <UpdateSettingForm
                key={key}
                settingKey={key}
                label={SETTING_LABELS[key]}
                defaultValue={existing?.value ?? ""}
              />
            );
          })}
        </CardContent>
      </Card>

      <Card className='bg-muted/20'>
        <CardHeader>
          <CardTitle className='text-base'>Academic years</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicYearManager
            years={academicYears}
            deleteAction={deleteAcademicYearAction}
          />
        </CardContent>
      </Card>

      <div className='grid grid-cols-2 gap-4'>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <GradeManager grades={grades} deleteAction={deleteGradeAction} />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassManager
              classes={classes}
              academicYears={academicYearOptions}
              grades={gradeOptions}
              deleteAction={deleteClassAction}
            />
          </CardContent>
        </Card>
      </div>

      <Card className='bg-muted/20'>
        <CardHeader>
          <CardTitle className='text-base'>Reporting periods</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportingPeriodManager
            periods={reportingPeriods}
            academicYears={academicYearOptions}
            deleteAction={deleteReportingPeriodAction}
          />
        </CardContent>
      </Card>

      <div className='grid grid-cols-2 gap-4'>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Counseling categories</CardTitle>
            <CardDescription>
              Academic, Personal/Social, Behavioral, Career, Crisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={counselingCategories}
              hasDescription
              codeRequired
              createAction={createCounselingCategoryAction}
              toggleAction={toggleCounselingCategoryAction}
              updateAction={updateCounselingCategoryAction}
              deleteAction={deleteCounselingCategoryAction}
              entityLabel="Counseling category"
            />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Incident categories</CardTitle>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={incidentCategories}
              codeRequired
              createAction={createIncidentCategoryAction}
              toggleAction={toggleIncidentCategoryAction}
              updateAction={updateIncidentCategoryAction}
              deleteAction={deleteIncidentCategoryAction}
              entityLabel="Incident category"
            />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Behavior codes</CardTitle>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={behaviorCategories.map((c) => ({
                ...c,
                typeLabel: c.type,
              }))}
              typeOptions={BEHAVIOR_TYPES.map((t) => ({ value: t, label: t }))}
              createAction={createBehaviorCategoryAction}
              toggleAction={toggleBehaviorCategoryAction}
              updateAction={updateBehaviorCategoryAction}
              deleteAction={deleteBehaviorCategoryAction}
              entityLabel="Behavior code"
            />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Action codes</CardTitle>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={actionCodes}
              createAction={createActionCodeAction}
              toggleAction={toggleActionCodeAction}
              updateAction={updateActionCodeAction}
              deleteAction={deleteActionCodeAction}
              entityLabel="Action code"
            />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Risk dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={riskDimensions}
              hasCode={false}
              hasDescription
              createAction={createRiskDimensionAction}
              toggleAction={toggleRiskDimensionAction}
              updateAction={updateRiskDimensionAction}
              deleteAction={deleteRiskDimensionAction}
              entityLabel="Risk dimension"
            />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Document categories</CardTitle>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={documentCategories}
              hasCode={false}
              hasDescription
              hasActive={false}
              createAction={createDocumentCategoryAction}
              updateAction={updateDocumentCategoryAction}
              deleteAction={deleteDocumentCategoryAction}
              entityLabel="Document category"
            />
          </CardContent>
        </Card>
        <Card className='bg-muted/20'>
          <CardHeader>
            <CardTitle className='text-base'>Subjects</CardTitle>
            <CardDescription>
              Taught subjects available when creating teaching plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LookupTableEditor
              rows={subjects}
              hasCode={false}
              createAction={createSubjectAction}
              toggleAction={toggleSubjectAction}
              updateAction={updateSubjectAction}
              deleteAction={deleteSubjectAction}
              entityLabel="Subject"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
