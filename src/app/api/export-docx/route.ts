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
        @page { size: A4; margin: 20mm 15mm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
        p { text-align: justify; margin: 0 0 10pt 0; line-height: 1.5; }
        .doc-wrapper > p, .doc-wrapper > div > p { ${isArabic ? '' : 'text-indent: 0.4in;'} }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        table:not([border="0"]) th, table:not([border="0"]) td { border: 1pt solid black; }
        table[border="0"] th, table[border="0"] td { border: none !important; }
        th { background-color: #f2f2f2; padding: 8pt 6pt; font-weight: bold; text-align: center; }
        td { padding: 8pt 6pt; vertical-align: top; text-align: ${isArabic ? 'right' : 'justify'}; }
        table p { text-indent: 0 !important; margin: 0 !important; }
        h1, h2, h3, h4 { text-align: center; font-weight: bold; text-indent: 0 !important; margin: 12pt 0 8pt 0; }
        
        /* Better Arabic RTL Support */
        [dir="rtl"], .arabic-content { 
          direction: rtl; 
          text-align: right; 
          font-family: 'Noto Naskh Arabic', 'Amiri', 'Times New Roman', serif; 
          unicode-bidi: embed;
        }
        .doc-wrapper { direction: ${isArabic ? 'rtl' : 'ltr'}; }
      </style></head><body><div class="doc-wrapper">${doc.content}</div></body></html>`;

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
