import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as storage from "@/modules/documents/storage.service";
import { logAudit } from "@/modules/audit/audit.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const report = await db.generatedReport.findUnique({ where: { id } });
  if (!report || !report.storageKey || report.status !== "READY") {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = await storage.get(report.storageKey);

  await logAudit(db, {
    userId: session.user.id,
    action: "DOWNLOAD",
    entityType: "generated_report",
    entityId: report.id,
  });

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${report.fileName ?? "report.pdf"}"`,
    },
  });
}
