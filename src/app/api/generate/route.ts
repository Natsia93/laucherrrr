import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const body = await req.json();
    const { rawPrompt, type = "Dokumen Kurikulum" } = body;

    const systemPrompt = `Anda adalah pakar Kurikulum Merdeka di Indonesia yang bertugas membantu Guru menyusun dokumen ${type} secara SUPER DETAIL dan PROFESIONAL.
    
    Permintaan: "${rawPrompt}"
    
    ATURAN:
    1. Langsung mulai dengan HTML (<div>). JANGAN gunakan markdown code fences.
    2. Gunakan tabel dengan border, padding, dan styling inline.
    3. Minimal 1500 kata.
    4. Sertakan tanda tangan Kepala Sekolah dan Guru di akhir dokumen.`;

    let generatedText = "";
    let providerUsed = "Gemini";

    try {
      const completion = await deepseek.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 8192,
      });
      generatedText = completion.choices[0].message.content || "";
      providerUsed = "DeepSeek V3";
    } catch (deepseekError) {
      console.warn("DeepSeek failed, trying Gemini...", deepseekError);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(systemPrompt);
        generatedText = result.response.text();
        providerUsed = "Gemini 2.0 Flash";
      } catch (geminiError) {
        console.warn("Gemini 2.0 failed, trying 1.5...", geminiError);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt);
        generatedText = result.response.text();
        providerUsed = "Gemini 1.5 Flash";
      }
    }

    // Clean up markdown fences if leaked
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith("```html")) {
      cleanedText = cleanedText.replace(/^```html\s*/, "").replace(/```\s*$/, "").trim();
    }

    const [newDoc] = await db.insert(documents).values({
      title: `${type} - ${rawPrompt.substring(0, 40)}...`,
      type: type,
      userId: user.id,
      content: cleanedText,
      status: "Selesai",
      size: `${(cleanedText.length / 1024).toFixed(1)} KB`,
    }).returning();

    return NextResponse.json({ success: true, data: newDoc, provider: providerUsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Critical Generate Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
