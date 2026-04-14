import { GoogleGenerativeAI } from "@google/generative-ai";
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { rawPrompt, type = "Dokumen Kurikulum", model: requestedModel = "deepseek", image } = body;

    // Detect Language
    const isArabic = rawPrompt.toLowerCase().includes("bahasa arab") || 
                     rawPrompt.toLowerCase().includes("pondok") || 
                     rawPrompt.toLowerCase().includes("tasykil") ||
                     type === "LKPD (Arabic Mode)";

    // System Prompts (simplified for brevity here, but usually very specific)
    const lkpdPrompt = `Tugas Anda adalah membuat Lembar Kerja Peserta Didik (LKPD) profesional dan estetik.
    BAHASA: ${isArabic ? "Arab Ber-Harokat (Tasykil)" : "Indonesia formal"}.
    URUTAN: Pilihan Ganda -> Jawaban Singkat -> Esai.
    LAYOUT: Gunakan tabel dengan border hitam tegas. Font Arab: 'Noto Naskh Arabic'.
    MULAI LANGSUNG DENGAN TAG <div>. JANGAN PAKAI MARKDOWN (\`\`\`).`;

    const atpPrompt = `Anda adalah pakar kurikulum Merdeka. Buatkan ATP lengkap untuk materi: ${rawPrompt}. 
    Ikuti standar 046/2025. Gunakan tabel A4 profesional. 
    MULAI LANGSUNG DENGAN TAG <div>. JANGAN PAKAI MARKDOWN (\`\`\`).`;
    
    // Choose appropriate prompt
    const systemPrompt = type.includes("LKPD") ? lkpdPrompt : atpPrompt;

    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
        };

        try {
          send({ type: "stage", stage: 0, label: "Menganalisis Konteks & File..." });

          // If image is present, WE MUST USE GEMINI
          const useGemini = !!image || requestedModel === "gemini";
          let providerUsed = useGemini ? "Gemini 2.0 Flash" : "DeepSeek V3";

          if (useGemini) {
            send({ type: "stage", stage: 1, label: image ? "Menganalisis Gambar & Dokumen..." : "Menyusun dengan Gemini..." });
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            const parts: any[] = [{ text: `${systemPrompt}\n\nINSTRUKSI GURU: ${rawPrompt}` }];
            if (image) {
                const base64Data = image.split(",")[1];
                const mimeType = image.split(";")[0].split(":")[1];
                parts.push({
                    inlineData: { data: base64Data, mimeType }
                });
            }

            const result = await model.generateContentStream(parts);
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                fullText += text;
                send({ type: "chunk", text });
              }
            }
          } else {
            send({ type: "stage", stage: 1, label: "Menyusun dengan DeepSeek..." });
            const completion = await deepseek.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: rawPrompt }
              ],
              model: "deepseek-chat", 
              stream: true,
            });
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                fullText += text;
                send({ type: "chunk", text });
              }
            }
          }

          if (fullText.length > 0) {
            send({ type: "stage", stage: 3, label: "Menyimpan ke database..." });
            
            let cleanedText = fullText.trim()
                .replace(/^```html/, "")
                .replace(/```$/, "")
                .trim();
            
            // Extra cleaning for prefixes
            const firstTag = cleanedText.indexOf("<div");
            if (firstTag !== -1) {
                cleanedText = cleanedText.substring(firstTag);
            }

            const [newDoc] = await db.insert(documents).values({
              title: `${type} - ${rawPrompt.substring(0, 30)}`,
              type: type,
              userId: session.user.id,
              content: cleanedText,
              status: "Selesai",
              size: `${(cleanedText.length / 1024).toFixed(1)} KB`,
            }).returning();
            send({ type: "done", docId: newDoc.id, provider: providerUsed });
          } else {
            send({ type: "error", message: "Gagal menghasilkan konten." });
          }
          controller.close();
        } catch (error: any) {
          console.error("Stream error:", error);
          send({ type: "error", message: error.message });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}