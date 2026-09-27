import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePanel, TablePanelFooter } from "@/components/ui/table-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { buildHref } from "@/lib/query-string";
import { STUDENT_STATUS_VARIANT } from "@/lib/status-colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listClasses,
  listGrades,
  listStudents,
  type StudentSortKey,
} from "@/modules/students/student.repository";
import type { StudentStatus } from "@/generated/prisma/client";
import { getCurrentEnrollment } from "@/modules/students/student.service";
import { formatStudentName } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS: StudentStatus[] = ["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED", "WITHDRAWN"];
const SORT_KEYS: StudentSortKey[] = ["name", "studentId", "status"];

const PATHNAME = "/students";
const PAGE_SIZE = 25;

export default async function StudentsPage(props: PageProps<"/students">) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const gradeId = typeof searchParams.gradeId === "string" && searchParams.gradeId !== "all" ? searchParams.gradeId : undefined;
  const classId = typeof searchParams.classId === "string" && searchParams.classId !== "all" ? searchParams.classId : undefined;
  const status =
    typeof searchParams.status === "string" && STATUS_OPTIONS.includes(searchParams.status as StudentStatus)
      ? (searchParams.status as StudentStatus)
      : undefined;
  const sort =
    typeof searchParams.sort === "string" && SORT_KEYS.includes(searchParams.sort as StudentSortKey)
      ? (searchParams.sort as StudentSortKey)
      : undefined;
  const dir = searchParams.dir === "desc" ? "desc" : "asc";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;
  const archived = searchParams.archived === "true";

  const [{ students, total }, grades, classes] = await Promise.all([
    listStudents({
      search,
      gradeId,
      classId,
      status,
      archived,
      sort,
      dir,
      page,
      pageSize: PAGE_SIZE,
    }),
    listGrades(),
    listClasses(),
  ]);

  const gradeItems = [{ value: "all", label: "All grades" }, ...grades.map((g) => ({ value: g.id, label: g.name }))];
  const classItems = [{ value: "all", label: "All classes" }, ...classes.map((c) => ({ value: c.id, label: c.name }))];
  const statusItems = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title={archived ? "Archived students" : "Students"}
        description={`${total} ${archived ? "archived " : ""}student(s)`}
        actions={
          <>
            <Button variant='outline' render={<Link href='/students/import' />} nativeButton={false}>
              <Upload />
              Import
            </Button>
            <Button render={<Link href='/students/new' />} nativeButton={false}>
              <Plus />
              New student
            </Button>
          </>
        }
      />

      <TablePanel
        toolbar={
          <form className='flex flex-wrap items-center gap-2'>
        <Input
          name='q'
          className='max-w-sm'
          placeholder='Search by name or student ID...'
          defaultValue={search}
        />
        {archived ? <input type='hidden' name='archived' value='true' /> : null}
        <Select name='gradeId' defaultValue={gradeId ?? "all"} items={gradeItems}>
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {gradeItems.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name='classId' defaultValue={classId ?? "all"} items={classItems}>
          <SelectTrigger className='w-44'>
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
        <Select name='status' defaultValue={status ?? "all"} items={statusItems}>
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sort ? <input type='hidden' name='sort' value={sort} /> : null}
        {dir ? <input type='hidden' name='dir' value={dir} /> : null}
        <Button type='submit' variant='outline'>
          Filter
        </Button>
        <Button variant='ghost' render={<Link href={PATHNAME} />} nativeButton={false}>
          Clear
        </Button>
        <Button
          variant='ghost'
          render={<Link href={buildHref(PATHNAME, searchParams, { archived: archived ? undefined : "true", page: undefined })} />}
          nativeButton={false}
        >
          {archived ? "Show active" : "Show archived"}
        </Button>
          </form>
        }
      >

      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              label='Name'
              sortKey='name'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <SortableTableHead
              label='Student ID'
              sortKey='studentId'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Grade / Class</TableHead>
            <SortableTableHead
              label='Status'
              sortKey='status'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState
                  illustration='siblings'
                  title={archived ? "No archived students" : "No students yet"}
                  description={
                    archived
                      ? "Students you archive will show up here."
                      : "Add students to start tracking their support and progress."
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => {
              const enrollment = getCurrentEnrollment(student);
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <Link
                      href={`/students/${student.id}`}
                      className='font-medium hover:underline'
                    >
                      {formatStudentName(student)}
                    </Link>
                  </TableCell>
                  <TableCell className='text-muted-foreground tabular-nums'>
                    {student.studentId}
                  </TableCell>
                  <TableCell>
                    {enrollment
                      ? `${enrollment.grade.name} — ${enrollment.class.name}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STUDENT_STATUS_VARIANT[student.status]}>
                      {student.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
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
