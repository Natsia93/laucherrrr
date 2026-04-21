import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
// @ts-ignore
import pdfParse from "pdf-parse";
// Force Node.js runtime for mammoth and pdf-parse
export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Guard 1: File Size Limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File terlalu besar. Maksimal 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        // Step 1: Attempt raw extraction to see if we can get a quick result
        const rawResult = await pdfParse(buffer);
        const rawText = rawResult.text || "";
        
        // Step 2: Use Gemini 1.5 Flash as the High-Precision "Refiner" or OCR
        // This is necessary because textbooks have complex layouts that raw pdf-parse ruins.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        // We send either the raw text (if available) or the actual file buffer (OCR)
        const prompt = `Extract and clean all text from this curriculum document. 
          REQUIREMENTS:
          1. Preserve the structural meaning (Chapters, Sub-chapters, Points).
          2. IMPORTANT: If there is Arabic text with Harokat (Dalil/Quran/Hadith), capture it EXACTLY with the harokat.
          3. Remove any garbage characters, page numbers in the middle of sentences, or header/footer repetitions.
          4. Return ONLY the cleaned, readable text. No conversational filler.`;

        let result;
        if (rawText.trim().length > 500) {
          // If raw text is decent, have Gemini clean it up to save tokens/speed
          result = await model.generateContent([prompt, rawText]);
        } else {
          // If raw text is poor or empty, perform full Visual OCR on the PDF
          result = await model.generateContent([
            prompt,
            { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } }
          ]);
        }
        
        extractedText = result.response.text();
      } catch (err: any) {
        console.error("Advanced PDF Parsing error:", err);
        throw new Error(`Gagal memproses PDF dengan presisi tinggi: ${err.message}`);
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
    else {
      // Fallback for plain text or unsupported
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("Teks tidak dapat ditemukan dalam dokumen ini.");
    }

    const charLimit = 100000;
    if (extractedText.length > charLimit) {
      extractedText = extractedText.substring(0, charLimit) + "... [Teks dipotong karena melebihi batas 100rb karakter]";
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ 
      error: error.message || "Gagal memproses dokumen." 
    }, { status: 500 });
  }
}
