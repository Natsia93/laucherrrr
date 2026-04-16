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
        const result = await pdfParse(buffer);
        extractedText = result.text;
        
        if (extractedText.trim().length < 50) {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = "Extract all text from this PDF document accurately, preserving table structures. Return ONLY the text found.";
          const result = await model.generateContent([
            prompt,
            { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } }
          ]);
          extractedText = result.response.text();
        }
      } catch (err: any) {
        console.log("PDF Parsing error, attempting Gemini OCR...");
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent([
            "Extract text from this PDF including all tables. Return ONLY text.",
            { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } }
          ]);
          extractedText = result.response.text();
        } catch (geminiErr: any) {
          throw new Error(`Gagal OCR PDF: ${geminiErr.message || "Unknown AI error"}`);
        }
      }
    } 
    else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (err: any) {
        throw new Error("Gagal membaca DOCX.");
      }
    }
    else if (fileType.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].some(ext => fileName.endsWith(ext))) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
          "Extract all text and tables from this image accurately. Return ONLY the text.",
          { inlineData: { data: buffer.toString("base64"), mimeType: fileType.startsWith("image/") ? fileType : "image/jpeg" } }
        ]);
        extractedText = result.response.text();
      } catch (err: any) {
        throw new Error(`Gagal OCR Gambar: ${err.message || "Unknown AI error"}`);
      }
    }
    else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("File kosong atau tidak terbaca.");
    }

    const charLimit = 50000;
    if (extractedText.length > charLimit) {
      extractedText = extractedText.substring(0, charLimit) + "... [Dipotong]";
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ 
      error: error.message || "Gagal memproses file." 
    }, { status: 500 });
  }
}
