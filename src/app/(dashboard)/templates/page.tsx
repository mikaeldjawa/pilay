import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

export default async function TemplatesPage() {
  const templates = await db.reportTemplate.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Templates"
        description="Read-only in this release — a template builder is planned for a later phase."
      />
      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => {
          const definition = t.templateDefinition as { sections: string[] };
          return (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <Badge variant="outline">v{t.templateVersion}</Badge>
                </div>
                <CardDescription>{t.reportType.replaceAll("_", " ")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                  {definition.sections.map((s) => (
                    <li key={s}>{s.replaceAll("_", " ")}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
