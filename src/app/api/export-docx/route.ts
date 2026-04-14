import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import htmlToDocx from "html-to-docx";
import { marked } from "marked";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID Dokumen diperlukan" }, { status: 400 });

    // 1. Ambil data dokumen dari database
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (!doc) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });

    // 2. Ubah Markdown AI menjadi HTML
    const htmlContent = await marked(doc.content);

    // 3. Konfigurasi Dokumen Word
    const docxBlob = await htmlToDocx(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    // 4. Kirim sebagai file download
    const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    const buffer = Buffer.isBuffer(docxBlob) ? new Uint8Array(docxBlob) : docxBlob;
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
