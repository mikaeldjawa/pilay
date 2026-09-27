import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/date";
import { AcademicYearEditDialog } from "@/components/settings/academic-year-edit-dialog";
import { AcademicYearCurrentCell } from "@/components/settings/academic-year-current-cell";
import { AcademicYearCreateForm } from "@/components/settings/academic-year-create-form";
import { LookupRowDeleteButton } from "@/components/settings/lookup-row-delete-button";
import type { ActionState } from "@/modules/students/student.actions";

type AcademicYearRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

export function AcademicYearManager({
  years,
  deleteAction,
}: {
  years: AcademicYearRow[];
  deleteAction: (id: string) => Promise<ActionState>;
}) {
  return (
    <div className='flex flex-col gap-3'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className='text-right'>Current</TableHead>
            <TableHead className='w-10' />
            <TableHead className='w-10' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((y) => (
            <TableRow key={y.id}>
              <TableCell>{y.name}</TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDate(y.startDate)}
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDate(y.endDate)}
              </TableCell>
              <TableCell className='text-right'>
                <AcademicYearCurrentCell id={y.id} isCurrent={y.isCurrent} />
              </TableCell>
              <TableCell>
                <AcademicYearEditDialog
                  key={`${y.id}:${y.name}:${y.startDate.getTime()}:${y.endDate.getTime()}`}
                  year={y}
                />
              </TableCell>
              <TableCell>
                <LookupRowDeleteButton
                  id={y.id}
                  name={y.name}
                  entityLabel='Academic year'
                  deleteAction={deleteAction}
                />
              </TableCell>
            </TableRow>
          ))}
          {years.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-center text-muted-foreground'
              >
                No academic years yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AcademicYearCreateForm />
    </div>
  );
}
