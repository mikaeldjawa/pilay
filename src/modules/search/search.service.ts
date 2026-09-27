import { db } from "@/lib/db";
import { formatStudentName, studentNameSearchFilter } from "@/lib/utils";

export type SearchResult = {
  type: "student" | "incident" | "report";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function search(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [students, incidents, reports] = await Promise.all([
    db.student.findMany({
      where: {
        deletedAt: null,
        OR: [
          studentNameSearchFilter(q),
          { studentId: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    db.incident.findMany({
      where: { deletedAt: null, incidentNumber: { contains: q, mode: "insensitive" } },
      take: 5,
      include: { primaryStudent: true },
    }),
    db.generatedReport.findMany({
      where: { reportNumber: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
  ]);

  return [
    ...students.map((s) => ({
      type: "student" as const,
      id: s.id,
      title: formatStudentName(s),
      subtitle: s.studentId,
      href: `/students/${s.id}`,
    })),
    ...incidents.map((i) => ({
      type: "incident" as const,
      id: i.id,
      title: i.incidentNumber,
      subtitle: formatStudentName(i.primaryStudent),
      href: `/incidents/${i.id}`,
    })),
    ...reports.map((r) => ({
      type: "report" as const,
      id: r.id,
      title: r.reportNumber,
      subtitle: r.documentTitle ?? r.reportType,
      href: `/reports/${r.id}`,
    })),
  ];
}
