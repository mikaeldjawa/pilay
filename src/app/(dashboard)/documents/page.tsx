import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { listDocuments, listDocumentCategories, type DocumentSortKey } from "@/modules/documents/document.service";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { listStudentOptions } from "@/modules/students/student.repository";
import { formatStudentName } from "@/lib/utils";

const SORT_KEYS: DocumentSortKey[] = ["date", "title"];
const PATHNAME = "/documents";
const PAGE_SIZE = 25;

export default async function DocumentsPage(props: PageProps<"/documents">) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const documentCategoryId =
    typeof searchParams.documentCategoryId === "string" && searchParams.documentCategoryId !== "all"
      ? searchParams.documentCategoryId
      : undefined;
  const sort =
    typeof searchParams.sort === "string" && SORT_KEYS.includes(searchParams.sort as DocumentSortKey)
      ? (searchParams.sort as DocumentSortKey)
      : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const [{ documents, total }, categories, students] = await Promise.all([
    listDocuments({ search, documentCategoryId, sort, dir, page, pageSize: PAGE_SIZE }),
    listDocumentCategories(),
    listStudentOptions(),
  ]);

  const categoryItems = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Documents"
        description="Document Vault — generated reports and uploaded files, all in one place."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm
            categories={categories.map((c) => ({ id: c.id, label: c.name }))}
            students={students.map((s) => ({ id: s.id, label: `${formatStudentName(s)} (${s.studentId})` }))}
          />
        </CardContent>
      </Card>

      <TablePanel
        toolbar={
          <form className="flex flex-wrap items-center gap-2">
        <Input
          name="q"
          className="max-w-sm"
          placeholder="Search by title or file name..."
          defaultValue={search}
        />
        <Select name="documentCategoryId" defaultValue={documentCategoryId ?? "all"} items={categoryItems}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sort ? <input type="hidden" name="sort" value={sort} /> : null}
        {dir ? <input type="hidden" name="dir" value={dir} /> : null}
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
            <SortableTableHead
              label="Title"
              sortKey="title"
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Category</TableHead>
            <TableHead>Student</TableHead>
            <SortableTableHead
              label="Uploaded"
              sortKey="date"
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState
                  illustration="quiet"
                  title="No documents yet"
                  description="Generated reports and uploads are stored here automatically."
                />
              </TableCell>
            </TableRow>
          ) : (
            documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  {d.generatedReportId ? (
                    <Link href={`/reports/${d.generatedReportId}`} className="font-medium hover:underline">
                      {d.title}
                    </Link>
                  ) : (
                    <a
                      href={`/api/documents/${d.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      {d.title}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{d.documentCategory.name}</Badge>
                </TableCell>
                <TableCell>
                  {d.student ? formatStudentName(d.student) : "—"}
                </TableCell>
                <TableCell className="tabular-nums">{d.createdAt.toLocaleDateString()}</TableCell>
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
