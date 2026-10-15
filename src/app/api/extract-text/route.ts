import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
// @ts-ignore
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
// Force Node.js runtime for mammoth and pdf-parse
export const runtime = "nodejs";
// Max duration for Vercel execution (60 seconds)
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Guard 1: File Size Limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File terlalu besar. Maksimal 10MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // ═══════════════════════════════════════════════════════════
      // STRATEGI PEMBACAAN PDF (3 LAPIS KEAMANAN)
      // Lapis 1: pdf-parse (cepat tapi sering berantakan)
      // Lapis 2: Gemini + raw text (pembersihan AI)
      // Lapis 3: Gemini + binary PDF (OCR penuh)
      // ═══════════════════════════════════════════════════════════
      
      let rawText = "";
      
      // LAPIS 1: Coba pdf-parse dulu (cepat & gratis)
      try {
        const rawResult = await pdfParse(buffer);
        rawText = (rawResult.text || "").trim();
        console.log(`[PDF] pdf-parse berhasil: ${rawText.length} karakter`);
      } catch (err: any) {
        console.log(`[PDF] pdf-parse gagal (${err.message}), lanjut ke Gemini OCR...`);
        rawText = "";
      }
      
      // LAPIS 2 & 3: Gunakan Gemini untuk membersihkan atau OCR
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `Anda adalah ASISTEN PEMBACA DOKUMEN. Tugas Anda adalah mengekstrak SELURUH teks dari dokumen kurikulum ini.

ATURAN MUTLAK:
1. EKSTRAK SEMUA TEKS tanpa terkecuali. JANGAN meringkas atau mempersingkat.
2. Pertahankan struktur dokumen (Bab, Sub-bab, Poin bernomor).
3. Jika ada teks Bahasa Arab (Dalil/Ayat/Hadits), salin PERSIS SAMA termasuk harokat.
4. Buang header/footer berulang, nomor halaman, dan watermark.
5. KEMBALIKAN HANYA teks yang diekstrak. Tanpa komentar atau pengantar.
6. Identifikasi Mata Pelajaran dan Topik Utama di awal output.`;

      try {
        let result;
        if (rawText.length > 500) {
          // Lapis 2: Teks mentah cukup panjang -> minta Gemini bersihkan saja
          console.log(`[PDF] Menggunakan Gemini untuk membersihkan ${rawText.length} karakter teks mentah...`);
          result = await model.generateContent([prompt, rawText]);
        } else {
          // Lapis 3: Teks mentah gagal/kosong -> kirim file biner ke Gemini (Full OCR)
          console.log(`[PDF] Teks mentah terlalu pendek (${rawText.length}). Mengirim PDF ke Gemini untuk OCR penuh...`);
          result = await model.generateContent([
            prompt,
            { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } }
          ]);
        }
        
        extractedText = result.response.text();
        console.log(`[PDF] Gemini berhasil mengekstrak: ${extractedText.length} karakter`);
        
        // Validasi: Jika Gemini mengembalikan teks yang terlalu pendek, coba fallback
        if (extractedText.trim().length < 100 && rawText.length > 100) {
          console.log(`[PDF] Gemini output terlalu pendek, menggunakan rawText sebagai fallback.`);
          extractedText = rawText;
        }
      } catch (geminiErr: any) {
        console.error(`[PDF] Gemini gagal: ${geminiErr.message}`);
        // Fallback terakhir: gunakan raw text jika ada
        if (rawText.length > 50) {
          console.log(`[PDF] Menggunakan rawText sebagai fallback terakhir.`);
          extractedText = rawText;
        } else {
          throw new Error(`Gagal memproses PDF. Silakan coba file yang berbeda atau konversi ke .docx terlebih dahulu.`);
        }
      }
    } 
    else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (err: any) {
        throw new Error("Gagal membaca file Word (.docx).");
      }
    }
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileType === "application/vnd.ms-excel" ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".csv")
    ) {
      try {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetSections: string[] = [];

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv && csv.trim()) {
            sheetSections.push(`### Lembar: ${sheetName}\n\`\`\`csv\n${csv.trim()}\n\`\`\``);
          }
        }

        extractedText = sheetSections.length > 0
          ? `[DOKUMEN SPREADSHEET EXCEL: ${file.name}]\n\n` + sheetSections.join("\n\n")
          : "Spreadsheet Excel kosong.";
      } catch (err: any) {
        console.error("[Excel] Extraction error:", err);
        throw new Error("Gagal membaca file spreadsheet Excel (.xlsx / .xls).");
      }
    }
    else if (
      fileType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".json")
    ) {
      extractedText = buffer.toString("utf-8");
    }
    else {
      // Fallback for plain text or unsupported
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("Teks tidak dapat ditemukan dalam dokumen ini. Coba konversi ke .docx terlebih dahulu.");
    }

    // Batas karakter: 100.000 (~50-80 halaman)
    const charLimit = 100000;
    if (extractedText.length > charLimit) {
      extractedText = extractedText.substring(0, charLimit) + "... [Teks dipotong karena melebihi batas 100rb karakter]";
    }

    console.log(`[PDF] ✅ Final output: ${extractedText.length} karakter | File: ${file.name}`);
    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("[PDF] ❌ Extraction error:", error);
    return NextResponse.json({ 
      error: error.message || "Gagal memproses dokumen." 
    }, { status: 500 });
  }
}
