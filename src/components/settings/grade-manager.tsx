import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GradeEditDialog } from "@/components/settings/grade-edit-dialog";
import { GradeCreateForm } from "@/components/settings/grade-create-form";
import { LookupRowDeleteButton } from "@/components/settings/lookup-row-delete-button";
import type { ActionState } from "@/modules/students/student.actions";

type GradeRow = {
  id: string;
  name: string;
  level: number;
};

export function GradeManager({
  grades,
  deleteAction,
}: {
  grades: GradeRow[];
  deleteAction: (id: string) => Promise<ActionState>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Level</TableHead>
            <TableHead className="w-10" />
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.map((g) => (
            <TableRow key={g.id}>
              <TableCell>{g.name}</TableCell>
              <TableCell className="text-muted-foreground">{g.level}</TableCell>
              <TableCell>
                <GradeEditDialog key={`${g.id}:${g.name}:${g.level}`} grade={g} />
              </TableCell>
              <TableCell>
                <LookupRowDeleteButton
                  id={g.id}
                  name={g.name}
                  entityLabel="Grade"
                  deleteAction={deleteAction}
                />
              </TableCell>
            </TableRow>
          ))}
          {grades.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No grades yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <GradeCreateForm />
    </div>
  );
}
