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
      } catch (err) {
        console.error("PDF Parsing error:", err);
        throw err;
      }
    } 
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
    else if (fileType.startsWith("image/")) {
      // Use Gemini for OCR - Guard 2: High speed model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "Extract all text from this image as accurately as possible. Return ONLY the text found.";
      
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
    }
    else {
      // Fallback for plain text
      extractedText = buffer.toString("utf-8");
    }

    // Guard 3: Token Safety (Truncate to ~50k chars to protect context window & costs)
    const charLimit = 50000;
    if (extractedText.length > charLimit) {
      extractedText = extractedText.substring(0, charLimit) + "... [Teks dipotong karena terlalu panjang untuk keamanan sistem]";
    }

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Gagal mengekstrak teks. Pastikan format file benar." }, { status: 500 });
  }
}
