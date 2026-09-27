import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassEditDialog } from "@/components/settings/class-edit-dialog";
import { ClassCreateForm } from "@/components/settings/class-create-form";
import { LookupRowDeleteButton } from "@/components/settings/lookup-row-delete-button";
import type { ActionState } from "@/modules/students/student.actions";

type ClassRow = {
  id: string;
  name: string;
  homeroomTeacher: string | null;
  gradeId: string;
  academicYearId: string;
  grade: { name: string };
  academicYear: { name: string };
};

type Option = { id: string; label: string };

export function ClassManager({
  classes,
  academicYears,
  grades,
  deleteAction,
}: {
  classes: ClassRow[];
  academicYears: Option[];
  grades: Option[];
  deleteAction: (id: string) => Promise<ActionState>;
}) {
  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const gradeItems = grades.map((g) => ({ value: g.id, label: g.label }));
  const academicYearItems = academicYears.map((y) => ({ value: y.id, label: y.label }));

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Academic year</TableHead>
            <TableHead>Homeroom teacher</TableHead>
            <TableHead className="w-10" />
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.grade.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.academicYear.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.homeroomTeacher ?? "—"}</TableCell>
              <TableCell>
                <ClassEditDialog
                  key={`${c.id}:${c.name}:${c.gradeId}:${c.academicYearId}:${c.homeroomTeacher ?? ""}`}
                  cls={c}
                  gradeItems={gradeItems}
                  academicYearItems={academicYearItems}
                />
              </TableCell>
              <TableCell>
                <LookupRowDeleteButton
                  id={c.id}
                  name={c.name}
                  entityLabel="Class"
                  deleteAction={deleteAction}
                />
              </TableCell>
            </TableRow>
          ))}
          {classes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No classes yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ClassCreateForm gradeItems={gradeItems} academicYearItems={academicYearItems} />
    </div>
  );
}
