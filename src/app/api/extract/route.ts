import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.name.endsWith(".pdf")) {
      const data = await pdf(buffer);
      text = data.text;
    } else if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
