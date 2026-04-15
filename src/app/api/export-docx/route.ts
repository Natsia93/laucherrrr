import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID Dokumen diperlukan" }, { status: 400 });

    // Fetch doc with ownership check
    const [doc] = await db.select().from(documents).where(
      and(eq(documents.id, id), eq(documents.userId, session.user.id))
    );
    if (!doc) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });

    // Content is already HTML from the AI generation, wrap it with Word-compatible markup
    const isArabic = doc.content.includes('dir="rtl"') || doc.content.includes('Noto Naskh Arabic');
    const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 6px; vertical-align: top; }
        [dir="rtl"] { direction: rtl; text-align: right; font-family: 'Amiri', serif; }
      </style></head><body><div ${isArabic ? 'dir="rtl"' : 'dir="ltr"'}>${doc.content}</div></body></html>`;

    const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    const buffer = new TextEncoder().encode(wordHtml);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.ms-word;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
