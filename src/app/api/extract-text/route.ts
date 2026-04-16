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
        // First try standard parsing
        const result = await pdfParse(buffer);
        extractedText = result.text;
        
        // If standard parsing yields very little text (likely a scan), fallback to Gemini OCR
        if (extractedText.trim().length < 50) {
          console.log("PDF standard parsing failed or yielded minimal text, falling back to Gemini OCR...");
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = "Extract all text from this PDF document accurately, including tables. Return ONLY the text found.";
          
          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/pdf"
              }
            }
          ]);
          extractedText = result.response.text();
        }
      } catch (err) {
        console.log("PDF parsing error, attempting Gemini OCR fallback...");
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = "Extract all text from this PDF document accurately, including tables. Return ONLY the text found.";
          
          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/pdf"
              }
            }
          ]);
          extractedText = result.response.text();
        } catch (geminiErr) {
          console.error("Gemini PDF OCR failed:", geminiErr);
          throw new Error("Gagal mengekstrak PDF. File mungkin terproteksi atau tidak terbaca.");
        }
      }
    } 
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      fileName.endsWith(".docx")
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (err) {
        throw new Error("Gagal membaca file .docx");
      }
    }
    else if (fileType.startsWith("image/")) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Extract all text from this image as accurately as possible, especially any tables or curriculum data. Return ONLY the text found.";
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: fileType
            }
          }
        ]);
        extractedText = result.response.text();
      } catch (err) {
        throw new Error("Gagal melakukan OCR pada gambar.");
      }
    }
    else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("Tidak ada teks yang ditemukan dalam file ini.");
    }

    // Guard 3: Token Safety
    const charLimit = 50000;
    if (extractedText.length > charLimit) {
      extractedText = extractedText.substring(0, charLimit) + "... [Teks dipotong karena terlalu panjang]";
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ 
      error: error.message || "Gagal mengekstrak teks. Pastikan format file benar." 
    }, { status: 500 });
  }
}
