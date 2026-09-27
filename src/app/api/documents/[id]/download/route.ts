import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { downloadDocument } from "@/modules/documents/document.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  let document: Awaited<ReturnType<typeof downloadDocument>>["document"];
  let data: Buffer;
  try {
    ({ document, data } = await downloadDocument(id, session.user.id));
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${document.fileName}"`,
    },
  });
}
