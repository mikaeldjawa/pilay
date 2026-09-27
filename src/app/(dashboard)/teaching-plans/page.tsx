import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePanel, TablePanelFooter } from "@/components/ui/table-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listTeachingPlans,
  listAcademicYears,
  listClasses,
  listSubjects,
} from "@/modules/teaching-plans/teaching-plan.repository";
import { Plus } from "lucide-react";
import Link from "next/link";

const PATHNAME = "/teaching-plans";
const PAGE_SIZE = 25;
const SEMESTER_OPTIONS = ["1", "2"];

export default async function TeachingPlansPage(
  props: PageProps<"/teaching-plans">,
) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const academicYearId =
    typeof searchParams.academicYearId === "string" &&
    searchParams.academicYearId !== "all"
      ? searchParams.academicYearId
      : undefined;
  const semester =
    typeof searchParams.semester === "string" &&
    SEMESTER_OPTIONS.includes(searchParams.semester)
      ? parseInt(searchParams.semester, 10)
      : undefined;
  const classId =
    typeof searchParams.classId === "string" && searchParams.classId !== "all"
      ? searchParams.classId
      : undefined;
  const subjectId =
    typeof searchParams.subjectId === "string" && searchParams.subjectId !== "all"
      ? searchParams.subjectId
      : undefined;
  const page =
    typeof searchParams.page === "string"
      ? Math.max(1, parseInt(searchParams.page, 10) || 1)
      : 1;

  const [{ plans, total }, academicYears, classes, subjects] = await Promise.all([
    listTeachingPlans({
      search,
      academicYearId,
      semester,
      classId,
      subjectId,
      page,
      pageSize: PAGE_SIZE,
    }),
    listAcademicYears(),
    listClasses(),
    listSubjects(),
  ]);

  const yearItems = [
    { value: "all", label: "All years" },
    ...academicYears.map((y) => ({ value: y.id, label: y.name })),
  ];
  const semesterItems = [
    { value: "all", label: "All semesters" },
    ...SEMESTER_OPTIONS.map((s) => ({ value: s, label: `Semester ${s}` })),
  ];
  const classItems = [
    { value: "all", label: "All classes" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];
  const subjectItems = [
    { value: "all", label: "All subjects" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Teaching Plans"
        description={`${total} plan(s)`}
        actions={
          <Button render={<Link href="/teaching-plans/new" />} nativeButton={false}>
            <Plus />
            Create teaching plan
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <form className="flex flex-wrap items-center gap-2">
            <Input
              name="q"
              className="max-w-xs"
              placeholder="Search subject, class, title..."
              defaultValue={search}
            />
            <Select
              name="academicYearId"
              defaultValue={academicYearId ?? "all"}
              items={yearItems}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearItems.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="semester"
              defaultValue={semester ? String(semester) : "all"}
              items={semesterItems}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semesterItems.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="classId" defaultValue={classId ?? "all"} items={classItems}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classItems.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="subjectId"
              defaultValue={subjectId ?? "all"}
              items={subjectItems}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjectItems.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
            <Button variant="ghost" render={<Link href={PATHNAME} />} nativeButton={false}>
              Clear
            </Button>
          </form>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject / Class</TableHead>
              <TableHead>Year · Semester</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    illustration="top-user"
                    title="No teaching plans yet"
                    description="Create a plan for a class and semester — the weeks are generated for you."
                  />
                </TableCell>
              </TableRow>
            ) : (
              plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/teaching-plans/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.subject.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.class.name}</p>
                    {p.title ? (
                      <p className="text-xs text-muted-foreground">{p.title}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.academicYear.name} · Semester {p.semester}
                  </TableCell>
                  <TableCell className="text-sm">{p.teacher.fullName}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {p.plannedWeeks} / {p.totalWeeks} weeks planned
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
